import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, AlertTriangle } from 'lucide-react';
import UserAvatar from './UserAvatar.jsx';
import {
  PRIORITY_STYLES,
  PRIORITY_BORDER,
  formatDueDate,
  isTaskOverdue,
} from '../utils/taskMeta.js';

export default function TaskCard({
  task,
  onClick,
  isDragOverlay = false,
  draggable = true,
  showProjectTag = false,
  isDragging: isDraggingProp,
}) {
  const drag = useDraggable({
    id: task.id,
    data: { task },
    disabled: !draggable || isDragOverlay,
  });

  const isDragging = isDraggingProp ?? drag.isDragging;
  const dueLabel = formatDueDate(task.due_date);
  const overdue = isTaskOverdue(task);

  const style =
    draggable && !isDragOverlay
      ? { transform: CSS.Translate.toString(drag.transform) }
      : undefined;

  const handleClick = () => {
    if (isDragging) return;
    onClick?.(task);
  };

  return (
    <article
      ref={draggable && !isDragOverlay ? drag.setNodeRef : undefined}
      style={style}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          handleClick();
        }
      }}
      {...(draggable && !isDragOverlay ? { ...drag.listeners, ...drag.attributes } : {})}
      className={`glass-card group relative overflow-hidden p-4 text-left transition-all duration-200 ${
        PRIORITY_BORDER[task.priority] || PRIORITY_BORDER.medium
      } ${draggable ? 'cursor-grab active:cursor-grabbing' : ''} ${
        isDragging ? 'task-card-dragging z-50 opacity-90' : 'hover:-translate-y-1 hover:border-white/15 hover:shadow-glow'
      } ${isDragOverlay ? 'shadow-glow ring-2 ring-accent/40' : ''}`}
    >
      <h3
        className={`pr-2 font-semibold leading-snug text-text-primary ${
          task.status === 'done' ? 'line-through opacity-60' : ''
        }`}
      >
        {task.title}
      </h3>

      {task.description && (
        <p className="mt-2 line-clamp-2 text-sm text-text-muted">{task.description}</p>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {dueLabel && (
            <span
              className={`inline-flex items-center gap-1 text-xs ${
                overdue ? 'font-medium text-danger' : 'text-text-muted'
              }`}
            >
              {overdue ? <AlertTriangle className="h-3 w-3" /> : <Calendar className="h-3 w-3" />}
              {dueLabel}
            </span>
          )}
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 ${
              PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.medium
            }`}
          >
            {task.priority}
          </span>
        </div>

        {(task.assignee_name || task.assigned_to) && (
          <UserAvatar
            name={task.assignee_name}
            avatarUrl={task.assignee_avatar_url}
            size="sm"
          />
        )}
      </div>

      {showProjectTag && task.project_name && (
        <div className="mt-3 flex items-center gap-2 border-t border-white/5 pt-3">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: task.project_color || '#7c3aed' }}
          />
          <span className="truncate text-xs text-text-muted">{task.project_name}</span>
        </div>
      )}
    </article>
  );
}
