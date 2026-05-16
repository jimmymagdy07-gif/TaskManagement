import pool from '../db/pool.js';
import { TASK_COLUMNS } from './constants.js';

const ROLE_RANK = { viewer: 1, member: 2, owner: 3 };

export async function userHasProjectAccess(userId, projectId, minRole = 'viewer') {
  const required = ROLE_RANK[minRole] ?? 1;

  const result = await pool.query(
    `SELECT
       CASE
         WHEN p.owner_id = $1 THEN 'owner'
         ELSE pm.role
       END AS role
     FROM projects p
     LEFT JOIN project_members pm
       ON pm.project_id = p.id AND pm.user_id = $1
     WHERE p.id = $2
       AND (p.owner_id = $1 OR pm.user_id = $1)`,
    [userId, projectId]
  );

  const role = result.rows[0]?.role;
  if (!role) return false;

  return (ROLE_RANK[role] ?? 0) >= required;
}

const TASK_DETAIL_SELECT = `
  ${TASK_COLUMNS},
  p.name AS project_name,
  p.color AS project_color,
  u.name AS assignee_name,
  u.avatar_url AS assignee_avatar_url
`;

export async function getAccessibleTask(userId, taskId) {
  const result = await pool.query(
    `SELECT ${TASK_DETAIL_SELECT}
     FROM tasks t
     JOIN projects p ON p.id = t.project_id
     LEFT JOIN users u ON u.id = t.assigned_to
     LEFT JOIN project_members pm
       ON pm.project_id = p.id AND pm.user_id = $1
     WHERE t.id = $2
       AND (p.owner_id = $1 OR pm.user_id IS NOT NULL)`,
    [userId, taskId]
  );

  return result.rows[0] ?? null;
}
