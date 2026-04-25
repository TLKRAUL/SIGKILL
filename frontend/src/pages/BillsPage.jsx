import { useState } from 'react';
import {
  FileText, Zap, Droplets, Wifi, Flame, Home,
  CheckCircle2, XCircle, Clock, Download, Brain,
  Sparkles, BarChart3, TrendingUp
} from 'lucide-react';

const demoBills = [
  { id: 1, service: 'Curent Electric', provider: 'Enel', amount: 250, dueDate: '2026-05-15', status: 'unpaid', icon: Zap, color: '#ffd166' },
  { id: 2, service: 'Apă & Canal', provider: 'Vitalia', amount: 120, dueDate: '2026-05-18', status: 'pending', icon: Droplets, color: '#00d9ff' },
  { id: 3, service: 'Internet & TV', provider: 'RDS-RCS', amount: 80, dueDate: '2026-05-20', status: 'pending', icon: Wifi, color: '#a29bfe' },
  { id: 4, service: 'Gaz Natural', provider: 'Engie', amount: 420, dueDate: '2026-05-22', status: 'pending', icon: Flame, color: '#ff6b35' },
  { id: 5, service: 'Chirie', provider: 'Proprietar', amount: 1500, dueDate: '2026-05-01', status: 'paid', icon: Home, color: '#00f5a0' },
];

const statusConfig = {
  paid: { label: 'Plătită', icon: CheckCircle2, color: 'text-neon-green', bg: 'bg-neon-green/10 border-neon-green/20' },
  unpaid: { label: 'Neplătită', icon: XCircle, color: 'text-neon-pink', bg: 'bg-neon-pink/10 border-neon-pink/20' },
  pending: { label: 'În așteptare', icon: Clock, color: 'text-neon-yellow', bg: 'bg-neon-yellow/10 border-neon-yellow/20' },
};

const monthlyHistory = [
  { month: 'Ian', total: 780 },
  { month: 'Feb', total: 920 },
  { month: 'Mar', total: 850 },
  { month: 'Apr', total: 1100 },
  { month: 'Mai', total: 870 },
  { month: 'Iun', total: 950 },
];

