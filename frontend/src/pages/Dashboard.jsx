import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChefHat, ScanLine, Bot, Wallet, FileText, TrendingUp, ArrowRight, Package, AlertTriangle, CalendarClock } from 'lucide-react';
import { getCurrentUser, getStats, getPantryItems, getBills } from '../api/apiClient';

const useInView = (threshold = 0.1) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
};

const Donut = ({ percent, color, size = 110, strokeWidth = 10, label, value }) => {
  const r = (size - strokeWidth) / 2;
  const c = 2 * Math.PI * r;
  const [animPercent, setAnimPercent] = useState(0);
  useEffect(() => { const t = setTimeout(() => setAnimPercent(percent), 100); return () => clearTimeout(t); }, [percent]);
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth={strokeWidth} />
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={strokeWidth}
            strokeDasharray={`${(animPercent/100)*c} ${c}`} strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(.22,1,.36,1)' }} />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 22, fontWeight: 800, color: '#1a1a1a' }}>{value}</span>
        </div>
      </div>
      <p style={{ fontSize: 12, fontWeight: 600, color: '#666', marginTop: 8 }}>{label}</p>
    </div>
  );
};

const features = [
  { icon: ChefHat, title: 'PantryAI & Rețete', desc: 'Inventar cămară + rețete AI', to: '/kitchen', color: '#4dd0c8' },
  { icon: ScanLine, title: 'Scanner AI', desc: 'Scanează bonuri și produse', to: '/scan', color: '#f59e0b' },
  { icon: Bot, title: 'AI Assistant', desc: 'Întreabă orice despre casă', to: '/assistant', color: '#8b5cf6' },
  { icon: Wallet, title: 'Finanțe & Buget', desc: 'Monitorizează cheltuielile', to: '/budget', color: '#16a34a' },
  { icon: FileText, title: 'Facturi & Plăți', desc: 'Urmărește scadențele', to: '/bills', color: '#2563eb' },
  { icon: TrendingUp, title: 'Plan Dietă', desc: 'Nutriție personalizată AI', to: '/diet', color: '#dc2626' },
];

