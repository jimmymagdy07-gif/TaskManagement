export const VALID_STATUS = ['todo', 'in_progress', 'done'];
export const VALID_PRIORITY = ['low', 'medium', 'high'];
export const VALID_ROLES = ['owner', 'member', 'viewer'];

export const TASK_COLUMNS = `
  t.id, t.title, t.description, t.status, t.priority,
  t.project_id, t.assigned_to, t.due_date, t.created_by,
  t.created_at, t.updated_at
`;
