import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import usePageTitle from '../hooks/usePageTitle.js';
import AppMeshBackground from '../components/ui/AppMeshBackground.jsx';

export default function NotFound() {
  usePageTitle('Page not found');

  return (
    <div className="relative flex min-h-[70vh] flex-col items-center justify-center text-center">
      <AppMeshBackground />
      <div className="relative z-10 glass-card max-w-md p-10 animate-float">
        <p className="font-display text-8xl font-bold bg-gradient-to-br from-accent-glow to-accent-cyan bg-clip-text text-transparent">
          404
        </p>
        <h1 className="mt-4 font-display text-fluid-xl font-bold text-text-primary">
          Lost in the void
        </h1>
        <p className="mt-2 text-text-muted">
          This page doesn&apos;t exist or was moved.
        </p>
        <Link
          to="/"
          className="gradient-btn mt-8 inline-flex items-center gap-2 px-6 py-3 text-sm"
        >
          <Home className="h-4 w-4" />
          Back home
        </Link>
      </div>
    </div>
  );
}
