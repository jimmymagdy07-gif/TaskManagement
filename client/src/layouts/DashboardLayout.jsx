import { useEffect, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Sidebar, { MobileTabBar } from '../components/dashboard/Sidebar.jsx';
import TopBar from '../components/dashboard/TopBar.jsx';
import SpotlightSearch from '../components/ui/SpotlightSearch.jsx';
import AppMeshBackground from '../components/ui/AppMeshBackground.jsx';
import TaskDetail from '../pages/TaskDetail.jsx';
import DashboardHome from '../pages/DashboardHome.jsx';
import Projects from '../pages/Projects.jsx';
import useTasks from '../hooks/useTasks.js';
import usePageTitle from '../hooks/usePageTitle.js';

function PlaceholderPage({ title }) {
  return (
    <div className="glass-card flex flex-col items-center justify-center py-20 text-center animate-float">
      <h1 className="font-display text-fluid-xl font-bold text-text-primary">{title}</h1>
      <p className="mt-2 text-text-muted">Coming soon</p>
    </div>
  );
}

export default function DashboardLayout() {
  const { fetchTasks, filteredTasks, searchQuery, setSearchQuery } = useTasks();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [newTaskSignal, setNewTaskSignal] = useState(0);
  const { pathname } = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const pageTitle = pathname.includes('/projects')
    ? 'Projects'
    : pathname.includes('/settings')
      ? 'Settings'
      : 'Dashboard';
  usePageTitle(pageTitle);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px) and (max-width: 1024px)');
    const update = () => setCollapsed(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  const handleTaskUpdated = async () => {
    await fetchTasks();
    window.dispatchEvent(new CustomEvent('taskflow:task-updated'));
  };

  return (
    <div className="relative flex min-h-screen">
      <AppMeshBackground />
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={collapsed}
      />

      <div className="flex min-h-screen min-w-0 flex-1 flex-col pb-16 lg:pb-0">
        <TopBar
          onMenuOpen={() => setSidebarOpen(true)}
          onSearchOpen={() => setSearchOpen(true)}
          onNewTask={() => {
            setNewTaskSignal((n) => n + 1);
            if (pathname !== '/dashboard' && !pathname.endsWith('/dashboard')) {
              window.location.href = '/dashboard';
            }
          }}
        />

        <main className="page-enter flex-1 overflow-y-auto p-4 sm:p-6">
          <Routes>
            <Route
              index
              element={
                <DashboardHome
                  onTaskClick={(t) => setSelectedTaskId(t.id)}
                  newTaskSignal={newTaskSignal}
                />
              }
            />
            <Route
              path="projects"
              element={<Projects onTaskClick={(t) => setSelectedTaskId(t.id)} />}
            />
            <Route path="settings" element={<PlaceholderPage title="Settings" />} />
          </Routes>
        </main>
      </div>

      <MobileTabBar onClose={() => setSidebarOpen(false)} />

      <SpotlightSearch
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        tasks={filteredTasks}
        query={searchQuery}
        onQueryChange={setSearchQuery}
      />

      {selectedTaskId && (
        <TaskDetail
          taskId={selectedTaskId}
          onClose={() => setSelectedTaskId(null)}
          onUpdated={handleTaskUpdated}
        />
      )}
    </div>
  );
}
