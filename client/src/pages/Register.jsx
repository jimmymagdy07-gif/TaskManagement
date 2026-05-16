import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import usePageTitle from '../hooks/usePageTitle.js';
import AppMeshBackground from '../components/ui/AppMeshBackground.jsx';
import FloatingInput from '../components/ui/FloatingInput.jsx';
import ButtonSpinner from '../components/ui/ButtonSpinner.jsx';

export default function Register() {
  usePageTitle('Create account');
  const { register } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(name.trim(), email.trim(), password);
      success('Account created!');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed.';
      setError(msg);
      toastError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
      <AppMeshBackground />
      <div className="glass-card relative z-10 w-full max-w-md animate-slide-up p-8 sm:p-10">
        <div className="mb-8 text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/20 glow-accent-sm font-display text-lg font-bold text-accent-glow">
            TF
          </span>
          <h1 className="mt-4 font-display text-fluid-2xl font-bold text-text-primary">
            Create your workspace
          </h1>
          <p className="mt-2 text-sm text-text-muted">Start organizing work beautifully</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {error && (
            <p className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
              {error}
            </p>
          )}

          <FloatingInput
            id="name"
            label="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="name"
          />

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
            minLength={6}
            autoComplete="new-password"
            endAdornment={
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="text-text-muted hover:text-text-primary btn-press"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
          />

          <button
            type="submit"
            disabled={loading}
            className="gradient-btn flex w-full items-center justify-center gap-2 py-3 text-sm disabled:opacity-50"
          >
            {loading ? (
              <>
                <ButtonSpinner />
                Creating…
              </>
            ) : (
              'Create account'
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-text-muted">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-accent-glow hover:text-accent-cyan">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
