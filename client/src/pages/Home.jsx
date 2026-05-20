import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, UserRound } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';
import { useToast } from '../context/ToastContext.jsx';
import usePageTitle from '../hooks/usePageTitle.js';
import ButtonSpinner from '../components/ui/ButtonSpinner.jsx';

const GUEST_EMAIL = import.meta.env.VITE_GUEST_EMAIL;
const GUEST_PASSWORD = import.meta.env.VITE_GUEST_PASSWORD;

export default function Home() {
  usePageTitle('Home');
  const { login, isAuthenticated } = useAuth();
  const { error: toastError, success } = useToast();
  const navigate = useNavigate();
  const [guestLoading, setGuestLoading] = useState(false);

  const handleGuestLogin = async () => {
    if (!GUEST_EMAIL?.trim() || !GUEST_PASSWORD) {
      const msg =
        'Guest login is not configured. Add VITE_GUEST_EMAIL and VITE_GUEST_PASSWORD to client/.env';
      toastError(msg);
      return;
    }

    setGuestLoading(true);
    try {
      await login(GUEST_EMAIL.trim(), GUEST_PASSWORD);
      success('Opening the guest workspace…');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Guest login failed. Please try again.';
      toastError(msg);
    } finally {
      setGuestLoading(false);
    }
  };

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
            <button
              type="button"
              onClick={handleGuestLogin}
              disabled={guestLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-accent/40 bg-accent/10 px-6 py-3 text-sm font-semibold text-accent-glow transition-all hover:border-accent/60 hover:bg-accent/15 hover:shadow-glow-sm disabled:cursor-not-allowed disabled:opacity-50 btn-press sm:w-auto"
            >
              {guestLoading ? (
                <>
                  <ButtonSpinner />
                  Opening guest workspace…
                </>
              ) : (
                <>
                  <UserRound className="h-4 w-4" />
                  View demo workspace
                </>
              )}
            </button>
          )}
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
