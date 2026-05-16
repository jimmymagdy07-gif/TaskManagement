import { useState } from 'react';
import { Bell, Plus, Search, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import useTasks from '../../hooks/useTasks.js';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function TopBar({ onMenuOpen, onSearchOpen, onNewTask }) {
  const { user } = useAuth();
  const { searchQuery, setSearchQuery, notifications } = useTasks();
  const [notifOpen, setNotifOpen] = useState(false);
  const firstName = user?.name?.split(' ')[0] || 'there';

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-border/80 bg-bg-primary/80 px-4 backdrop-blur-xl sm:gap-4 sm:px-6 lg:h-[72px]">
      <button
        type="button"
        aria-label="Open menu"
        className="rounded-xl p-2 text-text-muted transition-colors hover:bg-white/5 hover:text-text-primary lg:hidden btn-press"
        onClick={onMenuOpen}
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <div className="min-w-0 flex-1">
        <h1 className="truncate font-display text-fluid-lg font-bold text-text-primary">
          {getGreeting()}, {firstName} 👋
        </h1>
      </div>

      <div className="hidden max-w-xs flex-1 items-center gap-2 rounded-xl border border-border bg-bg-card/60 px-3 py-2 transition-all focus-within:border-accent/30 focus-within:shadow-glow-sm md:flex lg:max-w-sm">
        <Search className="h-4 w-4 shrink-0 text-text-muted" />
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter tasks…"
          className="min-w-0 flex-1 bg-transparent text-sm text-text-primary outline-none placeholder:text-text-muted"
          aria-label="Filter tasks"
        />
        {searchQuery ? (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="rounded p-0.5 text-text-muted hover:text-text-primary btn-press"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onSearchOpen}
            className="hidden rounded-md border border-border bg-bg-secondary px-1.5 py-0.5 text-[10px] text-text-muted hover:text-text-primary sm:inline"
            aria-label="Open command palette"
          >
            ⌘K
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={onSearchOpen}
        className="rounded-xl p-2 text-text-muted hover:bg-white/5 md:hidden btn-press"
        aria-label="Search"
      >
        <Search className="h-5 w-5" />
      </button>

      <div className="relative">
        <button
          type="button"
          className="relative rounded-xl p-2 text-text-muted transition-colors hover:bg-white/5 hover:text-text-primary btn-press"
          aria-label="Notifications"
          aria-expanded={notifOpen}
          onClick={() => setNotifOpen((v) => !v)}
        >
          <Bell className="h-5 w-5" />
          {notifications.length > 0 && (
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-danger ring-2 ring-bg-primary" />
          )}
        </button>
        {notifOpen && (
          <>
            <button
              type="button"
              className="fixed inset-0 z-40"
              aria-label="Close notifications"
              onClick={() => setNotifOpen(false)}
            />
            <div className="glass-card absolute right-0 top-full z-50 mt-2 w-72 p-2 shadow-glow">
              <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-text-muted">
                Notifications
              </p>
              {notifications.length === 0 ? (
                <p className="px-3 py-4 text-center text-sm text-text-muted">You&apos;re all caught up</p>
              ) : (
                <ul className="max-h-48 overflow-y-auto">
                  {notifications.map((n) => (
                    <li key={n.id} className="px-3 py-2 text-sm text-text-primary">
                      <span className="font-medium">{n.title}</span>
                      <span className="mt-0.5 block text-xs text-text-muted">{n.message}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </div>

      <button
        type="button"
        onClick={onNewTask}
        className="gradient-btn hidden items-center gap-2 px-4 py-2 text-sm sm:inline-flex"
      >
        <Plus className="h-4 w-4" />
        New Task
      </button>
    </header>
  );
}
