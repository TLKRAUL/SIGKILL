import { useState, useEffect, useRef } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Settings, Sparkles, ArrowRight, Wallet } from 'lucide-react';
import { getPantryItems, getBills } from '../api/apiClient';

const useInView = (threshold = 0.1) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold });
    obs.observe(el); return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
};

const Donut = ({ percent, color, size = 160, strokeWidth = 12, label, value }) => {
  const r = (size - strokeWidth) / 2;
  const c = 2 * Math.PI * r;
  const [ap, setAp] = useState(0);
  useEffect(() => { const t = setTimeout(() => setAp(percent), 200); return () => clearTimeout(t); }, [percent]);
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ position: 'relative', width: size, height: size, margin: '0 auto' }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth={strokeWidth} />
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={strokeWidth}
            strokeDasharray={`${(ap/100)*c} ${c}`} strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 1.4s cubic-bezier(.22,1,.36,1)' }} />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 28, fontWeight: 800, color: '#1a1a1a' }}>{value}</span>
          <span style={{ fontSize: 11, color: '#999', marginTop: 2 }}>{label}</span>
        </div>
      </div>
    </div>
  );
};

export default function BudgetPage() {
  const [budget, setBudgetState] = useState(() => {
    try { return Number(localStorage.getItem('sigkill_budget')) || 0; } catch { return 0; }
  });
  const [spent, setSpentState] = useState(() => {
    try { return Number(localStorage.getItem('sigkill_spent')) || 0; } catch { return 0; }
  });
  const [categories, setCategories] = useState([
    { name: 'Alimente', amount: 0, color: '#4dd0c8', emoji: '🛒' },
    { name: 'Facturi', amount: 0, color: '#2563eb', emoji: '📄' },
    { name: 'Recurente', amount: 0, color: '#8b5cf6', emoji: '🔄' },
    { name: 'Economii', amount: 0, color: '#f59e0b', emoji: '💰' },
    { name: 'Altele', amount: 0, color: '#dc2626', emoji: '🎬' },
  ]);
  const [catRef, catVisible] = useInView(0.05);
  const [tipsRef, tipsVisible] = useInView(0.05);

  const setBudget = (val) => { setBudgetState(val); localStorage.setItem('sigkill_budget', val); };
  const setSpent = (val) => { setSpentState(val); localStorage.setItem('sigkill_spent', val); };

  // Calculează categorii de cheltuieli din date reale
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const [pantry, bills] = await Promise.all([
          getPantryItems().catch(() => []),
          getBills().catch(() => []),
        ]);
        const recurring = JSON.parse(localStorage.getItem('sigkill_recurring') || '[]');

        const alimenteTotal = (pantry || []).reduce((s, p) => s + (p.price || 0), 0);
        const facturiTotal = (bills || []).filter(b => b.status === 'paid').reduce((s, b) => s + (b.amount || 0), 0);
        const recurenteTotal = recurring.reduce((s, r) => s + (r.amount || 0), 0);
        const total = alimenteTotal + facturiTotal + recurenteTotal;

        setCategories([
          { name: 'Alimente', amount: Math.round(alimenteTotal * 100) / 100, color: '#4dd0c8', emoji: '🛒' },
          { name: 'Facturi', amount: Math.round(facturiTotal * 100) / 100, color: '#2563eb', emoji: '📄' },
          { name: 'Recurente', amount: Math.round(recurenteTotal * 100) / 100, color: '#8b5cf6', emoji: '🔄' },
          { name: 'Economii', amount: 0, color: '#f59e0b', emoji: '💰' },
          { name: 'Altele', amount: 0, color: '#dc2626', emoji: '🎬' },
        ]);
      } catch {}
    };
    loadCategories();
  }, []);

  const remaining = budget - spent;
  const percentUsed = budget > 0 ? Math.round((spent / budget) * 100) : 0;
  const totalCatAmount = categories.reduce((s, c) => s + c.amount, 0);

  const glass = {
    background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(30px) saturate(140%)',
    border: '1px solid rgba(255,255,255,0.6)', borderRadius: 24,
    boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
  };

  const inputStyle = {
    width: '100%', padding: '14px 16px', borderRadius: 14, fontSize: 14,
    fontFamily: 'inherit', background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(0,0,0,0.08)',
    outline: 'none', color: '#1a1a1a', transition: 'border-color 0.2s, box-shadow 0.2s',
  };

  return (
    <div style={{ fontFamily: "'Inter',-apple-system,sans-serif", position: 'relative', overflow: 'hidden' }} id="budget-page">

      {/* Orbs */}
      <div style={{ position:'absolute', width:450, height:450, borderRadius:'50%', background:'radial-gradient(circle,rgba(37,99,235,0.08) 0%,transparent 70%)', top:'-8%', right:'-5%', animation:'budgetFloat1 10s ease-in-out infinite', pointerEvents:'none' }} />
      <div style={{ position:'absolute', width:350, height:350, borderRadius:'50%', background:'radial-gradient(circle,rgba(124,58,237,0.06) 0%,transparent 70%)', bottom:'5%', left:'-5%', animation:'budgetFloat2 12s ease-in-out infinite', pointerEvents:'none' }} />

      {/* Header */}
      <div style={{ position: 'relative', zIndex: 2, marginBottom: 28, animation: 'budgetFadeUp 0.7s cubic-bezier(.22,1,.36,1) both' }}>
        <p style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#2563eb', marginBottom: 8 }}>
          💰 Finanțe & Buget
        </p>
        <h1 style={{ fontSize: 42, fontWeight: 800, color: '#1a1a1a', lineHeight: 1.1, marginBottom: 8, letterSpacing: '-0.03em' }}>
          Cum stai cu banii?
        </h1>
        <p style={{ fontSize: 15, color: '#777' }}>
          Monitorizează cheltuielile și optimizează-ți bugetul lunar
        </p>
      </div>

      {/* 3 stat cards */}
      <div className="dashboard-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24, position: 'relative', zIndex: 2 }}>
        {[
          { icon: TrendingUp, label: 'Venit lunar', value: `${budget.toLocaleString()} RON`, color: '#16a34a', delay: 0.1 },
          { icon: TrendingDown, label: 'Cheltuieli', value: `${spent.toLocaleString()} RON`, color: '#dc2626', delay: 0.15 },
          { icon: DollarSign, label: 'Disponibil', value: `${remaining.toLocaleString()} RON`, color: '#2563eb', delay: 0.2 },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} style={{
              ...glass, padding: '22px 24px', display: 'flex', alignItems: 'center', gap: 14,
              animation: `budgetFadeUp 0.6s cubic-bezier(.22,1,.36,1) ${s.delay}s both`,
              transition: 'transform 0.25s, box-shadow 0.25s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.04)'; }}>
              <div style={{
                width: 44, height: 44, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: `${s.color}12`, border: `1px solid ${s.color}20`,
              }}>
                <Icon size={20} style={{ color: s.color }} />
              </div>
              <div>
                <p style={{ fontSize: 22, fontWeight: 800, color: s.color === '#dc2626' ? '#dc2626' : '#1a1a1a', margin: 0, lineHeight: 1 }}>{s.value}</p>
                <p style={{ fontSize: 11, color: '#999', margin: 0, marginTop: 3 }}>{s.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main grid */}
      <div className="dashboard-charts-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24, position: 'relative', zIndex: 2 }}>

        {/* Big donut */}
        <div style={{ ...glass, padding: '32px', animation: 'budgetFadeUp 0.7s cubic-bezier(.22,1,.36,1) 0.3s both', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1a1a1a', marginBottom: 20, letterSpacing: '-0.01em' }}>📊 Distribuție cheltuieli</h3>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Donut percent={percentUsed} color="url(#budget-gradient)" size={200} strokeWidth={14} label="consumat" value={`${percentUsed}%`} />
            {/* Hidden SVG for gradient */}
            <svg width={0} height={0} style={{ position: 'absolute' }}>
              <defs>
                <linearGradient id="budget-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#2563eb" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          {/* Progress bar */}
          <div style={{ marginTop: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#999', marginBottom: 6 }}>
              <span>0 RON</span><span>{budget.toLocaleString()} RON</span>
            </div>
            <div style={{ height: 8, borderRadius: 8, background: 'rgba(0,0,0,0.06)', overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 8, transition: 'width 1s cubic-bezier(.22,1,.36,1)',
                width: `${Math.min(percentUsed, 100)}%`,
                background: percentUsed > 80 ? 'linear-gradient(90deg,#dc2626,#f59e0b)' : 'linear-gradient(90deg,#2563eb,#8b5cf6)',
              }} />
            </div>
          </div>
        </div>

        {/* Categories breakdown */}
        <div ref={catRef} style={{ ...glass, padding: '32px', animation: 'budgetFadeUp 0.7s cubic-bezier(.22,1,.36,1) 0.35s both' }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1a1a1a', marginBottom: 20, letterSpacing: '-0.01em' }}>🏷️ Pe categorii</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {categories.map((cat, i) => {
              const pct = totalCatAmount > 0 ? Math.round((cat.amount / totalCatAmount) * 100) : 0;
              return (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 16,
                background: 'rgba(0,0,0,0.02)', transition: 'all 0.3s',
                opacity: catVisible ? 1 : 0, transform: catVisible ? 'translateX(0)' : 'translateX(-16px)',
                transitionDelay: `${0.05 + i * 0.06}s`,
              }}>
                <span style={{ fontSize: 18 }}>{cat.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a' }}>{cat.name}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a' }}>{cat.amount.toLocaleString()} RON</span>
                  </div>
                  <div style={{ height: 5, borderRadius: 5, background: 'rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: 5, background: cat.color,
                      width: catVisible ? `${pct}%` : '0%',
                      transition: `width 1s cubic-bezier(.22,1,.36,1) ${0.3 + i * 0.1}s`,
                    }} />
                  </div>
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: cat.color, minWidth: 36, textAlign: 'right' }}>{pct}%</span>
              </div>
              );
            })}
          </div>
        </div>

        {/* Config */}
        <div style={{ ...glass, padding: '32px', animation: 'budgetFadeUp 0.7s cubic-bezier(.22,1,.36,1) 0.4s both' }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1a1a1a', marginBottom: 20, letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Settings size={18} style={{ color: '#888' }} /> Configurare
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#888', marginBottom: 6 }}>Buget lunar (RON)</label>
              <input type="number" value={budget} onChange={e => setBudget(Number(e.target.value) || 0)} style={inputStyle}
                onFocus={e => { e.target.style.borderColor = 'rgba(37,99,235,0.4)'; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(0,0,0,0.08)'; e.target.style.boxShadow = 'none'; }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#888', marginBottom: 6 }}>Cheltuieli luna asta (RON)</label>
              <input type="number" step="0.01" value={Math.round(spent * 100) / 100} onChange={e => setSpent(Math.round((Number(e.target.value) || 0) * 100) / 100)} style={inputStyle}
                onFocus={e => { e.target.style.borderColor = 'rgba(37,99,235,0.4)'; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(0,0,0,0.08)'; e.target.style.boxShadow = 'none'; }} />
            </div>
            {/* Visual ratio */}
            <div style={{ padding: '16px', borderRadius: 16, background: remaining >= 0 ? 'rgba(22,163,74,0.06)' : 'rgba(220,38,38,0.06)', border: `1px solid ${remaining >= 0 ? 'rgba(22,163,74,0.12)' : 'rgba(220,38,38,0.12)'}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Wallet size={16} style={{ color: remaining >= 0 ? '#16a34a' : '#dc2626' }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: '#555' }}>
                  {remaining >= 0 ? 'Mai ai de cheltuit:' : 'Ai depășit bugetul cu:'}
                </span>
                <span style={{ fontSize: 18, fontWeight: 800, color: remaining >= 0 ? '#16a34a' : '#dc2626', marginLeft: 'auto' }}>
                  {Math.abs(remaining).toLocaleString()} RON
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* AI Tips */}
        <div ref={tipsRef} style={{ ...glass, padding: '32px', animation: 'budgetFadeUp 0.7s cubic-bezier(.22,1,.36,1) 0.45s both' }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1a1a1a', marginBottom: 20, letterSpacing: '-0.01em' }}>💡 Sfaturi AI</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { text: 'Cheltuielile pe alimente au crescut cu 12% față de luna trecută. Scanează bonurile ca să vezi unde se duc banii.', color: '#f59e0b' },
              { text: 'Ai economisit 8% pe facturi — continuă așa! Compară furnizori pe pagina de facturi.', color: '#16a34a' },
              { text: 'Setează un buget maxim pe categorie pentru a primi alerte când te apropii de limită.', color: '#2563eb' },
            ].map((tip, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'flex-start', gap: 10, padding: '14px 16px',
                borderRadius: 16, background: `${tip.color}08`, border: `1px solid ${tip.color}15`,
                opacity: tipsVisible ? 1 : 0, transform: tipsVisible ? 'translateY(0)' : 'translateY(12px)',
                transition: `all 0.5s cubic-bezier(.22,1,.36,1) ${0.1 + i * 0.1}s`,
              }}>
                <Sparkles size={14} style={{ color: tip.color, flexShrink: 0, marginTop: 2 }} />
                <p style={{ fontSize: 13, color: '#555', margin: 0, lineHeight: 1.6 }}>{tip.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes budgetFadeUp { from { opacity:0; transform:translateY(24px) } to { opacity:1; transform:translateY(0) } }
        @keyframes budgetFloat1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-12px,10px)} }
        @keyframes budgetFloat2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(10px,-12px)} }
      `}</style>
    </div>
  );
}
