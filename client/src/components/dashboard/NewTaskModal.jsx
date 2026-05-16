import { useEffect, useState } from 'react';
import ButtonSpinner from '../ui/ButtonSpinner.jsx';

const PRIORITIES = ['low', 'medium', 'high'];

export default function NewTaskModal({ open, onClose, projects, onSubmit, submitting }) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [projectId, setProjectId] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setTitle('');
    setPriority('medium');
    setDueDate('');
    setProjectId(projects[0]?.id?.toString() ?? '');
    setError('');
  }, [open, projects]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    if (!projectId) {
      setError('Select a project');
      return;
    }

    try {
      await onSubmit({
        title: title.trim(),
        priority,
        due_date: dueDate || null,
        project_id: parseInt(projectId, 10),
        status: 'todo',
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create task');
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-task-title"
        className="glass-card relative w-full max-w-md animate-slide-up p-6 sm:p-8"
      >
        <header className="mb-5">
          <h2 id="new-task-title" className="text-lg font-semibold text-white">
            New Task
          </h2>
          <p className="mt-1 text-sm text-surface-400">Add a task to your board</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div
              role="alert"
              className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300"
            >
              {error}
            </div>
          )}

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-surface-300">Title</span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
              className="w-full rounded-lg border border-surface-700 bg-surface-950 px-3 py-2 text-sm text-white placeholder:text-surface-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              placeholder="What needs to be done?"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-surface-300">Priority</span>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full rounded-lg border border-surface-700 bg-surface-950 px-3 py-2 text-sm text-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-surface-300">Due date</span>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded-lg border border-surface-700 bg-surface-950 px-3 py-2 text-sm text-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-surface-300">Project</span>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              required
              disabled={projects.length === 0}
              className="w-full rounded-lg border border-surface-700 bg-surface-950 px-3 py-2 text-sm text-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:opacity-50"
            >
              {projects.length === 0 ? (
                <option value="">No projects available</option>
              ) : (
                projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))
              )}
            </select>
          </label>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-surface-700 px-4 py-2.5 text-sm font-medium text-surface-300 transition-colors hover:bg-surface-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || projects.length === 0}
              className="gradient-btn flex flex-1 items-center justify-center gap-2 px-4 py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <ButtonSpinner />
                  Creating…
                </>
              ) : (
                'Create task'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
