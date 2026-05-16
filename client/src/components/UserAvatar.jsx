import { getInitials } from '../utils/taskMeta.js';

export default function UserAvatar({ name, avatarUrl, size = 'md', className = '' }) {
  const sizes = {
    sm: 'h-6 w-6 text-[10px]',
    md: 'h-8 w-8 text-xs',
    lg: 'h-10 w-10 text-sm',
  };

  const sizeClass = sizes[size] || sizes.md;

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name ? `${name}'s avatar` : ''}
        className={`rounded-full object-cover ring-2 ring-accent/30 ${sizeClass} ${className}`}
      />
    );
  }

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full bg-accent/20 font-semibold text-accent-glow ring-2 ring-accent/20 ${sizeClass} ${className}`}
      title={name}
    >
      {getInitials(name)}
    </span>
  );
}
