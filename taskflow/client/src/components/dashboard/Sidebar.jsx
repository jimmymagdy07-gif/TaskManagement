import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ListTodo,
  FolderKanban,
  Settings,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import UserAvatar from '../UserAvatar.jsx';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/dashboard#my-tasks', label: 'My Tasks', icon: ListTodo },
  { to: '/dashboard/projects', label: 'Projects', icon: FolderKanban },
  { to: '/dashboard/settings', label: 'Settings', icon: Settings },
];

const MOBILE_NAV = NAV_ITEMS.filter((i) => i.label !== 'Settings');

export function MobileTabBar({ onClose }) {
  const navLinkClass = ({ isActive }) =>
    `flex flex-1 flex-col items-center gap-1 py-2 text-[10px] font-medium transition-colors ${
      isActive ? 'text-accent-glow' : 'text-text-muted'
    }`;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex border-t border-border bg-bg-secondary/95 px-2 pb-safe backdrop-blur-xl lg:hidden">
      {MOBILE_NAV.map(({ to, label, icon: Icon, end }) => (
        <NavLink key={label} to={to} end={end} className={navLinkClass} onClick={onClose}>
          <Icon className="h-5 w-5" />
          {label.split(' ')[0]}
        </NavLink>
      ))}
    </nav>
  );
}

export default function Sidebar({ open, onClose, collapsed }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const navLinkClass = ({ isActive }) =>
    `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 btn-press ${
      isActive
        ? 'nav-item-active text-text-primary'
        : 'text-text-muted hover:translate-x-0.5 hover:bg-white/5 hover:text-text-primary hover:shadow-glow-sm'
    } ${collapsed ? 'justify-center px-2' : ''}`;

  const sidebarContent = (
  <>
      <div className={`flex h-16 shrink-0 items-center border-b border-white/5 ${collapsed ? 'justify-center px-2' : 'gap-3 px-5'}`}>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/20 glow-accent-sm">
          <span className="font-display text-sm font-bold text-accent-glow">TF</span>
        </span>
        {!collapsed && (
          <span className="font-display text-lg font-bold tracking-tight text-text-primary">TaskFlow</span>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={label} to={to} end={end} className={navLinkClass} onClick={onClose} title={collapsed ? label : undefined}>
            <Icon className="h-5 w-5 shrink-0" />
            {!collapsed && label}
          </NavLink>
        ))}
      </nav>

      <div className={`shrink-0 border-t border-white/5 p-3 ${collapsed ? 'flex justify-center' : ''}`}>
        <div className={`mb-3 flex items-center gap-3 rounded-xl bg-white/[0.02] p-2 ${collapsed ? 'justify-center p-2' : ''}`}>
          <div className="relative shrink-0">
            <UserAvatar name={user?.name} avatarUrl={user?.avatar_url} size="md" />
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-bg-card bg-success" />
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-text-primary">{user?.name}</p>
              <p className="truncate text-xs text-text-muted">Member</p>
            </div>
          )}
          {!collapsed && (
            <NavLink
              to="/dashboard/settings"
              className="rounded-lg p-1.5 text-text-muted hover:bg-white/5 hover:text-text-primary"
              onClick={onClose}
            >
              <Settings className="h-4 w-4" />
            </NavLink>
          )}
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className={`flex w-full items-center gap-2 rounded-xl border border-border/80 px-3 py-2 text-sm text-text-muted transition-colors hover:border-danger/30 hover:bg-danger/5 hover:text-danger btn-press ${collapsed ? 'justify-center' : ''}`}
          title="Log out"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && 'Log out'}
        </button>
      </div>
  </>
  );

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`glass-card fixed inset-y-0 left-0 z-50 flex flex-col rounded-none border-y-0 border-l-0 transition-all duration-300 lg:static lg:z-auto lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        } ${collapsed ? 'w-[72px]' : 'w-[260px]'}`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
