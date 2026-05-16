export default function TaskCardSkeleton({ count = 3 }) {
  return (
    <ul className="space-y-3" aria-busy="true" aria-label="Loading tasks">
      {Array.from({ length: count }).map((_, i) => (
        <li key={i} className="glass-card p-4">
          <div className="skeleton-shimmer mb-3 h-4 w-3/4 max-w-[220px] rounded-lg" />
          <div className="skeleton-shimmer mb-4 h-3 w-full max-w-[280px] rounded-md" />
          <div className="skeleton-shimmer h-3 w-1/2 max-w-[120px] rounded-md" />
        </li>
      ))}
    </ul>
  );
}
