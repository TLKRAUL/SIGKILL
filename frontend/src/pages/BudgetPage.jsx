import { useState, useEffect } from 'react';
import {
  Wallet, TrendingUp, TrendingDown, DollarSign, PieChart,
  Settings, Brain, ArrowUpRight, ArrowDownRight, Sparkles
} from 'lucide-react';

const spendingCategories = [
  { name: 'Alimente', percent: 35, amount: 1575, color: '#00f5a0' },
  { name: 'Facturi', percent: 25, amount: 1125, color: '#00d9ff' },
  { name: 'Transport', percent: 15, amount: 675, color: '#6c5ce7' },
  { name: 'Economii', percent: 15, amount: 675, color: '#ffd166' },
  { name: 'Divertisment', percent: 10, amount: 450, color: '#f72585' },
];

export default function BudgetPage() {
  const [budget, setBudget] = useState(10000);
  const [spent, setSpent] = useState(4500);
  const [animPercent, setAnimPercent] = useState(0);

  useEffect(() => {
    const target = Math.round((spent / budget) * 100);
    let current = 0;
    const interval = setInterval(() => {
      current += 1;
      setAnimPercent(current);
      if (current >= target) clearInterval(interval);
    }, 20);
    return () => clearInterval(interval);
  }, [spent, budget]);

  const remaining = budget - spent;

  return (
    <div className="relative z-10 max-w-6xl mx-auto px-6 pb-6 pt-24 page-enter" id="budget-page">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Wallet size={14} className="text-neon-cyan" />
          <span className="text-[10px] font-hud text-neon-cyan/60 tracking-[0.2em] uppercase">Gestionare Bani</span>
        </div>
        <h1 className="text-3xl font-hud font-bold text-white tracking-wider">
          SITUAȚIA <span className="gradient-text">FINANCIARĂ</span>
        </h1>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="hud-panel p-6 hud-corners animate-scale-in stagger-1">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={16} className="text-neon-green" />
            <span className="text-xs font-hud text-dark-300 tracking-wider uppercase">Venit Lunar</span>
          </div>
          <p className="text-3xl font-hud font-bold text-white">{budget.toLocaleString()}</p>
          <p className="text-xs text-neon-green mt-1">RON</p>
        </div>

        <div className="hud-panel p-6 hud-corners animate-scale-in stagger-2">
          <div className="flex items-center gap-2 mb-3">
            <TrendingDown size={16} className="text-neon-pink" />
            <span className="text-xs font-hud text-dark-300 tracking-wider uppercase">Cheltuieli</span>
          </div>
          <p className="text-3xl font-hud font-bold text-white">{spent.toLocaleString()}</p>
          <p className="text-xs text-neon-pink mt-1">RON</p>
        </div>

        <div className="hud-panel p-6 hud-corners animate-scale-in stagger-3">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign size={16} className="text-neon-cyan" />
            <span className="text-xs font-hud text-dark-300 tracking-wider uppercase">Disponibil</span>
          </div>
          <p className="text-3xl font-hud font-bold text-neon-green">{remaining.toLocaleString()}</p>
          <p className="text-xs text-dark-400 mt-1">RON rămas din buget</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart (visual) */}
        <div className="hud-panel p-6 animate-scale-in stagger-4">
          <h3 className="text-sm font-hud text-neon-cyan tracking-wider uppercase mb-6 flex items-center gap-2">
            <PieChart size={16} />
            Distribuție Cheltuieli
          </h3>
          
          {/* Circular progress */}
          <div className="relative w-48 h-48 mx-auto mb-6">
            <svg className="w-48 h-48 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(0,217,255,0.1)" strokeWidth="6" />
              <circle 
                cx="50" cy="50" r="42" fill="none" 
                stroke="url(#gradient)" strokeWidth="6" 
                strokeLinecap="round"
                strokeDasharray={`${animPercent * 2.64} ${264 - animPercent * 2.64}`}
                className="transition-all duration-300"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#00f5a0" />
                  <stop offset="100%" stopColor="#00d9ff" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-hud font-bold text-white">{animPercent}%</span>
              <span className="text-[10px] text-dark-400">consumat</span>
            </div>
          </div>

          {/* Legend */}
          <div className="space-y-3">
            {spendingCategories.map((cat, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className="text-xs text-dark-200">{cat.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-dark-400">{cat.percent}%</span>
                  <span className="text-xs font-mono text-white">{cat.amount} RON</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Budget Settings + AI Tips */}
        <div className="space-y-6">
          {/* Configure Budget */}
          <div className="hud-panel p-6 animate-scale-in stagger-5">
            <h3 className="text-sm font-hud text-neon-cyan tracking-wider uppercase mb-4 flex items-center gap-2">
              <Settings size={16} />
              Configurare Buget
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-dark-300 mb-2">Introduceți bugetul (RON)</label>
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value) || 0)}
                  className="input-hud"
                />
              </div>
              <div>
                <label className="block text-xs text-dark-300 mb-2">Cheltuieli luna aceasta (RON)</label>
                <input
                  type="number"
                  value={spent}
                  onChange={(e) => setSpent(Number(e.target.value) || 0)}
                  className="input-hud"
                />
              </div>
              {/* Progress bar */}
              <div className="mt-4">
                <div className="flex justify-between text-xs text-dark-400 mb-2">
                  <span>0 RON</span>
                  <span>{budget.toLocaleString()} RON</span>
                </div>
                <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{ 
                      width: `${Math.min((spent / budget) * 100, 100)}%`,
                      background: spent / budget > 0.8 ? 'linear-gradient(90deg, #f72585, #ff6b35)' : 'linear-gradient(90deg, #00f5a0, #00d9ff)'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* AI Tips */}
          <div className="hud-panel p-6 animate-scale-in stagger-6 glass-cyan">
            <h3 className="text-sm font-hud text-neon-cyan tracking-wider uppercase mb-3 flex items-center gap-2">
              <Brain size={16} />
              Sfaturi AI pentru Buget
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 text-sm text-dark-200">
                <Sparkles size={16} className="text-neon-yellow flex-shrink-0 mt-0.5" />
                <p>
                  <strong className="text-white">Sfat AI:</strong> „Ați cheltuit mai mult decât luna trecută pe alimente. 
                  Vă sugerăm o scanare a frigiderului pentru a reduce risipa."
                </p>
              </div>
              <div className="flex items-start gap-3 text-sm text-dark-200">
                <Sparkles size={16} className="text-neon-green flex-shrink-0 mt-0.5" />
                <p>Ați economisit <strong className="text-neon-green">12%</strong> față de luna anterioară pe facturi.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
