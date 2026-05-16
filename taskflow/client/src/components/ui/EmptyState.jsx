import { ClipboardList, FolderKanban } from 'lucide-react';

const ILLUSTRATIONS = {
  tasks: ClipboardList,
  projects: FolderKanban,
};

export default function EmptyState({
  variant = 'tasks',
  title,
  description,
  actionLabel,
  onAction,
}) {
  const Icon = ILLUSTRATIONS[variant] || ClipboardList;

  const defaults = {
    tasks: {
      title: 'No tasks yet',
      description: 'Create your first task and start organizing your work.',
      actionLabel: 'Create your first task',
    },
    projects: {
      title: 'No projects yet',
      description: 'Projects help you group related tasks. Create one to get started.',
      actionLabel: 'Create your first project',
    },
  };

  const copy = defaults[variant] || defaults.tasks;

  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-bg-card/30 px-6 py-16 text-center animate-float">
      <div className="relative mb-6">
        <span className="absolute -inset-4 rounded-full bg-accent/10 blur-2xl" aria-hidden />
        <span className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-accent/15 ring-1 ring-accent/30">
          <Icon className="h-10 w-10 text-accent-glow" strokeWidth={1.25} />
        </span>
      </div>
      <h3 className="font-display text-lg font-bold text-text-primary">
        {title || copy.title}
      </h3>
      <p className="mt-2 max-w-sm text-sm text-text-muted">
        {description || copy.description}
      </p>
      {onAction && (
        <button type="button" onClick={onAction} className="gradient-btn mt-6 px-5 py-2.5 text-sm">
          {actionLabel || copy.actionLabel}
        </button>
      )}
    </div>
  );
}
