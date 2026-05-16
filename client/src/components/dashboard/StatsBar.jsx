import { ClipboardList, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';
import CountUp from '../ui/CountUp.jsx';
import Sparkline from '../ui/Sparkline.jsx';

const STAT_CONFIG = [
  {
    key: 'total',
    label: 'Total Tasks',
    icon: ClipboardList,
    color: '#9d5cff',
    glow: 'shadow-[0_0_24px_rgba(124,58,237,0.35)]',
    iconBg: 'bg-accent/20 text-accent-glow',
  },
  {
    key: 'inProgress',
    label: 'In Progress',
    icon: Clock,
    color: '#06b6d4',
    glow: 'shadow-[0_0_24px_rgba(6,182,212,0.3)]',
    iconBg: 'bg-accent-cyan/20 text-accent-cyan',
  },
  {
    key: 'completedToday',
    label: 'Completed',
    icon: CheckCircle2,
    color: '#10b981',
    glow: 'shadow-[0_0_24px_rgba(16,185,129,0.3)]',
    iconBg: 'bg-success/20 text-success',
  },
  {
    key: 'overdue',
    label: 'Overdue',
    icon: AlertTriangle,
    color: '#ef4444',
    glow: 'shadow-[0_0_24px_rgba(239,68,68,0.3)]',
    iconBg: 'bg-danger/20 text-danger',
  },
];

export default function StatsBar({ stats }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
      {STAT_CONFIG.map(({ key, label, icon: Icon, color, glow, iconBg }) => (
        <div
          key={key}
          className={`glass-card group p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-glow sm:p-5 ${glow}`}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-text-muted">{label}</p>
              <p className="mt-2 font-display text-fluid-2xl font-bold text-text-primary">
                <CountUp end={stats[key]} />
              </p>
              <Sparkline value={stats[key]} color={color} className="mt-3 opacity-70" />
            </div>
            <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
              <Icon className="h-5 w-5" />
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
