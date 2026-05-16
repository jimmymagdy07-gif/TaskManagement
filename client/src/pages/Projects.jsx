import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../hooks/useApi.js';
import KanbanBoard from '../components/dashboard/KanbanBoard.jsx';
import TaskCard from '../components/TaskCard.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import ButtonSpinner from '../components/ui/ButtonSpinner.jsx';
import TaskCardSkeleton from '../components/ui/TaskCardSkeleton.jsx';
import useTasks from '../hooks/useTasks.js';

const PRESET_COLORS = [
  '#6366F1',
  '#8B5CF6',
  '#EC4899',
  '#F43F5E',
  '#F59E0B',
  '#10B981',
  '#06B6D4',
  '#64748B',
];

function NewProjectModal({ open, onClose, onCreated }) {
  const [name, setName] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setName('');
    setColor(PRESET_COLORS[0]);
    setError('');
  }, [open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Project name is required');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const { data } = await api.post('/projects', { name: name.trim(), color });
      onCreated(data.project);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project');
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-md rounded-2xl border border-surface-700 bg-surface-900 p-6 shadow-2xl"
      >
        <h2 className="text-lg font-semibold text-white">New Project</h2>
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {error && (
            <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
              {error}
            </p>
          )}
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-surface-300">Name</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
              className="w-full rounded-lg border border-surface-700 bg-surface-950 px-3 py-2 text-sm text-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              placeholder="Project name"
            />
          </label>
          <div>
            <span className="mb-2 block text-sm font-medium text-surface-300">Color</span>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`h-8 w-8 rounded-full ring-2 ring-offset-2 ring-offset-surface-900 transition-all ${
                    color === c ? 'ring-white scale-110' : 'ring-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                  aria-label={`Color ${c}`}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-surface-700 px-4 py-2.5 text-sm font-medium text-surface-300 hover:bg-surface-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="gradient-btn flex flex-1 items-center justify-center gap-2 px-4 py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <ButtonSpinner />
                  Creating…
                </>
              ) : (
                'Create'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Projects({ onTaskClick }) {
  const navigate = useNavigate();
  const { updateTask } = useTasks();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectTasks, setProjectTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState('kanban');

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/projects');
      setProjects(data.projects);
    } catch {
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const loadProjectTasks = useCallback(async (project) => {
    setSelectedProject(project);
    setTasksLoading(true);
    try {
      const { data } = await api.get(`/projects/${project.id}/tasks`);
      setProjectTasks(data.tasks);
    } catch {
      setProjectTasks([]);
    } finally {
      setTasksLoading(false);
    }
  }, []);

  useEffect(() => {
    const refresh = () => {
      if (selectedProject) loadProjectTasks(selectedProject);
    };
    window.addEventListener('taskflow:task-updated', refresh);
    return () => window.removeEventListener('taskflow:task-updated', refresh);
  }, [selectedProject, loadProjectTasks]);

  const handleStatusChange = async (task, newStatus) => {
    try {
      const updated = await updateTask(task.id, {
        title: task.title,
        description: task.description ?? '',
        status: newStatus,
        priority: task.priority,
        project_id: task.project_id,
        assigned_to: task.assigned_to,
        due_date: task.due_date,
      });
      setProjectTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    } catch {
      if (selectedProject) loadProjectTasks(selectedProject);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white sm:text-2xl">Projects</h1>
          <p className="mt-0.5 text-sm text-surface-400">
            Organize work by project
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="rounded-lg bg-primary-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-500/20 hover:bg-primary-400"
        >
          + New Project
        </button>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton-shimmer h-28 rounded-xl" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <EmptyState variant="projects" onAction={() => setModalOpen(true)} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <button
              key={project.id}
              type="button"
              onClick={() => loadProjectTasks(project)}
              className={`rounded-xl border p-5 text-left transition-all hover:shadow-lg ${
                selectedProject?.id === project.id
                  ? 'border-accent/50 bg-accent/10 ring-1 ring-accent/30 shadow-glow-sm'
                  : 'border-border bg-bg-card/60 hover:border-accent/30 hover:shadow-glow-sm'
              }`}
            >
              <div className="flex items-start gap-3">
                <span
                  className="mt-1 h-4 w-4 shrink-0 rounded-full"
                  style={{ backgroundColor: project.color || '#6366f1' }}
                />
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-semibold text-white">{project.name}</h3>
                  <p className="mt-1 text-sm text-surface-400">
                    {project.task_count ?? 0}{' '}
                    {(project.task_count ?? 0) === 1 ? 'task' : 'tasks'}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {selectedProject && (
        <section className="mt-8 border-t border-surface-800 pt-8">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: selectedProject.color || '#6366f1' }}
              />
              <h2 className="text-lg font-semibold text-white">{selectedProject.name}</h2>
            </div>
            <div className="flex rounded-lg border border-surface-700 p-0.5">
              <button
                type="button"
                onClick={() => setViewMode('kanban')}
                className={`rounded-md px-3 py-1.5 text-xs font-medium ${
                  viewMode === 'kanban'
                    ? 'bg-surface-700 text-white'
                    : 'text-surface-400 hover:text-white'
                }`}
              >
                Board
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`rounded-md px-3 py-1.5 text-xs font-medium ${
                  viewMode === 'list'
                    ? 'bg-surface-700 text-white'
                    : 'text-surface-400 hover:text-white'
                }`}
              >
                List
              </button>
            </div>
          </div>

          {viewMode === 'kanban' ? (
            <KanbanBoard
              tasks={projectTasks}
              loading={tasksLoading}
              onStatusChange={handleStatusChange}
              onTaskClick={onTaskClick}
            />
          ) : (
            <ul className="space-y-3">
              {tasksLoading ? (
                <li>
                  <TaskCardSkeleton count={3} />
                </li>
              ) : projectTasks.length === 0 ? (
                <li>
                  <EmptyState
                    variant="tasks"
                    title="No tasks in this project"
                    description="Add a task to start tracking work in this project."
                    actionLabel="Create task"
                    onAction={() => navigate('/dashboard')}
                  />
                </li>
              ) : (
                projectTasks.map((task) => (
                  <li key={task.id}>
                    <TaskCard
                      task={task}
                      onClick={onTaskClick}
                      draggable={false}
                      showProjectTag={false}
                    />
                  </li>
                ))
              )}
            </ul>
          )}
        </section>
      )}

      <NewProjectModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={(project) => {
          setProjects((prev) => [{ ...project, task_count: 0 }, ...prev]);
        }}
      />
    </div>
  );
}
