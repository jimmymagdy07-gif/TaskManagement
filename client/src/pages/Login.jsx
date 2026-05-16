import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, UserRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import usePageTitle from '../hooks/usePageTitle.js';
import AppMeshBackground from '../components/ui/AppMeshBackground.jsx';
import FloatingInput from '../components/ui/FloatingInput.jsx';
import ButtonSpinner from '../components/ui/ButtonSpinner.jsx';

const GUEST_EMAIL = import.meta.env.VITE_GUEST_EMAIL;
const GUEST_PASSWORD = import.meta.env.VITE_GUEST_PASSWORD;

const FLOATING_CARDS = [
  { title: 'Ship landing page', priority: 'high', rotate: '-6deg', delay: '0s', top: '18%', left: '12%' },
  { title: 'Review API design', priority: 'medium', rotate: '4deg', delay: '1s', top: '42%', left: '28%' },
  { title: 'Update docs', priority: 'low', rotate: '-3deg', delay: '2s', top: '62%', left: '8%' },
];

function LoginShowcase() {
  return (
    <div className="relative hidden h-full overflow-hidden lg:block">
      <div className="absolute inset-0">
        {Array.from({ length: 24 }).map((_, i) => (
          <span
            key={i}
            className="absolute h-1 w-1 rounded-full bg-accent-glow/40"
            style={{
              top: `${(i * 17) % 100}%`,
              left: `${(i * 23) % 100}%`,
              animation: `float ${4 + (i % 3)}s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex h-full flex-col justify-center px-12 xl:px-16">
        <div className="mb-10 flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/20 glow-accent">
            <span className="font-display text-xl font-bold text-accent-glow">TF</span>
          </span>
          <span className="font-display text-2xl font-bold tracking-tight text-text-primary">TaskFlow</span>
        </div>

        <h1 className="font-display text-fluid-3xl font-bold leading-tight text-text-primary">
          Your work,
          <br />
          <span className="bg-gradient-to-r from-accent-glow to-accent-cyan bg-clip-text text-transparent">
            beautifully organized
          </span>
        </h1>
        <p className="mt-4 max-w-md text-fluid-base text-text-muted">
          Premium task management for teams who care about craft.
        </p>

        <div className="relative mt-16 h-64">
          {FLOATING_CARDS.map((card) => (
            <div
              key={card.title}
              className={`glass-card absolute w-56 p-4 priority-border-${card.priority}`}
              style={{
                top: card.top,
                left: card.left,
                transform: `rotate(${card.rotate})`,
                animation: `float 6s ease-in-out ${card.delay} infinite`,
              }}
            >
              <p className="text-sm font-semibold text-text-primary">{card.title}</p>
              <span className="mt-2 inline-block rounded-full bg-white/5 px-2 py-0.5 text-xs capitalize text-text-muted">
                {card.priority}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Login() {
  usePageTitle('Sign in');
  const { login } = useAuth();
  const { error: toastError, success } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email.trim(), password);
      success('Welcome back!');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please try again.';
      setError(msg);
      toastError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setError('');
    if (!GUEST_EMAIL?.trim() || !GUEST_PASSWORD) {
      const msg =
        'Guest login is not configured. Add VITE_GUEST_EMAIL and VITE_GUEST_PASSWORD to client/.env';
      setError(msg);
      toastError(msg);
      return;
    }
    setGuestLoading(true);
    try {
      await login(GUEST_EMAIL.trim(), GUEST_PASSWORD);
      success('Exploring TaskFlow as guest');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Guest login failed. Run npm run db:init on the server.';
      setError(msg);
      toastError(msg);
    } finally {
      setGuestLoading(false);
    }
  };

  const busy = loading || guestLoading;

  return (
    <div className="relative flex min-h-screen">
      <AppMeshBackground />
      <LoginShowcase />

      <div className="relative z-10 flex w-full flex-col justify-center px-6 py-12 lg:w-[40%] lg:px-12">
        <div className="mx-auto w-full max-w-md">
          <div className="glass-card p-8 sm:p-10">
            <h2 className="font-display text-fluid-2xl font-bold text-text-primary">Welcome back</h2>
            <p className="mt-2 text-sm text-text-muted">Sign in to your workspace</p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-6" noValidate>
              {error && (
                <p className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
                  {error}
                </p>
              )}

              <FloatingInput
                id="email"
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                dir="ltr"
              />

              <FloatingInput
                id="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                endAdornment={
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="text-text-muted hover:text-text-primary btn-press"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
              />

              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="peer sr-only"
                />
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-md border bg-bg-secondary transition-all ${
                    remember ? 'border-accent bg-accent shadow-glow-sm' : 'border-border'
                  }`}
                >
                  {remember && (
                    <svg className="h-3 w-3 text-white" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  )}
                </span>
                <span className="text-sm text-text-muted">Remember me</span>
              </label>

              <button
                type="submit"
                disabled={busy}
                className="gradient-btn flex w-full items-center justify-center gap-2 py-3 text-sm disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <ButtonSpinner />
                    Signing in…
                  </>
                ) : (
                  'Sign In'
                )}
              </button>

              <button
                type="button"
                onClick={handleGuestLogin}
                disabled={busy}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-accent/40 bg-accent/10 py-3 text-sm font-semibold text-accent-glow transition-all hover:border-accent/60 hover:bg-accent/15 hover:shadow-glow-sm disabled:cursor-not-allowed disabled:opacity-50 btn-press"
              >
                {guestLoading ? (
                  <>
                    <ButtonSpinner />
                    Opening guest workspace…
                  </>
                ) : (
                  <>
                    <UserRound className="h-4 w-4" />
                    Login as Guest
                  </>
                )}
              </button>

              <div className="relative flex items-center gap-4 py-2">
                <span className="h-px flex-1 bg-border" />
                <span className="text-xs text-text-muted">or continue with</span>
                <span className="h-px flex-1 bg-border" />
              </div>

              <button
                type="button"
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-bg-secondary/80 py-2.5 text-sm font-medium text-text-primary transition-all hover:border-white/15 hover:bg-white/5 btn-press"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden>
                  <path fill="#EA4335" d="M12 10.2v3.6h5.1c-.2 1.2-1.5 3.6-5.1 3.6-3.1 0-5.6-2.6-5.6-5.8S8.9 5.8 12 5.8c1.8 0 3 .8 3.7 1.5l2.5-2.4C16.9 3.6 14.6 2.6 12 2.6 6.9 2.6 2.7 6.8 2.7 12s4.2 9.4 9.3 9.4c5.4 0 9-3.8 9-9.2 0-.6-.1-1.1-.2-1.6H12z" />
                </svg>
                Google
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-text-muted">
              Don&apos;t have an account?{' '}
              <Link to="/register" className="font-medium text-accent-glow hover:text-accent-cyan">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
