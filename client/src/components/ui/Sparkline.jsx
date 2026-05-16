export default function Sparkline({ value = 0, color = '#7c3aed', className = '' }) {
  const points = [];
  const n = 12;
  let seed = (value || 1) * 7;

  for (let i = 0; i < n; i += 1) {
    seed = (seed * 9301 + 49297) % 233280;
    const y = 4 + (seed / 233280) * 16;
    points.push(`${(i / (n - 1)) * 80},${24 - y}`);
  }

  return (
    <svg viewBox="0 0 80 24" className={`h-8 w-20 ${className}`} aria-hidden>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points.join(' ')}
        opacity="0.85"
      />
    </svg>
  );
}
