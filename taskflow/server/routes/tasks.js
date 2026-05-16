import { Router } from 'express';
import pool from '../db/pool.js';
import { verifyToken } from '../middleware/auth.js';
import { userHasProjectAccess, getAccessibleTask } from '../utils/access.js';
import { VALID_STATUS, VALID_PRIORITY, TASK_COLUMNS } from '../utils/constants.js';

const router = Router();

router.use(verifyToken);

const ACCESSIBLE_TASKS_FROM = `
  FROM tasks t
  JOIN projects p ON p.id = t.project_id
  LEFT JOIN project_members pm
    ON pm.project_id = p.id AND pm.user_id = $1
  WHERE (p.owner_id = $1 OR pm.user_id IS NOT NULL)
`;

router.get('/', async (req, res, next) => {
  try {
    const { status, priority } = req.query;
    const params = [req.user.id];
    const conditions = [];

    if (status) {
      if (!VALID_STATUS.includes(status)) {
        return res.status(400).json({ message: 'Invalid status filter' });
      }
      params.push(status);
      conditions.push(`t.status = $${params.length}`);
    }

    if (priority) {
      if (!VALID_PRIORITY.includes(priority)) {
        return res.status(400).json({ message: 'Invalid priority filter' });
      }
      params.push(priority);
      conditions.push(`t.priority = $${params.length}`);
    }

    const filterClause = conditions.length ? `AND ${conditions.join(' AND ')}` : '';

    const result = await pool.query(
      `SELECT ${TASK_COLUMNS},
              p.name AS project_name,
              p.color AS project_color,
              u.name AS assignee_name,
              u.avatar_url AS assignee_avatar_url
       ${ACCESSIBLE_TASKS_FROM}
       LEFT JOIN users u ON u.id = t.assigned_to
       ${filterClause}
       ORDER BY t.created_at DESC`,
      params
    );

    res.json({ tasks: result.rows });
  } catch (err) {
    next(err);
  }
});

