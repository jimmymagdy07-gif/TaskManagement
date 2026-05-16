import { Router } from 'express';
import pool from '../db/pool.js';
import { verifyToken } from '../middleware/auth.js';
import { userHasProjectAccess } from '../utils/access.js';
import { TASK_COLUMNS } from '../utils/constants.js';

const router = Router();

router.use(verifyToken);

router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT DISTINCT
         p.id,
         p.name,
         p.description,
         p.color,
         p.owner_id,
         p.created_at,
         COUNT(t.id)::int AS task_count,
         CASE
           WHEN p.owner_id = $1 THEN 'owner'
           ELSE pm.role
         END AS role
       FROM projects p
       LEFT JOIN project_members pm
         ON pm.project_id = p.id AND pm.user_id = $1
       LEFT JOIN tasks t ON t.project_id = p.id
       WHERE p.owner_id = $1 OR pm.user_id = $1
       GROUP BY p.id, pm.role
       ORDER BY p.created_at DESC`,
      [req.user.id]
    );

    res.json({ projects: result.rows });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  const client = await pool.connect();
  let began = false;

  try {
    const { name, description = '', color = '#6366F1' } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ message: 'Project name is required' });
    }

    await client.query('BEGIN');
    began = true;

    const projectResult = await client.query(
      `INSERT INTO projects (name, description, color, owner_id)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, description, color, owner_id, created_at`,
      [name.trim(), description.trim(), color, req.user.id]
    );

    const project = projectResult.rows[0];

    await client.query(
      `INSERT INTO project_members (project_id, user_id, role)
       VALUES ($1, $2, 'owner')`,
      [project.id, req.user.id]
    );

    await client.query('COMMIT');
    began = false;

    res.status(201).json({ project: { ...project, role: 'owner' } });
  } catch (err) {
    if (began) await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
});

router.get('/:id/tasks', async (req, res, next) => {
  try {
    const projectId = parseInt(req.params.id, 10);

    if (Number.isNaN(projectId)) {
      return res.status(400).json({ message: 'Invalid project id' });
    }

    const hasAccess = await userHasProjectAccess(req.user.id, projectId);
    if (!hasAccess) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const result = await pool.query(
      `SELECT ${TASK_COLUMNS},
              p.name AS project_name,
              p.color AS project_color,
              u.name AS assignee_name,
              u.avatar_url AS assignee_avatar_url
       FROM tasks t
       JOIN projects p ON p.id = t.project_id
       LEFT JOIN users u ON u.id = t.assigned_to
       WHERE t.project_id = $1
       ORDER BY t.created_at DESC`,
      [projectId]
    );

    res.json({ tasks: result.rows });
  } catch (err) {
    next(err);
  }
});

export default router;