export default function HomePage() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({});
  const [pantry, setPantry] = useState([]);
  const [bills, setBills] = useState([]);
  const navigate = useNavigate();
  const [featRef, featVisible] = useInView(0.05);

  useEffect(() => {
    const u = getCurrentUser(); if (u) setUser(u);
    getStats().then(setStats).catch(() => {});
    getPantryItems().then(d => setPantry(Array.isArray(d) ? d : d?.items || [])).catch(() => {});
    getBills().then(d => setBills(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Bună dimineața';
    if (h < 18) return 'Bună ziua';
    return 'Bună seara';
  };

  const totalProducts = stats?.totalProducts ?? pantry.length;
  const expiring = stats?.expiringProducts ?? pantry.filter(p => {
    if (!p.expiryDate) return false;
    const diff = (new Date(p.expiryDate) - new Date()) / 86400000;
    return diff >= 0 && diff <= 3;
  }).length;
  const unpaidBills = bills.filter(b => b.status === 'unpaid' || b.status === 'neplătită').length;
  const totalBillsAmount = bills.reduce((s, b) => s + (b.amount || 0), 0);

  const glass = {
    background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(30px) saturate(140%)',
    border: '1px solid rgba(255,255,255,0.6)', borderRadius: 24,
    boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
  };

  return (
    <div style={{
      fontFamily: "'Inter',-apple-system,sans-serif",
      position: 'relative', overflow: 'hidden',
    }} id="home-page">

      {/* Decorative orbs */}
      <div style={{ position:'absolute', width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle,rgba(77,208,200,0.1) 0%,transparent 70%)', top:'-10%', right:'-5%', animation:'homeFloat1 10s ease-in-out infinite', pointerEvents:'none' }} />
      <div style={{ position:'absolute', width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle,rgba(139,92,246,0.07) 0%,transparent 70%)', bottom:'10%', left:'-5%', animation:'homeFloat2 12s ease-in-out infinite', pointerEvents:'none' }} />

      {/* Greeting */}
      <div style={{ position: 'relative', zIndex: 2, animation: 'homeFadeUp 0.7s cubic-bezier(.22,1,.36,1) both' }}>
        <p style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#4dd0c8', marginBottom: 8 }}>
          Home Management Platform
        </p>
        <h1 style={{ fontSize: 42, fontWeight: 800, color: '#1a1a1a', lineHeight: 1.1, marginBottom: 8, letterSpacing: '-0.03em' }}>
          {greeting()}, {user?.name || 'User'} 👋
        </h1>
        <p style={{ fontSize: 15, color: '#777', marginBottom: 12 }}>
          Iată un rezumat al casei tale de astăzi
        </p>
        {/* Budget remaining banner */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 10, padding: '10px 24px',
          borderRadius: 50, background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.6)', boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
          marginBottom: 24,
        }}>
          <Wallet size={16} style={{ color: '#16a34a' }} />
          <span style={{ fontSize: 14, fontWeight: 600, color: '#333' }}>Facturi neplătite: <span style={{ color: totalBillsAmount > 0 ? '#dc2626' : '#16a34a', fontWeight: 800 }}>{totalBillsAmount > 0 ? totalBillsAmount.toLocaleString() : '0'} RON</span></span>
        </div>
      </div>

      {/* Stats row */}
      <div className="dashboard-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24, position: 'relative', zIndex: 2 }}>
        {[
          { icon: Package, label: 'Produse', value: totalProducts, color: '#4dd0c8', delay: 0.1 },
          { icon: AlertTriangle, label: 'Expiră curând', value: expiring, color: '#f59e0b', delay: 0.15 },
          { icon: FileText, label: 'Facturi neplătite', value: unpaidBills, color: '#dc2626', delay: 0.2 },
          { icon: CalendarClock, label: 'Total facturi', value: `${totalBillsAmount} RON`, color: '#2563eb', delay: 0.25 },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} style={{
              ...glass, padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 14,
              animation: `homeFadeUp 0.6s cubic-bezier(.22,1,.36,1) ${s.delay}s both`,
              transition: 'transform 0.25s, box-shadow 0.25s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.04)'; }}>
              <div style={{
                width: 42, height: 42, borderRadius: 13, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: `${s.color}15`, border: `1px solid ${s.color}25`,
              }}>
                <Icon size={18} style={{ color: s.color }} />
              </div>
              <div>
                <p style={{ fontSize: 22, fontWeight: 800, color: '#1a1a1a', margin: 0, lineHeight: 1 }}>{s.value}</p>
                <p style={{ fontSize: 11, color: '#999', margin: 0, marginTop: 2 }}>{s.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dashboard grid - 2 columns */}
      <div className="dashboard-charts-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24, position: 'relative', zIndex: 2 }}>

        {/* Budget donut card */}
        <div style={{ ...glass, padding: '28px', animation: 'homeFadeUp 0.7s cubic-bezier(.22,1,.36,1) 0.3s both', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1a1a1a', marginBottom: 20, letterSpacing: '-0.01em' }}>📊 Buget Lunar</h3>
          <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', flex: 1 }}>
            <Donut percent={totalProducts > 0 ? Math.min(100, Math.round((totalProducts / Math.max(totalProducts + unpaidBills, 1)) * 100)) : 0} color="#4dd0c8" size={130} label="Cămară" value={`${totalProducts}`} />
            <Donut percent={unpaidBills > 0 ? Math.min(100, Math.round((unpaidBills / Math.max(totalProducts + unpaidBills, 1)) * 100)) : 0} color="#8b5cf6" size={130} label="Facturi" value={`${unpaidBills}`} />
            <Donut percent={0} color="#f59e0b" size={130} label="Altele" value="0" />
          </div>
          <div style={{ display: 'flex', gap: 20, justifyContent: 'center', marginTop: 20 }}>
            {[
              { c: '#4dd0c8', l: 'Cămară' }, { c: '#8b5cf6', l: 'Utilități' }, { c: '#f59e0b', l: 'Altele' },
            ].map((d, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: d.c }} />
                <span style={{ fontSize: 12, fontWeight: 500, color: '#777' }}>{d.l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pantry summary card */}
        <div style={{ ...glass, padding: '28px', animation: 'homeFadeUp 0.7s cubic-bezier(.22,1,.36,1) 0.35s both' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1a1a1a', letterSpacing: '-0.01em' }}>🗄️ Cămara ta</h3>
            <button onClick={() => navigate('/kitchen')} style={{
              background: 'none', border: 'none', fontSize: 12, color: '#4dd0c8',
              cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4,
            }}>Vezi tot <ArrowRight size={12} /></button>
          </div>
          {pantry.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {pantry.slice(0, 5).map((item, i) => {
                const daysLeft = item.expiryDate ? Math.ceil((new Date(item.expiryDate) - new Date()) / 86400000) : null;
                const urgent = daysLeft !== null && daysLeft <= 3;
                return (
                  <div key={i} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '10px 14px', borderRadius: 14, background: 'rgba(0,0,0,0.02)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 4, height: 28, borderRadius: 3, background: urgent ? '#dc2626' : '#4dd0c8' }} />
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a', margin: 0 }}>{item.name}</p>
                        <p style={{ fontSize: 10, color: '#999', margin: 0 }}>{Number(item.quantity || 1).toLocaleString('ro-RO', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} {item.unit || 'buc'}</p>
                      </div>
                    </div>
                    {daysLeft !== null && (
                      <span style={{ fontSize: 10, fontWeight: 600, color: urgent ? '#dc2626' : '#16a34a', padding: '3px 8px', borderRadius: 8, background: urgent ? 'rgba(220,38,38,0.08)' : 'rgba(22,163,74,0.08)' }}>
                        {daysLeft <= 0 ? 'Expirat' : `${daysLeft} zile`}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <p style={{ fontSize: 32, marginBottom: 8 }}>🗄️</p>
              <p style={{ fontSize: 13, color: '#999' }}>Cămara e goală. Scanează un bon!</p>
              <button onClick={() => navigate('/scan')} style={{
                marginTop: 10, padding: '8px 18px', borderRadius: 50, fontSize: 12, fontWeight: 600,
                background: '#4dd0c8', color: 'white', border: 'none', cursor: 'pointer',
              }}>Scanează acum</button>
            </div>
          )}
        </div>

        {/* Bills summary */}
        <div style={{ ...glass, padding: '28px', animation: 'homeFadeUp 0.7s cubic-bezier(.22,1,.36,1) 0.4s both' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1a1a1a', letterSpacing: '-0.01em' }}>📄 Facturi Recente</h3>
            <button onClick={() => navigate('/bills')} style={{
              background: 'none', border: 'none', fontSize: 12, color: '#2563eb',
              cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4,
            }}>Vezi tot <ArrowRight size={12} /></button>
          </div>
          {bills.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {bills.slice(0, 4).map((bill, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 14px', borderRadius: 14, background: 'rgba(0,0,0,0.02)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 4, height: 28, borderRadius: 3, background: bill.status === 'unpaid' || bill.status === 'neplătită' ? '#dc2626' : '#16a34a' }} />
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a', margin: 0 }}>{bill.service || bill.name || 'Factură'}</p>
                      <p style={{ fontSize: 10, color: '#999', margin: 0 }}>{bill.provider || '—'}</p>
                    </div>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a' }}>{bill.amount} RON</span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <p style={{ fontSize: 32, marginBottom: 8 }}>📄</p>
              <p style={{ fontSize: 13, color: '#999' }}>Nicio factură încă. Scanează una!</p>
              <button onClick={() => navigate('/bills')} style={{
                marginTop: 10, padding: '8px 18px', borderRadius: 50, fontSize: 12, fontWeight: 600,
                background: '#2563eb', color: 'white', border: 'none', cursor: 'pointer',
              }}>Adaugă factură</button>
            </div>
          )}
        </div>

        {/* AI quick actions */}
        <div style={{ ...glass, padding: '28px', animation: 'homeFadeUp 0.7s cubic-bezier(.22,1,.36,1) 0.45s both' }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1a1a1a', marginBottom: 18, letterSpacing: '-0.01em' }}>⚡ Acțiuni rapide AI</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { emoji: '📱', text: 'Scanează un bon fiscal', action: () => navigate('/scan'), color: '#f59e0b' },
              { emoji: '👨‍🍳', text: 'Generează o rețetă AI', action: () => navigate('/kitchen'), color: '#4dd0c8' },
              { emoji: '🤖', text: 'Întreabă AI Assistantul', action: () => navigate('/assistant'), color: '#8b5cf6' },
              { emoji: '📊', text: 'Creează plan dietă', action: () => navigate('/diet'), color: '#dc2626' },
            ].map((a, i) => (
              <button key={i} onClick={a.action} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 14,
                background: 'rgba(0,0,0,0.02)', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                transition: 'all 0.2s', width: '100%', textAlign: 'left',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = `${a.color}10`; e.currentTarget.style.transform = 'translateX(4px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.02)'; e.currentTarget.style.transform = 'translateX(0)'; }}>
                <span style={{ fontSize: 18 }}>{a.emoji}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a', flex: 1 }}>{a.text}</span>
                <ArrowRight size={14} style={{ color: '#ccc' }} />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Features grid */}
      <div ref={featRef} style={{ position: 'relative', zIndex: 2 }}>
        <p style={{
          fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em',
          color: '#999', marginBottom: 16,
          opacity: featVisible ? 1 : 0, transform: featVisible ? 'translateY(0)' : 'translateY(12px)',
          transition: 'all 0.5s cubic-bezier(.22,1,.36,1)',
        }}>Explorează funcționalitățile</p>
        <div className="dashboard-actions-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <button key={i} onClick={() => navigate(f.to)} style={{
                ...glass, padding: '24px 22px', textAlign: 'left', cursor: 'pointer',
                fontFamily: 'inherit', transition: 'all 0.3s',
                opacity: featVisible ? 1 : 0, transform: featVisible ? 'translateY(0)' : 'translateY(20px)',
                transitionDelay: `${0.05 + i * 0.06}s`,
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = featVisible ? 'translateY(0)' : 'translateY(20px)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.04)'; }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: `${f.color}12`, border: `1px solid ${f.color}25`,
                  }}>
                    <Icon size={18} style={{ color: f.color }} />
                  </div>
                  <ArrowRight size={13} style={{ color: '#ccc' }} />
                </div>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a', marginBottom: 4 }}>{f.title}</h3>
                <p style={{ fontSize: 12, color: '#999', margin: 0, lineHeight: 1.5 }}>{f.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes homeFadeUp { from { opacity:0; transform:translateY(24px) } to { opacity:1; transform:translateY(0) } }
        @keyframes homeFloat1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-15px,12px)} }
        @keyframes homeFloat2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(12px,-15px)} }
      `}</style>
    </div>
  );
}