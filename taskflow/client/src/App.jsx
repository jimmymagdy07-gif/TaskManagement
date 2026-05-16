import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import PageTransition from './components/ui/PageTransition.jsx';
import AppMeshBackground from './components/ui/AppMeshBackground.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import NotFound from './pages/NotFound.jsx';

function AppContent() {
  const { pathname } = useLocation();
  const isAuthPage = pathname === '/login' || pathname === '/register';
  const isDashboard = pathname.startsWith('/dashboard');
  const showMesh = !isAuthPage;

  return (
    <div className="relative min-h-screen flex flex-col">
      {showMesh && !isDashboard && <AppMeshBackground />}
      {!isAuthPage && !isDashboard && <Navbar />}
      <main
        className={
          isAuthPage || isDashboard
            ? 'relative z-10 flex-1'
            : 'relative z-10 mx-auto w-full max-w-5xl flex-1 px-4 py-8'
        }
      >
        <PageTransition>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/dashboard/*"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </PageTransition>
      </main>
    </div>
  );
}

export default function App() {
  return <AppContent />;
}
