import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { Plus } from 'lucide-react';
import TaskCard from '../TaskCard.jsx';

export const COLUMNS = [
  { id: 'todo', title: 'Todo', dot: 'bg-text-muted' },
  { id: 'in_progress', title: 'In Progress', dot: 'bg-accent-cyan' },
  { id: 'done', title: 'Done', dot: 'bg-success' },
];

const COLUMN_IDS = new Set(COLUMNS.map((c) => c.id));

function KanbanColumn({ column, tasks, onTaskClick, onAddTask }) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <div className="flex min-h-[320px] min-w-[280px] flex-1 flex-col md:min-w-0">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${column.dot}`} />
          <h3 className="font-display text-sm font-semibold text-text-primary">{column.title}</h3>
          <span className="rounded-full bg-white/5 px-2 py-0.5 text-xs font-medium text-text-muted">
            {tasks.length}
          </span>
        </div>
        <button
          type="button"
          onClick={() => onAddTask?.(column.id)}
          className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-text-muted transition-colors hover:bg-white/5 hover:text-accent-glow btn-press"
        >
          <Plus className="h-3.5 w-3.5" />
          Add
        </button>
      </div>

      <div
        ref={setNodeRef}
        className={`flex flex-1 flex-col gap-3 rounded-2xl p-2 transition-all duration-200 ${
          isOver ? 'drop-zone-active' : 'bg-bg-secondary/40'
        }`}
      >
        {tasks.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center py-12 text-center animate-float">
            <p className="text-xs text-text-muted">Drop tasks here</p>
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard key={task.id} task={task} onClick={onTaskClick} showProjectTag />
          ))
        )}
      </div>
    </div>
  );
}

function resolveStatus(overId, tasks) {
  if (COLUMN_IDS.has(overId)) return overId;
  const targetTask = tasks.find((t) => t.id === overId);
  return targetTask?.status ?? null;
}

export default function KanbanBoard({ tasks, onStatusChange, onTaskClick, onAddTask, loading }) {
  const [activeTask, setActiveTask] = useState(null);
  const [mobileTab, setMobileTab] = useState('todo');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const tasksByColumn = COLUMNS.reduce((acc, col) => {
    acc[col.id] = tasks.filter((t) => t.status === col.id);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-3">
            <div className="skeleton-shimmer h-6 w-32 rounded-xl" />
            <div className="skeleton-shimmer h-28 rounded-2xl" />
            <div className="skeleton-shimmer h-28 rounded-2xl" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={(e) => {
        const task = tasks.find((t) => t.id === e.active.id);
        setActiveTask(task ?? null);
      }}
      onDragEnd={async (e) => {
        const { active, over } = e;
        setActiveTask(null);
        if (!over) return;
        const task = tasks.find((t) => t.id === active.id);
        if (!task) return;
        const newStatus = resolveStatus(over.id, tasks);
        if (!newStatus || newStatus === task.status) return;
        await onStatusChange(task, newStatus);
      }}
    >
      <div className="mb-4 flex gap-2 md:hidden">
        {COLUMNS.map((col) => (
          <button
            key={col.id}
            type="button"
            onClick={() => setMobileTab(col.id)}
            className={`flex-1 rounded-xl py-2 text-xs font-semibold transition-all btn-press ${
              mobileTab === col.id
                ? 'bg-accent text-white shadow-glow'
                : 'bg-white/5 text-text-muted'
            }`}
          >
            {col.title}
          </button>
        ))}
      </div>

      <div className="flex gap-4 pb-4 md:grid md:grid-cols-3">
        {COLUMNS.map((column) => (
          <div
            key={column.id}
            className={`min-w-0 flex-1 ${column.id !== mobileTab ? 'hidden md:block' : ''}`}
          >
            <KanbanColumn
              column={column}
              tasks={tasksByColumn[column.id] || []}
              onTaskClick={onTaskClick}
              onAddTask={onAddTask}
            />
          </div>
        ))}
      </div>

      <DragOverlay dropAnimation={null}>
        {activeTask ? (
          <TaskCard task={activeTask} isDragOverlay showProjectTag isDragging />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
