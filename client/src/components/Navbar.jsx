import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Bell, ChevronDown, LogOut, Search, User, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import useTasks from '../hooks/useTasks.js';
import UserAvatar from './UserAvatar.jsx';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const {
    filteredTasks,
    searchQuery,
    setSearchQuery,
    fetchTasks,
    notifications,
    loading,
  } = useTasks();
  const navigate = useNavigate();

  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const searchRef = useRef(null);
  const notifRef = useRef(null);
  const userRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated) fetchTasks();
  }, [isAuthenticated, fetchTasks]);

  useEffect(() => {
    const onDocClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (userRef.current && !userRef.current.contains(e.target)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const linkClass = ({ isActive }) =>
    `rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 btn-press ${
      isActive
        ? 'bg-accent/20 text-accent-glow shadow-glow-sm'
        : 'text-text-muted hover:bg-white/5 hover:text-text-primary'
    }`;

  const showSearchResults = searchOpen && searchQuery.trim().length > 0;

  return (
    <header className="relative z-20 border-b border-border/80 bg-bg-primary/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:gap-4">
        <Link to="/" className="flex shrink-0 items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/20 glow-accent-sm font-display text-sm font-bold text-accent-glow">
            TF
          </span>
          <span className="hidden font-display text-lg font-bold text-text-primary sm:inline">
            TaskFlow
          </span>
        </Link>

        {isAuthenticated && (
          <div ref={searchRef} className="relative min-w-0 max-w-md flex-1">
            <div className="flex items-center gap-2 rounded-xl border border-border bg-bg-card/60 px-3 py-2 transition-all focus-within:border-accent/40 focus-within:shadow-glow-sm">
              <Search className="h-4 w-4 shrink-0 text-text-muted" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSearchOpen(true);
                }}
                onFocus={() => setSearchOpen(true)}
                placeholder="Search tasks…"
                className="min-w-0 flex-1 bg-transparent text-sm text-text-primary outline-none placeholder:text-text-muted"
                aria-label="Search tasks"
                aria-expanded={showSearchResults}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSearchOpen(false);
                  }}
                  className="rounded p-0.5 text-text-muted hover:text-text-primary btn-press"
                  aria-label="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {showSearchResults && (
              <ul className="glass-card absolute left-0 right-0 top-full z-50 mt-2 max-h-64 overflow-y-auto p-2 shadow-glow">
                {loading ? (
                  <li className="px-3 py-4 text-center text-sm text-text-muted">Loading…</li>
                ) : filteredTasks.length === 0 ? (
                  <li className="px-3 py-4 text-center text-sm text-text-muted">No matching tasks</li>
                ) : (
                  filteredTasks.slice(0, 8).map((task) => (
                    <li key={task.id}>
                      <button
                        type="button"
                        className="flex w-full flex-col rounded-xl px-3 py-2 text-left transition-colors hover:bg-white/5 btn-press"
                        onClick={() => {
                          setSearchOpen(false);
                          navigate('/dashboard');
                        }}
                      >
                        <span className="truncate text-sm font-medium text-text-primary">
                          {task.title}
                        </span>
                        {task.project_name && (
                          <span className="truncate text-xs text-text-muted">{task.project_name}</span>
                        )}
                      </button>
                    </li>
                  ))
                )}
              </ul>
            )}
          </div>
        )}

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          {isAuthenticated ? (
            <>
              <NavLink to="/dashboard" className={linkClass}>
                Dashboard
              </NavLink>

              <div ref={notifRef} className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setNotifOpen((v) => !v);
                    setUserMenuOpen(false);
                  }}
                  className="relative rounded-xl p-2 text-text-muted transition-colors hover:bg-white/5 hover:text-text-primary btn-press"
                  aria-label="Notifications"
                  aria-expanded={notifOpen}
                >
                  <Bell className="h-5 w-5" />
                  {notifications.length > 0 && (
                    <span className="absolute right-1.5 top-1.5 flex h-2 w-2 items-center justify-center">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-danger opacity-60" />
                      <span className="relative h-2 w-2 rounded-full bg-danger ring-2 ring-bg-primary" />
                    </span>
                  )}
                </button>

                {notifOpen && (
                  <div className="glass-card absolute right-0 top-full z-50 mt-2 w-72 overflow-hidden p-2 shadow-glow sm:w-80">
                    <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-text-muted">
                      Notifications
                    </p>
                    {notifications.length === 0 ? (
                      <p className="px-3 py-6 text-center text-sm text-text-muted">
                        You&apos;re all caught up
                      </p>
                    ) : (
                      <ul className="max-h-64 overflow-y-auto">
                        {notifications.map((n) => (
                          <li key={n.id}>
                            <button
                              type="button"
                              className="flex w-full flex-col rounded-xl px-3 py-2 text-left transition-colors hover:bg-white/5 btn-press"
                              onClick={() => {
                                setNotifOpen(false);
                                navigate('/dashboard');
                              }}
                            >
                              <span className="text-sm font-medium text-text-primary">{n.title}</span>
                              <span
                                className={`text-xs ${
                                  n.type === 'overdue' ? 'text-danger' : 'text-text-muted'
                                }`}
                              >
                                {n.message}
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>

              <div ref={userRef} className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setUserMenuOpen((v) => !v);
                    setNotifOpen(false);
                  }}
                  className="flex items-center gap-2 rounded-xl px-2 py-1.5 text-text-muted transition-colors hover:bg-white/5 hover:text-text-primary btn-press"
                  aria-expanded={userMenuOpen}
                  aria-haspopup="menu"
                >
                  <UserAvatar name={user?.name} avatarUrl={user?.avatar_url} size="sm" />
                  <span className="hidden max-w-[100px] truncate text-sm font-medium text-text-primary sm:inline">
                    {user?.name}
                  </span>
                  <ChevronDown
                    className={`hidden h-4 w-4 transition-transform sm:block ${
                      userMenuOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {userMenuOpen && (
                  <div
                    role="menu"
                    className="glass-card absolute right-0 top-full z-50 mt-2 w-48 overflow-hidden p-1.5 shadow-glow"
                  >
                    <button
                      type="button"
                      role="menuitem"
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-text-primary transition-colors hover:bg-white/5 btn-press"
                      onClick={() => {
                        setUserMenuOpen(false);
                        navigate('/dashboard/settings');
                      }}
                    >
                      <User className="h-4 w-4 text-text-muted" />
                      Profile
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-danger transition-colors hover:bg-danger/10 btn-press"
                      onClick={() => {
                        setUserMenuOpen(false);
                        logout();
                      }}
                    >
                      <LogOut className="h-4 w-4" />
                      Log out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <NavLink to="/login" className={linkClass}>
                Log in
              </NavLink>
              <NavLink to="/register" className="gradient-btn px-4 py-2 text-sm">
                Sign up
              </NavLink>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
