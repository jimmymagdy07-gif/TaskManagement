import { useState } from 'react';
import ButtonSpinner from './ui/ButtonSpinner.jsx';

const INITIAL = {
  title: '',
  description: '',
  status: 'todo',
  priority: 'medium',
};

export default function TaskForm({ onSubmit }) {
  const [form, setForm] = useState(INITIAL);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    setSubmitting(true);
    try {
      await onSubmit(form);
      setForm(INITIAL);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900 mb-4">New Task</h2>

      <div className="space-y-3">
        <input
          type="text"
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Task title"
          required
          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />

        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Description (optional)"
          rows={2}
          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
        />

        <div className="flex gap-3">
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="flex-1 px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>

          <select
            name="priority"
            value={form.priority}
            onChange={handleChange}
            className="flex-1 px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="gradient-btn flex w-full items-center justify-center gap-2 py-2 px-4 text-sm disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? (
            <>
              <ButtonSpinner />
              Adding…
            </>
          ) : (
            'Add Task'
          )}
        </button>
      </div>
    </form>
  );
}