router.get('/:id/comments', async (req, res, next) => {
  try {
    const taskId = parseInt(req.params.id, 10);

    if (Number.isNaN(taskId)) {
      return res.status(400).json({ message: 'Invalid task id' });
    }

    const task = await getAccessibleTask(req.user.id, taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const result = await pool.query(
      `SELECT c.id, c.task_id, c.user_id, c.content, c.created_at,
              u.name AS user_name,
              u.avatar_url AS user_avatar_url
       FROM task_comments c
       JOIN users u ON u.id = c.user_id
       WHERE c.task_id = $1
       ORDER BY c.created_at ASC`,
      [taskId]
    );

    res.json({ comments: result.rows });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/comments', async (req, res, next) => {
  try {
    const taskId = parseInt(req.params.id, 10);
    const { content } = req.body;

    if (Number.isNaN(taskId)) {
      return res.status(400).json({ message: 'Invalid task id' });
    }

    if (!content?.trim()) {
      return res.status(400).json({ message: 'Comment content is required' });
    }

    const task = await getAccessibleTask(req.user.id, taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const canComment = await userHasProjectAccess(req.user.id, task.project_id, 'viewer');
    if (!canComment) {
      return res.status(403).json({ message: 'You do not have permission to comment on this task' });
    }

    const insert = await pool.query(
      `INSERT INTO task_comments (task_id, user_id, content)
       VALUES ($1, $2, $3)
       RETURNING id, task_id, user_id, content, created_at`,
      [taskId, req.user.id, content.trim()]
    );

    const comment = insert.rows[0];
    const userResult = await pool.query(
      'SELECT name, avatar_url FROM users WHERE id = $1',
      [req.user.id]
    );
    const user = userResult.rows[0];

    res.status(201).json({
      comment: {
        ...comment,
        user_name: user?.name,
        user_avatar_url: user?.avatar_url,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const taskId = parseInt(req.params.id, 10);

    if (Number.isNaN(taskId)) {
      return res.status(400).json({ message: 'Invalid task id' });
    }

    const task = await getAccessibleTask(req.user.id, taskId);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json({ task });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const {
      title,
      description = '',
      status = 'todo',
      priority = 'medium',
      due_date = null,
      project_id,
      assigned_to = null,
    } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({ message: 'Title is required' });
    }

    if (!project_id) {
      return res.status(400).json({ message: 'project_id is required' });
    }

    if (!VALID_STATUS.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    if (!VALID_PRIORITY.includes(priority)) {
      return res.status(400).json({ message: 'Invalid priority' });
    }

    const canCreate = await userHasProjectAccess(req.user.id, project_id, 'member');
    if (!canCreate) {
      return res.status(403).json({ message: 'You do not have permission to create tasks in this project' });
    }

    const result = await pool.query(
      `INSERT INTO tasks (
         title, description, status, priority,
         project_id, assigned_to, due_date, created_by
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, title, description, status, priority,
                 project_id, assigned_to, due_date, created_by,
                 created_at, updated_at`,
      [
        title.trim(),
        description.trim(),
        status,
        priority,
        project_id,
        assigned_to,
        due_date || null,
        req.user.id,
      ]
    );

    res.status(201).json({ task: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

router.patch('/:id/status', async (req, res, next) => {
  try {
    const taskId = parseInt(req.params.id, 10);
    const { status } = req.body;

    if (Number.isNaN(taskId)) {
      return res.status(400).json({ message: 'Invalid task id' });
    }

    if (!status || !VALID_STATUS.includes(status)) {
      return res.status(400).json({ message: 'Valid status is required' });
    }

    const existing = await getAccessibleTask(req.user.id, taskId);
    if (!existing) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const canEdit = await userHasProjectAccess(req.user.id, existing.project_id, 'member');
    if (!canEdit) {
      return res.status(403).json({ message: 'You do not have permission to update this task' });
    }

    const result = await pool.query(
      `UPDATE tasks
       SET status = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING id, title, description, status, priority,
                 project_id, assigned_to, due_date, created_by,
                 created_at, updated_at`,
      [status, taskId]
    );

    res.json({ task: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const taskId = parseInt(req.params.id, 10);

    if (Number.isNaN(taskId)) {
      return res.status(400).json({ message: 'Invalid task id' });
    }

    const existing = await getAccessibleTask(req.user.id, taskId);
    if (!existing) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const canEdit = await userHasProjectAccess(req.user.id, existing.project_id, 'member');
    if (!canEdit) {
      return res.status(403).json({ message: 'You do not have permission to update this task' });
    }

    const {
      title = existing.title,
      description = existing.description,
      status = existing.status,
      priority = existing.priority,
      project_id = existing.project_id,
      assigned_to = existing.assigned_to,
      due_date = existing.due_date,
    } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({ message: 'Title cannot be empty' });
    }

    if (!VALID_STATUS.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    if (!VALID_PRIORITY.includes(priority)) {
      return res.status(400).json({ message: 'Invalid priority' });
    }

    const canMove = await userHasProjectAccess(req.user.id, project_id, 'member');
    if (!canMove) {
      return res.status(403).json({ message: 'You do not have access to the target project' });
    }

    await pool.query(
      `UPDATE tasks
       SET title = $1,
           description = $2,
           status = $3,
           priority = $4,
           project_id = $5,
           assigned_to = $6,
           due_date = $7,
           updated_at = NOW()
       WHERE id = $8`,
      [
        title.trim(),
        description?.trim() ?? '',
        status,
        priority,
        project_id,
        assigned_to,
        due_date || null,
        taskId,
      ]
    );

    const task = await getAccessibleTask(req.user.id, taskId);
    res.json({ task });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const taskId = parseInt(req.params.id, 10);

    if (Number.isNaN(taskId)) {
      return res.status(400).json({ message: 'Invalid task id' });
    }

    const existing = await getAccessibleTask(req.user.id, taskId);
    if (!existing) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const canDelete = await userHasProjectAccess(req.user.id, existing.project_id, 'member');
    if (!canDelete) {
      return res.status(403).json({ message: 'You do not have permission to delete this task' });
    }

    await pool.query('DELETE FROM tasks WHERE id = $1', [taskId]);

    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    next(err);
  }
});

export default router;
