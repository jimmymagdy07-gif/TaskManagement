import { useCallback, useEffect, useState } from 'react';
import { X, Send, Circle } from 'lucide-react';
import api from '../hooks/useApi.js';
import useTasks from '../hooks/useTasks.js';
import UserAvatar from '../components/UserAvatar.jsx';
import {
  PRIORITY_STYLES,
  STATUS_OPTIONS,
  formatRelativeTime,
  renderSimpleMarkdown,
} from '../utils/taskMeta.js';

function EditableText({ value, onSave, multiline = false, className = '', placeholder }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? '');

  useEffect(() => {
    if (!editing) setDraft(value ?? '');
  }, [value, editing]);

  const commit = async () => {
    setEditing(false);
    const trimmed = draft.trim();
    if (trimmed !== (value ?? '').trim()) {
      await onSave(trimmed);
    }
  };

  if (editing) {
    const Input = multiline ? 'textarea' : 'input';
    return (
      <Input
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (!multiline && e.key === 'Enter') {
            e.preventDefault();
            commit();
          }
          if (e.key === 'Escape') {
            setDraft(value ?? '');
            setEditing(false);
          }
        }}
        rows={multiline ? 4 : undefined}
        className={`w-full rounded-xl border border-border bg-bg-secondary px-3 py-2 text-text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/50 ${className}`}
        placeholder={placeholder}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className={`w-full rounded-xl px-1 py-0.5 text-left transition-colors hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-accent/40 ${className}`}
    >
      {value?.trim() ? value : <span className="text-text-muted">{placeholder}</span>}
    </button>
  );
}

