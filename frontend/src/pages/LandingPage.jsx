import { useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { ArrowDown, ChevronRight } from 'lucide-react';

const useInView = (threshold = 0.15) => {
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

const Donut = ({ size = 90, data }) => {
  const r = size * 0.38, c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e5e7eb" strokeWidth={size*0.13} />
      {data.map((d, i) => {
        const dash = c * d.pct;
        const el = <circle key={i} cx={size/2} cy={size/2} r={r} fill="none" stroke={d.color}
          strokeWidth={size*0.13} strokeDasharray={`${dash} ${c}`} strokeDashoffset={-offset}
          strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`} />;
        offset += dash;
        return el;
      })}
    </svg>
  );
};

const donutData = [
  { pct: 0.4, color: '#4dd0c8', label: 'Cămară', amount: '1,150' },
  { pct: 0.28, color: '#f59e0b', label: 'Transport', amount: '730' },
  { pct: 0.2, color: '#8b5cf6', label: 'Divertisment', amount: '620' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [ref1, v1] = useInView();
  const [ref2, v2] = useInView();
  const [ref3, v3] = useInView();

  const anim = (visible, delay = 0) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(32px)',
    transition: `all 0.7s cubic-bezier(.22,1,.36,1) ${delay}s`,
  });

  return (
    <div id="landing-page" style={{ overflowX: 'hidden', fontFamily: "'Inter',-apple-system,sans-serif" }}>

      {/* ========== HERO ========== */}
      <section style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', position: 'relative',
        background: 'linear-gradient(160deg, #c8e0dd 0%, #d6e5ea 25%, #e8eff2 50%, #d4e3e0 80%, #bdd8d4 100%)',
        padding: '0 24px',
      }}>
        {/* Animated decorative orbs */}
        <div style={{ position:'absolute', width:550, height:550, borderRadius:'50%', background:'radial-gradient(circle,rgba(77,208,200,0.14) 0%,transparent 70%)', top:'-12%', right:'-10%', animation:'heroFloat1 8s ease-in-out infinite' }} />
        <div style={{ position:'absolute', width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle,rgba(139,92,246,0.1) 0%,transparent 70%)', bottom:'2%', left:'-8%', animation:'heroFloat2 10s ease-in-out infinite' }} />
        <div style={{ position:'absolute', width:250, height:250, borderRadius:'50%', background:'radial-gradient(circle,rgba(245,158,11,0.07) 0%,transparent 70%)', top:'60%', right:'15%', animation:'heroFloat3 12s ease-in-out infinite' }} />

        {/* Logo — outside the card */}
        <div style={{
          display:'flex', alignItems:'center', gap:16, marginBottom:28, position:'relative', zIndex:3,
          animation:'heroFadeUp 0.8s cubic-bezier(.22,1,.36,1) 0s both',
        }}>
          <div style={{
            width:80, height:80, borderRadius:22,
            background:'rgba(255,255,255,0.6)', backdropFilter:'blur(24px)',
            border:'1px solid rgba(255,255,255,0.7)',
            boxShadow:'0 8px 32px rgba(77,208,200,0.2), 0 2px 8px rgba(0,0,0,0.04)',
            display:'flex', alignItems:'center', justifyContent:'center',
          }}>
            <span style={{
              fontSize:42, fontWeight:800, color:'#4dd0c8', lineHeight:1,
              fontFamily:"'Georgia',serif",
              textShadow:'0 0 20px rgba(77,208,200,0.4)',
              animation:'heroPulseGlow 3s ease-in-out infinite',
            }}>H</span>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
            <span style={{ fontSize:24, fontWeight:700, letterSpacing:'0.16em', textTransform:'uppercase', color:'#333', lineHeight:1.15 }}>Home</span>
            <span style={{ fontSize:24, fontWeight:700, letterSpacing:'0.16em', textTransform:'uppercase', color:'#333', lineHeight:1.15 }}>Management</span>
          </div>
        </div>

        {/* Glass card */}
        <div style={{
          background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(50px) saturate(150%)',
          borderRadius: 36, padding: '56px 72px 64px', maxWidth: 860, width: '100%',
          textAlign: 'center', border: '1px solid rgba(255,255,255,0.6)',
          boxShadow: '0 16px 64px rgba(0,0,0,0.06), 0 2px 4px rgba(0,0,0,0.03)',
          position: 'relative', zIndex: 2,
        }}>
          <h1 style={{ fontSize:52, fontWeight:800, color:'#1a1a1a', lineHeight:1.08, marginBottom:20, letterSpacing:'-0.03em', animation:'heroFadeUp 0.8s cubic-bezier(.22,1,.36,1) 0.15s both' }}>
            Totul din casă,<br />
            într-un singur <span style={{ color:'#4dd0c8' }}>loc</span>.
          </h1>

          <p style={{ fontSize:18, color:'#666', lineHeight:1.7, maxWidth:460, margin:'0 auto 36px', animation:'heroFadeUp 0.8s cubic-bezier(.22,1,.36,1) 0.3s both' }}>
            Cămară, buget, facturi, rețete – toate gestionate cu AI.
          </p>

          <div style={{ display:'flex', justifyContent:'center', gap:14, animation:'heroFadeUp 0.8s cubic-bezier(.22,1,.36,1) 0.6s both' }}>
            <button onClick={() => navigate('/login')} style={{
              padding: '15px 36px', borderRadius: 50, fontSize: 15, fontWeight: 700,
              background: '#1a1a1a', color: 'white', border: 'none', cursor: 'pointer',
              fontFamily: 'inherit', transition: 'all 0.25s', boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform='scale(1.03)'; e.currentTarget.style.boxShadow='0 6px 24px rgba(0,0,0,0.2)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform='scale(1)'; e.currentTarget.style.boxShadow='0 4px 16px rgba(0,0,0,0.15)'; }}>
              Intră în cont
            </button>
            <button onClick={() => navigate('/pricing')} style={{
              padding: '15px 36px', borderRadius: 50, fontSize: 15, fontWeight: 700,
              background: 'rgba(255,255,255,0.7)', color: '#444', border: '1.5px solid rgba(0,0,0,0.12)',
              cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.25s', backdropFilter: 'blur(8px)',
            }}
            onMouseEnter={e => { e.currentTarget.style.background='white'; e.currentTarget.style.borderColor='rgba(0,0,0,0.25)'; }}
            onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.7)'; e.currentTarget.style.borderColor='rgba(0,0,0,0.12)'; }}>
              Vezi planuri și prețuri
            </button>
          </div>
        </div>

        <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior:'smooth' })}
          style={{ position:'absolute', bottom:36, background:'none', border:'none', color:'#888', cursor:'pointer' }}>
          <ArrowDown size={22} style={{ animation: 'landBounce 2s infinite' }} />
        </button>
      </section>

      {/* ========== FEATURES ========== */}
      <section id="features" ref={ref1} style={{
        padding: '100px 24px 80px',
        background: 'linear-gradient(180deg, #e8eff2 0%, #f0f4f5 100%)',
      }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <p style={{ ...anim(v1), textAlign: 'center', fontSize: 12, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#4dd0c8', marginBottom: 12 }}>
            Caracteristici Principale
          </p>
          <h2 style={{ ...anim(v1, 0.1), textAlign: 'center', fontSize: 36, fontWeight: 800, color: '#1a1a1a', marginBottom: 56, letterSpacing: '-0.02em' }}>
            Tot ce ai nevoie, într-o singură platformă
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
            {/* Kitchen with overlays */}
            <div style={{
              ...anim(v1, 0.15), position: 'relative', borderRadius: 24, overflow: 'hidden', minHeight: 440,
              backgroundImage: 'url(/kitchen-bg.png)', backgroundSize: 'cover', backgroundPosition: 'center',
              border: '2px solid rgba(77,208,200,0.2)', boxShadow: '0 8px 40px rgba(0,0,0,0.1)',
            }}>
              <div style={{ position:'absolute', inset:0, background:'linear-gradient(180deg,rgba(0,0,0,0.05) 0%,rgba(0,0,0,0.4) 100%)' }} />
              <div style={{ position:'absolute', top:60, right:28, display:'flex', flexDirection:'column', gap:12, zIndex:2 }}>
                {[
                  { icon: '📱', title: 'Scanner', desc: 'Încarcă bonuri și scanează produse instantaneu cu AI.' },
                  { icon: '🗄️', title: 'Inventar', desc: 'Știi exact ce ai în cămară și când expiră.' },
                  { icon: '👨‍🍳', title: 'Rețete AI', desc: 'Sugestii personalizate din ingredientele disponibile.' },
                ].map((f, i) => (
                  <div key={i} style={{
                    background: 'rgba(255,255,255,0.95)', borderRadius: 16, padding: '14px 18px', maxWidth: 280,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)', backdropFilter: 'blur(10px)',
                    transform: v1 ? 'translateX(0)' : 'translateX(40px)', opacity: v1 ? 1 : 0,
                    transition: `all 0.6s cubic-bezier(.22,1,.36,1) ${0.3 + i * 0.12}s`,
                  }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                      <span style={{ fontSize:16 }}>{f.icon}</span>
                      <span style={{ fontSize:13, fontWeight:700, color:'#1a1a1a' }}>{f.title}</span>
                    </div>
                    <p style={{ fontSize:11, color:'#666', lineHeight:1.5, margin:0 }}>{f.desc}</p>
                  </div>
                ))}
              </div>
              <div style={{ position:'absolute', bottom:20, left:20, right:20, zIndex:2, display:'flex', gap:10 }}>
                {[
                  { icon:'💰', title:'Buget', desc:'Monitorizare cheltuieli și economii lunare.' },
                  { icon:'📄', title:'Facturi', desc:'Scanare facturi și plată automată.' },
                  { icon:'🥗', title:'Dietă', desc:'Plan nutrițional AI personalizat.' },
                ].map((f, i) => (
                  <div key={i} style={{
                    flex:1, background:'rgba(255,255,255,0.95)', borderRadius:12, padding:'12px 14px',
                    boxShadow:'0 2px 10px rgba(0,0,0,0.06)',
                    transform: v1 ? 'translateY(0)' : 'translateY(20px)', opacity: v1 ? 1 : 0,
                    transition: `all 0.6s cubic-bezier(.22,1,.36,1) ${0.5 + i * 0.1}s`,
                  }}>
                    <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:3 }}>
                      <span style={{ fontSize:14 }}>{f.icon}</span>
                      <span style={{ fontSize:12, fontWeight:700, color:'#1a1a1a' }}>{f.title}</span>
                    </div>
                    <p style={{ fontSize:10, color:'#666', lineHeight:1.4, margin:0 }}>{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div style={{ display:'flex', flexDirection:'column', gap:14, ...anim(v1, 0.25) }}>
              <p style={{ fontSize:13, fontWeight:700, color:'#1a1a1a', textAlign:'center' }}>Sistem Integrat</p>
              <div style={{ background:'rgba(255,255,255,0.8)', borderRadius:20, padding:'24px 20px', border:'1px solid rgba(0,0,0,0.06)', boxShadow:'0 2px 12px rgba(0,0,0,0.04)' }}>
                <p style={{ fontSize:14, fontWeight:700, color:'#1a1a1a', marginBottom:16 }}>Buget Lunar</p>
                <div style={{ display:'flex', alignItems:'center', gap:16, justifyContent:'center' }}>
                  <Donut size={90} data={donutData} />
                  <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                    {donutData.map((c,i) => (
                      <div key={i} style={{ display:'flex', alignItems:'center', gap:7 }}>
                        <div style={{ width:8, height:8, borderRadius:'50%', background:c.color }} />
                        <span style={{ fontSize:11, color:'#666' }}>{c.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ background:'rgba(255,255,255,0.8)', borderRadius:16, padding:'18px 20px', border:'1px solid rgba(0,0,0,0.06)', display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:4, height:40, borderRadius:4, background:'#16a34a' }} />
                <div><p style={{ fontSize:10, color:'#888', margin:0 }}>Economie recomandată:</p><p style={{ fontSize:20, fontWeight:800, color:'#1a1a1a', margin:0 }}>150 RON</p></div>
              </div>
              <div style={{ background:'rgba(255,255,255,0.8)', borderRadius:16, padding:'18px 20px', border:'1px solid rgba(0,0,0,0.06)', display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:4, height:40, borderRadius:4, background:'#dc2626' }} />
                <div><p style={{ fontSize:10, color:'#888', margin:0 }}>Alertă scadență:</p><p style={{ fontSize:16, fontWeight:700, color:'#1a1a1a', margin:0 }}>Factură Gaz</p></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== FINANȚE ========== */}
      <section ref={ref2} style={{ padding:'80px 24px', background:'linear-gradient(180deg,#f0f4f5 0%,#e4ecee 100%)' }}>
        <div style={{ maxWidth:1120, margin:'0 auto' }}>
          <p style={{ ...anim(v2), textAlign:'center', fontSize:12, fontWeight:700, letterSpacing:'0.18em', textTransform:'uppercase', color:'#555', marginBottom:12 }}>Finanțe & Buget</p>
          <h2 style={{ ...anim(v2,0.1), textAlign:'center', fontSize:36, fontWeight:800, color:'#1a1a1a', marginBottom:56, letterSpacing:'-0.02em' }}>Control total asupra cheltuielilor</h2>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 360px', gap:24, alignItems:'start', ...anim(v2,0.2) }}>
            <div style={{ background:'rgba(255,255,255,0.85)', borderRadius:24, padding:'36px 36px 28px', border:'1px solid rgba(0,0,0,0.06)', boxShadow:'0 4px 24px rgba(0,0,0,0.04)' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
                <p style={{ fontSize:17, fontWeight:700, color:'#1a1a1a', margin:0 }}>Facturi scanate și plăți</p>
                <div style={{ padding:'7px 16px', borderRadius:10, fontSize:12, fontWeight:500, color:'#666', background:'#f5f5f5', border:'1px solid #e5e5e5' }}>Facturi de plătit ↓</div>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:14 }}>
                <span style={{ fontSize:11, color:'#aaa', fontWeight:600 }}>Furnizor</span>
                <span style={{ fontSize:11, color:'#aaa', fontWeight:600 }}>Scadență</span>
              </div>
              {[
                { name:'Electricitate', pct:75, color:'#2563eb' },
                { name:'Gaz', pct:55, color:'#f59e0b' },
                { name:'Internet', pct:35, color:'#16a34a' },
              ].map((b,i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:16, marginBottom:18 }}>
                  <span style={{ fontSize:14, fontWeight:600, color:'#1a1a1a', width:110 }}>{b.name}</span>
                  <div style={{ flex:1, height:10, borderRadius:5, background:'#f0f0f0', overflow:'hidden' }}>
                    <div style={{ width: v2 ? `${b.pct}%` : '0%', height:'100%', borderRadius:5, background:b.color, transition:'width 1.2s cubic-bezier(.22,1,.36,1) 0.4s' }} />
                  </div>
                  <div style={{ padding:'6px 16px', borderRadius:10, fontSize:11, fontWeight:600, color:'#666', background:'#f5f5f5', border:'1px solid #e5e5e5' }}>Plătește ↓</div>
                </div>
              ))}
              <div style={{ display:'flex', justifyContent:'space-between', marginTop:18, paddingTop:18, borderTop:'1px solid #eee' }}>
                <span style={{ fontSize:12, color:'#aaa' }}>🔄 Următoarea scadență</span>
                <span style={{ fontSize:12, color:'#aaa' }}>23.09.2024</span>
              </div>
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <div style={{ background:'rgba(255,255,255,0.85)', borderRadius:20, padding:'24px 20px', border:'1px solid rgba(0,0,0,0.06)' }}>
                <p style={{ fontSize:15, fontWeight:700, color:'#1a1a1a', marginBottom:4 }}>Buget Lunar</p>
                <p style={{ fontSize:11, color:'#888', marginBottom:16 }}>Distribuție buget în categorii</p>
                <div style={{ display:'flex', alignItems:'center', gap:16 }}>
                  <Donut size={80} data={donutData} />
                  <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
                    {donutData.map((c,i) => (
                      <div key={i} style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <div style={{ width:8, height:8, borderRadius:'50%', background:c.color }} />
                        <span style={{ fontSize:11, color:'#666', flex:1 }}>{c.label}</span>
                        <span style={{ fontSize:11, fontWeight:600, color:'#1a1a1a' }}>{c.amount}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ background:'rgba(77,208,200,0.08)', borderRadius:16, padding:'18px 20px', border:'1px solid rgba(77,208,200,0.15)' }}>
                <p style={{ fontSize:13, fontWeight:700, color:'#1a1a1a', marginBottom:6 }}>Analiză avansată</p>
                <p style={{ fontSize:12, color:'#666', lineHeight:1.6, margin:0 }}>AI recomandă contract ENGIE pentru gaz — economie estimată 15% pe factura lunară.</p>
              </div>
              <div style={{ display:'flex', gap:12 }}>
                <div style={{ flex:1, background:'rgba(255,255,255,0.85)', borderRadius:14, padding:'14px 16px', border:'1px solid rgba(0,0,0,0.06)', display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ width:4, height:36, borderRadius:3, background:'#16a34a' }} />
                  <div><p style={{ fontSize:10, color:'#888', margin:0 }}>Economie:</p><p style={{ fontSize:16, fontWeight:800, color:'#1a1a1a', margin:0 }}>150 RON</p></div>
                </div>
                <div style={{ flex:1, background:'rgba(255,255,255,0.85)', borderRadius:14, padding:'14px 16px', border:'1px solid rgba(0,0,0,0.06)', display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ width:4, height:36, borderRadius:3, background:'#dc2626' }} />
                  <div><p style={{ fontSize:10, color:'#888', margin:0 }}>Alertă:</p><p style={{ fontSize:14, fontWeight:700, color:'#1a1a1a', margin:0 }}>Factura Gaz</p></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== AI FEATURES ========== */}
      <section ref={ref3} style={{ padding:'80px 24px 100px', background:'linear-gradient(180deg,#e4ecee 0%,#d4e3e0 100%)' }}>
        <div style={{ maxWidth:1120, margin:'0 auto' }}>
          <p style={{ ...anim(v3), textAlign:'center', fontSize:12, fontWeight:700, letterSpacing:'0.18em', textTransform:'uppercase', color:'#4dd0c8', marginBottom:12 }}>Funcționalități AI</p>
          <h2 style={{ ...anim(v3,0.1), textAlign:'center', fontSize:36, fontWeight:800, color:'#1a1a1a', marginBottom:56, letterSpacing:'-0.02em' }}>Inteligență artificială la tine acasă</h2>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:20 }}>
            {[
              { icon:'🤖', title:'AI Assistant', desc:'Întreabă orice: rețete, buget, scadențe. Asistentul tău răspunde instant, știind tot despre casa ta.' },
              { icon:'📊', title:'Plan Dietă', desc:'Plan nutrițional personalizat generat de AI, bazat pe obiectivele tale și alimentele din cămară.' },
              { icon:'🔎', title:'Furnizor Mai Bun', desc:'Scanează o factură și AI caută automat furnizori mai ieftini. Economisești fără efort.' },
            ].map((f,i) => (
              <div key={i} style={{
                ...anim(v3, 0.15 + i*0.1),
                background:'rgba(255,255,255,0.75)', backdropFilter:'blur(20px)', borderRadius:24,
                padding:'40px 28px', border:'1px solid rgba(0,0,0,0.06)', textAlign:'center',
                boxShadow:'0 4px 24px rgba(0,0,0,0.04)', cursor:'default', transition:'all 0.4s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform='translateY(-6px)'; e.currentTarget.style.boxShadow='0 12px 40px rgba(0,0,0,0.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 4px 24px rgba(0,0,0,0.04)'; }}>
                <span style={{ fontSize:40, display:'block', marginBottom:16 }}>{f.icon}</span>
                <p style={{ fontSize:18, fontWeight:700, color:'#1a1a1a', marginBottom:10 }}>{f.title}</p>
                <p style={{ fontSize:14, color:'#666', lineHeight:1.7, margin:0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== CTA ========== */}
      <section style={{
        padding:'80px 24px', textAlign:'center',
        background:'linear-gradient(160deg, #1a2e35 0%, #0e1a1f 100%)',
      }}>
        <h2 style={{ fontSize:36, fontWeight:800, color:'white', marginBottom:14, letterSpacing:'-0.02em' }}>
          Gata să începi?
        </h2>
        <p style={{ fontSize:16, color:'rgba(255,255,255,0.5)', marginBottom:36, maxWidth:400, margin:'0 auto 36px' }}>
          Creează-ți contul gratuit și ia controlul casei tale.
        </p>
        <button onClick={() => navigate('/login')} style={{
          padding:'16px 44px', borderRadius:50, fontSize:16, fontWeight:700,
          background:'#4dd0c8', color:'#0e1a1f', border:'none', cursor:'pointer',
          fontFamily:'inherit', boxShadow:'0 4px 20px rgba(77,208,200,0.3)',
          transition:'all 0.25s',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform='scale(1.04)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform='scale(1)'; }}>
          Începe acum <ChevronRight size={18} style={{ display:'inline', verticalAlign:'middle', marginLeft:4 }} />
        </button>
      </section>

      <footer style={{ textAlign:'center', padding:'28px 24px', background:'#0e1a1f', borderTop:'1px solid rgba(255,255,255,0.06)' }}>
        <p style={{ fontSize:12, color:'rgba(255,255,255,0.3)' }}>HOME MANAGEMENT · Powered by Claude AI · 2026</p>
      </footer>

      <style>{`
        @keyframes landBounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(8px)} }
        @keyframes heroFadeUp { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
        @keyframes heroPulseGlow { 0%,100%{text-shadow:0 0 24px rgba(77,208,200,0.35)} 50%{text-shadow:0 0 40px rgba(77,208,200,0.55),0 0 80px rgba(77,208,200,0.15)} }
        @keyframes heroFloat1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-20px,15px)} }
        @keyframes heroFloat2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(15px,-20px)} }
        @keyframes heroFloat3 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-10px,-15px)} }
      `}</style>
    </div>
  );
}