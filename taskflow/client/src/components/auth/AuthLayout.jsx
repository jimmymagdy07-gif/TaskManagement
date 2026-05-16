import { Link } from 'react-router-dom';

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="min-h-[calc(100vh-4rem)] sm:min-h-screen flex items-center justify-center px-4 py-10 sm:py-12 bg-surface-950">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-primary-500 hover:text-primary-400 transition-colors"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-500/15 ring-1 ring-primary-500/30">
              <svg
                className="h-5 w-5 text-primary-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
            </span>
            <span className="text-xl font-bold tracking-tight text-white">TaskFlow</span>
          </Link>
        </div>

        <div className="rounded-2xl border border-surface-700/80 bg-surface-900/90 p-6 sm:p-8 shadow-2xl shadow-black/40 backdrop-blur-sm">
          <header className="text-center mb-6">
            <h1 className="text-2xl font-bold text-white tracking-tight">{title}</h1>
            {subtitle && (
              <p className="mt-2 text-sm text-surface-400">{subtitle}</p>
            )}
          </header>

          {children}
        </div>

        {footer && (
          <p className="mt-6 text-center text-sm text-surface-400">{footer}</p>
        )}
      </div>
    </div>
  );
}