export default function TaskDetail({ taskId, onClose, onUpdated }) {
  const { updateTask } = useTasks();
  const [task, setTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [commentText, setCommentText] = useState('');
  const [postingComment, setPostingComment] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadTask = useCallback(async () => {
    if (!taskId) return;
    setLoading(true);
    setError('');
    try {
      const [taskRes, commentsRes] = await Promise.all([
        api.get(`/tasks/${taskId}`),
        api.get(`/tasks/${taskId}/comments`),
      ]);
      setTask(taskRes.data.task);
      setComments(commentsRes.data.comments);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load task');
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    loadTask();
  }, [loadTask]);

  const persist = async (updates) => {
    if (!task) return;
    setSaving(true);
    try {
      const updated = await updateTask(task.id, {
        title: updates.title ?? task.title,
        description: updates.description ?? task.description ?? '',
        status: updates.status ?? task.status,
        priority: updates.priority ?? task.priority,
        project_id: task.project_id,
        assigned_to: task.assigned_to,
        due_date: updates.due_date !== undefined ? updates.due_date : task.due_date,
      });
      setTask(updated);
      onUpdated?.(updated);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !taskId) return;
    setPostingComment(true);
    try {
      const { data } = await api.post(`/tasks/${taskId}/comments`, {
        content: commentText.trim(),
      });
      setComments((prev) => [...prev, data.comment]);
      setCommentText('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post comment');
    } finally {
      setPostingComment(false);
    }
  };

  const dueDateValue = task?.due_date
    ? new Date(task.due_date).toISOString().slice(0, 10)
    : '';

  return (
    <>
      <button
        type="button"
        aria-label="Close task panel"
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-md animate-fade-in"
        onClick={onClose}
      />

      <aside
        className="glass-card fixed inset-y-0 right-0 z-50 flex w-full max-w-[400px] animate-slide-in-right flex-col rounded-none border-y-0 border-r-0 md:max-w-[400px]"
        role="dialog"
        aria-modal="true"
        aria-label="Task details"
      >
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-white/5 px-5 py-4">
          <div className="min-w-0">
            {task?.project_name && (
              <div className="mb-1 flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: task.project_color || '#6366f1' }}
                />
                <span className="truncate text-xs text-surface-400">{task.project_name}</span>
              </div>
            )}
            {saving && <span className="text-xs text-surface-500">Saving…</span>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-text-muted transition-colors hover:bg-white/5 hover:text-text-primary btn-press"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
          {loading ? (
            <div className="flex justify-center py-16">
              <span className="h-8 w-8 animate-spin rounded-full border-2 border-surface-600 border-t-primary-500" />
            </div>
          ) : error && !task ? (
            <p className="text-sm text-rose-400">{error}</p>
          ) : task ? (
            <div className="space-y-6">
              {error && (
                <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
                  {error}
                </p>
              )}

              <EditableText
                value={task.title}
                onSave={(title) => persist({ title })}
                className="text-xl font-semibold text-white"
                placeholder="Add a title…"
              />

              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-surface-500">
                  Description
                </label>
                <EditableText
                  value={task.description}
                  onSave={(description) => persist({ description })}
                  multiline
                  className="text-sm text-surface-300"
                  placeholder="Click to add a description…"
                />
              </div>

              <div>
                <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-text-muted">
                  Status
                </span>
                <div className="flex flex-wrap gap-2">
                  {STATUS_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => persist({ status: opt.value })}
                      className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-200 btn-press ${
                        task.status === opt.value
                          ? 'bg-accent text-white shadow-glow'
                          : 'bg-white/5 text-text-muted hover:bg-white/10 hover:text-text-primary'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-text-muted">
                  Due date
                </span>
                <input
                  type="date"
                  value={dueDateValue}
                  onChange={(e) =>
                    persist({ due_date: e.target.value ? e.target.value : null })
                  }
                  className="w-full rounded-xl border border-border bg-bg-secondary px-3 py-2.5 text-sm text-text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/50"
                />
              </label>

              <div>
                <span className="mb-2 block text-xs font-medium uppercase tracking-wide text-surface-500">
                  Priority
                </span>
                <div className="flex flex-wrap gap-2">
                  {['low', 'medium', 'high'].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => persist({ priority: p })}
                      className={`rounded-full px-3 py-1 text-xs font-medium capitalize ring-1 transition-all ${
                        PRIORITY_STYLES[p]
                      } ${task.priority === p ? 'ring-2 ring-white/30' : 'opacity-70 hover:opacity-100'}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {task.assignee_name && (
                <div className="flex items-center gap-3">
                  <UserAvatar
                    name={task.assignee_name}
                    avatarUrl={task.assignee_avatar_url}
                    size="md"
                  />
                  <div>
                    <p className="text-xs text-surface-500">Assigned to</p>
                    <p className="text-sm font-medium text-white">{task.assignee_name}</p>
                  </div>
                </div>
              )}

              <section>
                <h3 className="mb-4 font-display text-sm font-semibold text-text-primary">
                  Activity & Comments
                </h3>

                <ul className="space-y-4">
                  {comments.length === 0 ? (
                    <li className="text-sm text-surface-500">No comments yet.</li>
                  ) : (
                    comments.map((comment) => (
                      <li key={comment.id} className="flex gap-3">
                        <UserAvatar
                          name={comment.user_name}
                          avatarUrl={comment.user_avatar_url}
                          size="md"
                          className="shrink-0"
                        />
                        <div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-sm font-medium text-white">
                              {comment.user_name}
                            </span>
                            <time
                              dateTime={comment.created_at}
                              className="text-xs text-surface-500"
                            >
                              {formatRelativeTime(comment.created_at)}
                            </time>
                          </div>
                          <p className="mt-1 text-sm text-surface-300">{comment.content}</p>
                        </div>
                      </li>
                    ))
                  )}
                </ul>

                <form onSubmit={handleAddComment} className="mt-4 flex gap-2">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Write a comment…"
                    className="min-w-0 flex-1 rounded-lg border border-surface-700 bg-surface-950 px-3 py-2 text-sm text-white placeholder:text-surface-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                  <button
                    type="submit"
                    disabled={postingComment || !commentText.trim()}
                    className="gradient-btn flex shrink-0 items-center gap-1 px-4 py-2.5 text-sm disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              </section>
            </div>
          ) : null}
        </div>
      </aside>
    </>
  );
}
