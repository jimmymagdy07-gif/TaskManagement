import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { CheckCircle2, XCircle, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message, type = 'success') => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => dismiss(id), 3000);
    },
    [dismiss]
  );

  const value = useMemo(() => ({ toast, success: (m) => toast(m, 'success'), error: (m) => toast(m, 'error') }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[100] flex flex-col gap-2 sm:right-6 sm:top-6">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="alert"
            className={`pointer-events-auto flex animate-slide-up items-center gap-3 rounded-xl border px-4 py-3 shadow-glass backdrop-blur-xl ${
              t.type === 'error'
                ? 'border-danger/50 bg-danger/10 shadow-[0_0_24px_rgba(239,68,68,0.25)]'
                : 'border-success/40 bg-success/10 shadow-[0_0_24px_rgba(16,185,129,0.2)]'
            }`}
          >
            {t.type === 'error' ? (
              <XCircle className="h-5 w-5 shrink-0 text-danger" />
            ) : (
              <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />
            )}
            <p className="text-sm font-medium text-text-primary">{t.message}</p>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              className="ml-2 rounded-lg p-1 text-text-muted hover:text-text-primary btn-press"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
