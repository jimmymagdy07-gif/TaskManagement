import { useCallback, useMemo, useState } from 'react';
import api from './useApi.js';
import { isTaskOverdue } from '../utils/taskMeta.js';

function filterTasks(tasks, query) {
  const q = query.trim().toLowerCase();
  if (!q) return tasks;
  return tasks.filter(
    (t) =>
      t.title?.toLowerCase().includes(q) ||
      t.description?.toLowerCase().includes(q) ||
      t.project_name?.toLowerCase().includes(q) ||
      t.status?.toLowerCase().includes(q) ||
      t.status?.replace(/_/g, ' ').toLowerCase().includes(q) ||
      t.priority?.toLowerCase().includes(q)
  );
}

export function useTasksState() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/tasks');
      setTasks(data.tasks);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  const createTask = useCallback(async (task) => {
    const { data } = await api.post('/tasks', task);
    setTasks((prev) => [data.task, ...prev]);
    return data.task;
  }, []);

  const updateTask = useCallback(async (id, updates) => {
    const { data } = await api.put(`/tasks/${id}`, updates);
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...data.task } : t)));
    return data.task;
  }, []);

  const deleteTask = useCallback(async (id) => {
    await api.delete(`/tasks/${id}`);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const filteredTasks = useMemo(
    () => filterTasks(tasks, searchQuery),
    [tasks, searchQuery]
  );

  const notifications = useMemo(() => {
    const overdue = tasks.filter((t) => isTaskOverdue(t) && t.status !== 'done');
    const inProgress = tasks.filter((t) => t.status === 'in_progress');
    const items = [
      ...overdue.map((t) => ({
        id: `overdue-${t.id}`,
        type: 'overdue',
        title: t.title,
        message: 'Overdue — needs attention',
        taskId: t.id,
      })),
      ...inProgress.slice(0, 3).map((t) => ({
        id: `progress-${t.id}`,
        type: 'progress',
        title: t.title,
        message: 'In progress',
        taskId: t.id,
      })),
    ];
    return items.slice(0, 6);
  }, [tasks]);

  return useMemo(
    () => ({
      tasks,
      filteredTasks,
      loading,
      error,
      searchQuery,
      setSearchQuery,
      notifications,
      fetchTasks,
      createTask,
      updateTask,
      deleteTask,
    }),
    [
      tasks,
      filteredTasks,
      loading,
      error,
      searchQuery,
      notifications,
      fetchTasks,
      createTask,
      updateTask,
      deleteTask,
    ]
  );
}

export { default } from '../context/TaskContext.jsx';