export default function BillsPage() {
  const [bills, setBills] = useState(demoBills);

  const totalDue = bills.filter(b => b.status !== 'paid').reduce((s, b) => s + b.amount, 0);
  const unpaidCount = bills.filter(b => b.status === 'unpaid').length;
  const nextDue = bills.filter(b => b.status !== 'paid').sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))[0];
  const avgMonthly = Math.round(monthlyHistory.reduce((s, m) => s + m.total, 0) / monthlyHistory.length);
  const maxMonth = Math.max(...monthlyHistory.map(m => m.total));

  const handlePay = (id) => {
    setBills(prev => prev.map(b => b.id === id ? { ...b, status: 'paid' } : b));
  };

  return (
    <div className="relative z-10 max-w-6xl mx-auto px-6 pb-6 pt-24 page-enter" id="bills-page">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <FileText size={14} className="text-neon-cyan" />
          <span className="text-[10px] font-hud text-neon-cyan/60 tracking-[0.2em] uppercase">Gestionare Facturi</span>
        </div>
        <h1 className="text-3xl font-hud font-bold text-white tracking-wider">
          PANOU <span className="gradient-text">FACTURI</span>
        </h1>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="hud-panel p-5 hud-corners animate-scale-in stagger-1">
          <span className="text-[10px] font-hud text-dark-300 tracking-wider uppercase">Total Scadente</span>
          <p className="text-3xl font-hud font-bold text-white mt-2">{bills.filter(b => b.status !== 'paid').length}</p>
        </div>
        <div className="hud-panel p-5 hud-corners animate-scale-in stagger-2">
          <span className="text-[10px] font-hud text-dark-300 tracking-wider uppercase">Sumă Totală</span>
          <p className="text-3xl font-hud font-bold text-neon-cyan mt-2">{totalDue} <span className="text-sm">RON</span></p>
        </div>
        <div className="hud-panel p-5 hud-corners animate-scale-in stagger-3">
          <span className="text-[10px] font-hud text-dark-300 tracking-wider uppercase">Următorul Termen</span>
          <p className="text-xl font-hud font-bold text-neon-yellow mt-2">{nextDue ? new Date(nextDue.dueDate).toLocaleDateString('ro-RO', { day: 'numeric', month: 'short' }) : 'N/A'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bills Table */}
        <div className="lg:col-span-2 hud-panel p-6 animate-scale-in stagger-4 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[rgba(0,217,255,0.1)]">
                <th className="text-left text-[10px] font-hud text-neon-cyan/60 tracking-wider uppercase pb-3">Serviciu</th>
                <th className="text-left text-[10px] font-hud text-neon-cyan/60 tracking-wider uppercase pb-3">Furnizor</th>
                <th className="text-right text-[10px] font-hud text-neon-cyan/60 tracking-wider uppercase pb-3">Sumă</th>
                <th className="text-center text-[10px] font-hud text-neon-cyan/60 tracking-wider uppercase pb-3">Scadență</th>
                <th className="text-center text-[10px] font-hud text-neon-cyan/60 tracking-wider uppercase pb-3">Stare</th>
                <th className="text-right text-[10px] font-hud text-neon-cyan/60 tracking-wider uppercase pb-3">Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              {bills.map((bill) => {
                const Icon = bill.icon;
                const st = statusConfig[bill.status];
                const StIcon = st.icon;
                return (
                  <tr key={bill.id} className="border-b border-[rgba(255,255,255,0.03)] hover:bg-[rgba(0,217,255,0.03)] transition-colors">
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${bill.color}15` }}>
                          <Icon size={16} style={{ color: bill.color }} />
                        </div>
                        <span className="text-sm text-white font-medium">{bill.service}</span>
                      </div>
                    </td>
                    <td className="text-sm text-dark-300">{bill.provider}</td>
                    <td className="text-right text-sm font-mono text-white font-bold">{bill.amount} RON</td>
                    <td className="text-center text-xs text-dark-400">{new Date(bill.dueDate).toLocaleDateString('ro-RO')}</td>
                    <td className="text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium border ${st.bg} ${st.color}`}>
                        <StIcon size={10} />
                        {st.label}
                      </span>
                    </td>
                    <td className="text-right">
                      {bill.status === 'paid' ? (
                        <button className="text-[10px] px-3 py-1.5 rounded-lg bg-neon-green/10 text-neon-green border border-neon-green/20 flex items-center gap-1 ml-auto">
                          <Download size={10} /> Chitanță
                        </button>
                      ) : (
                        <button
                          onClick={() => handlePay(bill.id)}
                          className="text-[10px] px-3 py-1.5 rounded-lg bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20 hover:bg-neon-cyan/20 transition-colors flex items-center gap-1 ml-auto"
                        >
                          Plătește Acum
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          {/* Monthly Chart */}
          <div className="hud-panel p-6 animate-scale-in stagger-5">
            <h3 className="text-[10px] font-hud text-neon-cyan/60 tracking-wider uppercase mb-4 flex items-center gap-2">
              <BarChart3 size={14} />
              Istoric Consum
            </h3>
            <div className="flex items-end gap-2 h-32">
              {monthlyHistory.map((m, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t-md transition-all duration-700 ease-out"
                    style={{
                      height: `${(m.total / maxMonth) * 100}%`,
                      background: `linear-gradient(to top, rgba(0,217,255,0.3), rgba(0,245,160,0.5))`,
                      animationDelay: `${i * 0.1}s`,
                    }}
                  />
                  <span className="text-[9px] text-dark-400">{m.month}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-[10px] text-dark-400">Media Lunară:</span>
              <span className="text-sm font-hud font-bold text-neon-cyan">{avgMonthly} RON</span>
            </div>
          </div>

          {/* AI Tips */}
          <div className="hud-panel p-6 animate-scale-in stagger-6 glass-cyan">
            <h3 className="text-[10px] font-hud text-neon-cyan/60 tracking-wider uppercase mb-3 flex items-center gap-2">
              <Brain size={14} />
              Sfaturi AI Facturi
            </h3>
            <div className="flex items-start gap-2 text-xs text-dark-200">
              <Sparkles size={14} className="text-neon-yellow flex-shrink-0 mt-0.5" />
              <p><strong className="text-white">Sfat AI:</strong> „Factura de gaz este cu 20% mai mare decât luna trecută. Vă recomandăm o scanare a contorului."</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
