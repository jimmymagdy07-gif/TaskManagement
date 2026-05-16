import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';
import usePageTitle from '../hooks/usePageTitle.js';

export default function Home() {
  usePageTitle('Home');
  const { isAuthenticated } = useAuth();

  return (
    <div className="page-enter py-8 sm:py-16">
      <div className="glass-card mx-auto max-w-3xl p-8 text-center sm:p-12">
        <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-medium text-accent-glow">
          <Sparkles className="h-3.5 w-3.5" />
          Premium task management
        </span>
        <h1 className="mt-6 font-display text-fluid-3xl font-bold leading-tight text-text-primary">
          Work beautifully{' '}
          <span className="bg-gradient-to-r from-accent-glow to-accent-cyan bg-clip-text text-transparent">
            organized
          </span>
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-fluid-base text-text-muted">
          TaskFlow brings clarity to your projects with a stunning workspace built for focus.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            to={isAuthenticated ? '/dashboard' : '/register'}
            className="gradient-btn inline-flex items-center gap-2 px-6 py-3 text-sm"
          >
            {isAuthenticated ? 'Open dashboard' : 'Get started free'}
            <ArrowRight className="h-4 w-4" />
          </Link>
          {!isAuthenticated && (
            <Link
              to="/login"
              className="rounded-xl border border-border px-6 py-3 text-sm font-medium text-text-primary transition-all hover:border-accent/30 hover:bg-white/5 btn-press"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
