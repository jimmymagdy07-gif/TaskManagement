import { useState } from 'react';

export default function FloatingInput({
  id,
  label,
  type = 'text',
  value,
  onChange,
  required,
  autoComplete,
  dir,
  endAdornment,
}) {
  const [focused, setFocused] = useState(false);
  const hasValue = value != null && String(value).length > 0;

  return (
    <div className={`floating-input relative pt-5 ${hasValue ? 'has-value' : ''}`}>
      <label
        htmlFor={id}
        className={`floating-label pointer-events-none absolute left-0 origin-left text-text-muted transition-all duration-200 ${
          focused || hasValue ? 'text-accent-glow' : ''
        }`}
        style={{
          transform:
            focused || hasValue ? 'translateY(-1.35rem) scale(0.85)' : 'translateY(0) scale(1)',
        }}
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        autoComplete={autoComplete}
        dir={dir}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="w-full border-0 border-b border-border bg-transparent pb-2 pt-1 text-text-primary outline-none transition-shadow focus:shadow-[0_4px_20px_-8px_rgba(124,58,237,0.6)]"
      />
      <span
        className="input-line absolute bottom-0 left-1/2 h-0.5 w-full origin-center bg-gradient-to-r from-accent to-accent-cyan transition-transform duration-300"
        style={{ transform: focused ? 'translateX(-50%) scaleX(1)' : 'translateX(-50%) scaleX(0)' }}
      />
      {endAdornment && <div className="absolute right-0 top-6">{endAdornment}</div>}
    </div>
  );
}
