export function computeDashboardStats(tasks) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const completedToday = tasks.filter((task) => {
    if (task.status !== 'done') return false;
    const updated = new Date(task.updated_at);
    updated.setHours(0, 0, 0, 0);
    return updated.getTime() === today.getTime();
  }).length;

  const overdue = tasks.filter((task) => {
    if (!task.due_date || task.status === 'done') return false;
    const due = new Date(task.due_date);
    due.setHours(0, 0, 0, 0);
    return due < today;
  }).length;

  return {
    total: tasks.length,
    inProgress: tasks.filter((t) => t.status === 'in_progress').length,
    completedToday,
    overdue,
  };
}
