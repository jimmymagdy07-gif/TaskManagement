export default function FormField({
  id,
  label,
  type = 'text',
  value,
  onChange,
  error,
  required = false,
  minLength,
  autoComplete,
  dir,
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-surface-300 mb-1.5">
        {label}
        {required && <span className="text-primary-500 ms-0.5" aria-hidden>*</span>}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        minLength={minLength}
        autoComplete={autoComplete}
        dir={dir}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`w-full rounded-lg border bg-surface-800 px-3.5 py-2.5 text-sm text-white placeholder:text-surface-500 transition-colors
          focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500
          ${error ? 'border-rose-500/70' : 'border-surface-600 hover:border-surface-500'}`}
      />
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-rose-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
