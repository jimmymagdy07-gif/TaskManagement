import TaskCard from './TaskCard.jsx';
import EmptyState from './ui/EmptyState.jsx';
import TaskCardSkeleton from './ui/TaskCardSkeleton.jsx';

export default function TaskList({ tasks, loading, error, onTaskClick, onCreateTask }) {
  if (loading) {
    return <TaskCardSkeleton count={4} />;
  }

  if (error) {
    return (
      <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 py-12 text-center text-rose-300">
        {error}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <EmptyState
        variant="tasks"
        onAction={onCreateTask}
        actionLabel="Create your first task"
      />
    );
  }

  return (
    <ul className="space-y-3">
      {tasks.map((task) => (
        <li key={task.id}>
          <TaskCard task={task} onClick={onTaskClick} draggable={false} />
        </li>
      ))}
    </ul>
  );
}
