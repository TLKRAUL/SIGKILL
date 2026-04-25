import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function StatsCard({ icon: Icon, label, value, sublabel, trend, color = 'accent' }) {
  const colorMap = {
    accent: { icon: 'text-accent-400', border: 'border-accent-500/20', glow: 'rgba(108,92,231,0.15)' },
    green: { icon: 'text-neon-green', border: 'border-neon-green/20', glow: 'rgba(0,245,160,0.15)' },
    blue: { icon: 'text-neon-blue', border: 'border-neon-blue/20', glow: 'rgba(0,217,255,0.15)' },
    pink: { icon: 'text-neon-pink', border: 'border-neon-pink/20', glow: 'rgba(247,37,133,0.15)' },
    orange: { icon: 'text-neon-orange', border: 'border-neon-orange/20', glow: 'rgba(255,107,53,0.15)' },
    yellow: { icon: 'text-neon-yellow', border: 'border-neon-yellow/20', glow: 'rgba(255,209,102,0.15)' },
    cyan: { icon: 'text-neon-cyan', border: 'border-neon-cyan/20', glow: 'rgba(0,255,245,0.15)' },
  };

  const c = colorMap[color] || colorMap.accent;

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'text-neon-green' : trend === 'down' ? 'text-neon-pink' : 'text-dark-300';

  return (
    <div className={`hud-panel p-5 hud-corners group border ${c.border}`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.icon} transition-all duration-300 group-hover:scale-110`}
          style={{ background: c.glow }}
        >
          <Icon size={20} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-medium ${trendColor}`}>
            <TrendIcon size={14} />
          </div>
        )}
      </div>
      <p className="text-2xl font-hud font-bold text-white mb-1">{value}</p>
      <p className="text-xs text-dark-300 font-medium">{label}</p>
      {sublabel && <p className="text-[10px] text-dark-400 mt-1">{sublabel}</p>}
    </div>
  );
}
