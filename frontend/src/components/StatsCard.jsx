import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function StatsCard({ icon: Icon, label, value, sublabel, trend, color = 'accent' }) {
  const colorMap = {
    accent: { icon: 'text-accent-light', bg: 'rgba(99,102,241,0.12)' },
    green: { icon: 'text-success', bg: 'rgba(34,197,94,0.12)' },
    blue: { icon: 'text-info', bg: 'rgba(59,130,246,0.12)' },
    pink: { icon: 'text-danger', bg: 'rgba(239,68,68,0.12)' },
    orange: { icon: 'text-warning', bg: 'rgba(245,158,11,0.12)' },
    yellow: { icon: 'text-warning', bg: 'rgba(245,158,11,0.12)' },
    cyan: { icon: 'text-info', bg: 'rgba(59,130,246,0.12)' },
  };

  const c = colorMap[color] || colorMap.accent;

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'text-success' : trend === 'down' ? 'text-danger' : 'text-text-muted';

  return (
    <div className="stat-card group">
      <div className="flex items-start justify-between mb-3">
        <div
          className={`icon-container icon-container-sm rounded-xl ${c.icon} transition-transform group-hover:scale-110`}
          style={{ background: c.bg }}
        >
          <Icon size={18} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-medium ${trendColor}`}>
            <TrendIcon size={14} />
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-text-primary mb-1">{value}</p>
      <p className="text-xs text-text-secondary font-medium">{label}</p>
      {sublabel && <p className="text-[10px] text-text-muted mt-1">{sublabel}</p>}
    </div>
  );
}
