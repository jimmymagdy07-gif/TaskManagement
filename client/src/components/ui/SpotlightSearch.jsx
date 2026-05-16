import { useEffect } from 'react';
import { Search, X, LayoutList, FolderKanban } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SpotlightSearch({ open, onClose, tasks = [], query = '', onQueryChange }) {
  const navigate = useNavigate();
  const setQuery = onQueryChange ?? (() => {});

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onClose?.();
      }
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!open) return null;

  const filtered = tasks.slice(0, 8);

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center bg-black/60 p-4 pt-[15vh] backdrop-blur-sm">
      <button type="button" className="absolute inset-0" aria-label="Close search" onClick={onClose} />
      <div className="glass-card relative w-full max-w-xl animate-slide-up overflow-hidden">
        <div className="flex items-center gap-3 border-b border-white/5 px-4 py-3">
          <Search className="h-5 w-5 text-text-muted" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tasks, projects…"
            className="flex-1 bg-transparent text-text-primary outline-none placeholder:text-text-muted"
          />
          <kbd className="hidden rounded-lg border border-border bg-bg-secondary px-2 py-0.5 text-xs text-text-muted sm:inline">
            ESC
          </kbd>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-text-muted hover:text-text-primary btn-press">
            <X className="h-4 w-4" />
          </button>
        </div>
        <ul className="max-h-80 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <li className="px-3 py-8 text-center text-sm text-text-muted">No results</li>
          ) : (
            filtered.map((task) => (
              <li key={task.id}>
                <button
                  type="button"
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-white/5 btn-press"
                  onClick={() => {
                    onClose();
                    navigate('/dashboard');
                  }}
                >
                  <LayoutList className="h-4 w-4 text-accent-glow" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-text-primary">{task.title}</p>
                    <p className="truncate text-xs text-text-muted">{task.project_name}</p>
                  </div>
                </button>
              </li>
            ))
          )}
          <li className="mt-1 border-t border-white/5 pt-1">
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-text-muted hover:bg-white/5 hover:text-text-primary btn-press"
              onClick={() => {
                onClose();
                navigate('/dashboard/projects');
              }}
            >
              <FolderKanban className="h-4 w-4" />
              Go to Projects
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}
