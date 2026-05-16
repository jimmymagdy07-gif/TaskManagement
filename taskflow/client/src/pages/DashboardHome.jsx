import { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../hooks/useApi.js';
import useTasks from '../hooks/useTasks.js';
import StatsBar from '../components/dashboard/StatsBar.jsx';
import KanbanBoard from '../components/dashboard/KanbanBoard.jsx';
import NewTaskModal from '../components/dashboard/NewTaskModal.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import { computeDashboardStats } from '../utils/dashboardStats.js';

export default function DashboardHome({ onTaskClick, newTaskSignal }) {
  const {
    filteredTasks,
    searchQuery,
    loading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    tasks,
  } = useTasks();
  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchProjects = useCallback(async () => {
    setProjectsLoading(true);
    try {
      const { data } = await api.get('/projects');
      setProjects(data.projects);
    } catch {
      setProjects([]);
    } finally {
      setProjectsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
    fetchProjects();
  }, [fetchTasks, fetchProjects]);

  useEffect(() => {
    if (window.location.hash === '#my-tasks') {
      document.getElementById('my-tasks')?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [loading]);

  useEffect(() => {
    if (newTaskSignal) setModalOpen(true);
  }, [newTaskSignal]);

  const stats = useMemo(() => computeDashboardStats(tasks), [tasks]);

  const handleStatusChange = async (task, newStatus) => {
    try {
      await updateTask(task.id, {
        title: task.title,
        description: task.description ?? '',
        status: newStatus,
        priority: task.priority,
        project_id: task.project_id,
        assigned_to: task.assigned_to,
        due_date: task.due_date,
      });
    } catch {
      await fetchTasks();
    }
  };

  const handleCreateTask = async (payload) => {
    setSubmitting(true);
    try {
      await createTask(payload);
      await fetchTasks();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <StatsBar stats={stats} />

      <section id="my-tasks" className="mt-6 sm:mt-8">
        <div className="mb-4 flex flex-col gap-3 sm:mb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-fluid-lg font-bold text-text-primary">My Tasks</h2>
            <p className="mt-1 text-sm text-text-muted">
              Drag tasks between columns to update status
            </p>
          </div>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="gradient-btn px-4 py-2.5 text-sm lg:hidden"
          >
            + New Task
          </button>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-4 rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger"
          >
            {error}
          </div>
        )}

        {!loading && tasks.length === 0 ? (
          <EmptyState variant="tasks" onAction={() => setModalOpen(true)} />
        ) : (
          <KanbanBoard
            tasks={searchQuery.trim() ? filteredTasks : tasks}
            loading={loading}
            onStatusChange={handleStatusChange}
            onTaskClick={onTaskClick}
            onAddTask={() => setModalOpen(true)}
          />
        )}
      </section>

      <NewTaskModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        projects={projects}
        onSubmit={handleCreateTask}
        submitting={submitting || projectsLoading}
      />
    </>
  );
}
