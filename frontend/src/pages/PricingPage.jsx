import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Check, X, ArrowRight, ArrowLeft, Building2, Send, Loader2,
  Shield, Zap, Users, ChevronDown
} from 'lucide-react';
import { getPlans, selectPlan, requestEnterprise, isLoggedIn } from '../api/apiClient';

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

const planStyles = {
  smart_saver: { accent: '#4dd0c8', accentBg: 'rgba(77,208,200,0.1)', border: 'rgba(77,208,200,0.25)', img: '/plan-starter.png' },
  family_cfo: { accent: '#7c3aed', accentBg: 'rgba(124,58,237,0.08)', border: 'rgba(124,58,237,0.3)', img: '/plan-family.png' },
  enterprise: { accent: '#d97706', accentBg: 'rgba(217,119,6,0.08)', border: 'rgba(217,119,6,0.25)', img: '/plan-enterprise.png' },
};

const faqs = [
  { q: 'Ce se întâmplă după prima lună gratuită?', a: 'După trial, alegi un pachet. Dacă nu alegi, contul rămâne activ cu funcționalități limitate.' },
  { q: 'Pot schimba pachetul oricând?', a: 'Da! Upgrade sau downgrade oricând, fără penalizări. Diferența se calculează pro-rata.' },
  { q: 'Ce include proba gratuită?', a: 'Trial-ul de o lună oferă acces complet la Smart Saver: scanare AI, alerte expirare, bugetare.' },
  { q: 'Cum funcționează Enterprise?', a: 'Completezi formularul, iar echipa te contactează în 24h cu ofertă personalizată.' },
  { q: 'Datele mele sunt în siguranță?', a: 'Criptare end-to-end, servere în UE, GDPR integral. Datele nu sunt vândute niciodată.' },
];

export default function PricingPage() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(null);
  const [showEnterprise, setShowEnterprise] = useState(false);
  const [enterpriseForm, setEnterpriseForm] = useState({ company: '', seats: '', email: '', phone: '', message: '' });
  const [enterpriseSending, setEnterpriseSending] = useState(false);
  const [enterpriseSent, setEnterpriseSent] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [openFaq, setOpenFaq] = useState(null);
  const logged = isLoggedIn();
  const [plansRef, plansVisible] = useInView(0.05);
  const [faqRef, faqVisible] = useInView(0.1);

  useEffect(() => {
    getPlans()
      .then(setPlans)
      .catch(() => {
        setPlans([
          { id: 'smart_saver', name: 'Smart Saver', subtitle: 'Essential / Starter', emoji: '🎓', price: 14.99, currency: 'RON', period: 'lună', target: 'Studenți, tineri profesioniști', description: 'Organizare de bază și reducerea risipei alimentare.', popular: false, features: [{ text: 'Scanare până la 20 bonuri/lună', included: true },{ text: 'Recunoaștere AI frigider & cămară', included: true },{ text: 'Alerte de expirare pe telefon', included: true },{ text: 'Bucătar AI — rețete din ce ai acasă', included: true },{ text: 'Bugetare simplă', included: true },{ text: 'Statistici predictive', included: false },{ text: 'Planificator mese', included: false },{ text: 'Sincronizare multi-user', included: false }] },
          { id: 'family_cfo', name: 'Family CFO', subtitle: 'Premium · Cel mai popular', emoji: '👨‍👩‍👧‍👦', price: 49.99, currency: 'RON', period: 'lună', target: 'Familii, cupluri ocupate', description: 'Automatizare completă și planificare avansată.', popular: true, features: [{ text: 'Scanare AI nelimitată', included: true },{ text: 'Alerte inteligente', included: true },{ text: 'Bucătar AI — meniu săptămânal', included: true },{ text: 'Statistici predictive', included: true },{ text: 'Planificator mese + listă cumpărături', included: true },{ text: 'Sincronizare multi-user', included: true },{ text: 'Digitalizarea garanțiilor', included: true },{ text: 'Open Banking', included: false }] },
          { id: 'enterprise', name: 'Enterprise', subtitle: 'Open Wealth · B2B', emoji: '🏢', price: null, currency: 'RON', period: null, target: 'Companii, instituții', description: 'Automatizare totală, Open Banking.', popular: false, features: [{ text: 'Tot ce include Family CFO', included: true },{ text: 'Open Banking', included: true },{ text: 'Facturare automată', included: true },{ text: 'Modul Corporate 500+ licențe', included: true },{ text: 'AI proactiv negociere', included: true },{ text: 'Export contabil', included: true },{ text: 'Suport dedicat', included: true }] },
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSelectPlan = async (planId) => {
    if (!logged) { navigate('/login'); return; }
    setActivating(planId);
    try {
      const result = await selectPlan(planId);
      setSuccessMsg(result.message);
      setTimeout(() => navigate('/home'), 2000);
    } catch (err) {
      setSuccessMsg(err?.response?.data?.error || 'Eroare la activare');
    }
    setActivating(null);
  };

  const handleEnterprise = async (e) => {
    e.preventDefault();
    setEnterpriseSending(true);
    try { await requestEnterprise(enterpriseForm); setEnterpriseSent(true); } catch {}
    setEnterpriseSending(false);
  };

  const S = { // shared styles
    page: {
      minHeight: '100vh', fontFamily: "'Inter',-apple-system,sans-serif",
      background: 'linear-gradient(160deg, #c8e0dd 0%, #d6e5ea 25%, #e8eff2 50%, #d4e3e0 80%, #bdd8d4 100%)',
    },
    glass: {
      background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(30px) saturate(140%)',
      border: '1px solid rgba(255,255,255,0.6)', borderRadius: 24,
      boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
    },
    input: {
      width: '100%', padding: '12px 16px', borderRadius: 14, fontSize: 14, fontFamily: 'inherit',
      background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(0,0,0,0.08)', outline: 'none',
      color: '#1a1a1a', transition: 'border-color 0.2s',
    },
  };

  return (
    <div style={S.page} id="pricing-page">

      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 32px', animation: 'priceFadeDown 0.6s cubic-bezier(.22,1,.36,1) both' }}>
        <button onClick={() => navigate('/')} style={{
          display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none',
          cursor: 'pointer', fontFamily: 'inherit',
        }}>
          <ArrowLeft size={18} style={{ color: '#888' }} />
          <div style={{
            width: 36, height: 36, borderRadius: 11, background: 'rgba(255,255,255,0.5)',
            backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: 18, fontWeight: 800, color: '#4dd0c8', fontFamily: "'Georgia',serif" }}>H</span>
          </div>
          <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#666' }}>
            Home Management
          </span>
        </button>
        <button onClick={() => logged ? navigate('/home') : navigate('/login')} style={{
          padding: '10px 24px', borderRadius: 50, fontSize: 13, fontWeight: 600,
          background: '#1a1a1a', color: 'white', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
        }}>
          {logged ? 'Acasă' : 'Intră în cont'}
        </button>
      </header>

      {/* Hero */}
      <div style={{ textAlign: 'center', padding: '48px 24px 36px', maxWidth: 700, margin: '0 auto' }}>
        <h1 style={{ fontSize: 52, fontWeight: 800, color: '#1a1a1a', lineHeight: 1.08, marginBottom: 20, letterSpacing: '-0.03em', animation: 'priceFadeUp 0.7s cubic-bezier(.22,1,.36,1) 0.1s both' }}>
          Alege pachetul care<br />
          <span style={{ color: '#4dd0c8' }}>ți se potrivește</span>
        </h1>
        <div style={{
          display: 'inline-block', padding: '12px 28px', borderRadius: 50,
          background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.7)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          animation: 'priceFadeUp 0.7s cubic-bezier(.22,1,.36,1) 0.25s both',
        }}>
          <span style={{ fontSize: 16, fontWeight: 600, color: '#333' }}>
            Începe cu <span style={{ color: '#4dd0c8', fontWeight: 700 }}>o lună gratuită</span>. Fără card bancar.
          </span>
        </div>
      </div>

      {/* Success */}
      {successMsg && (
        <div style={{ maxWidth: 480, margin: '0 auto 20px', padding: '0 16px' }}>
          <div style={{ ...S.glass, padding: '16px 20px', textAlign: 'center', fontSize: 14, fontWeight: 500, color: '#16a34a' }}>
            🎉 {successMsg}
          </div>
        </div>
      )}

      {/* Plans */}
      <div ref={plansRef} style={{ maxWidth: 1100, margin: '0 auto', padding: '0 20px 40px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}><Loader2 size={28} style={{ color: '#4dd0c8' }} className="animate-spin" /></div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, alignItems: 'start' }}>
            {plans.map((plan, idx) => {
              const ps = planStyles[plan.id] || planStyles.smart_saver;
              return (
                <div key={plan.id} style={{
                  ...S.glass, padding: '32px 28px 28px', position: 'relative',
                  border: plan.popular ? `2px solid ${ps.border}` : '1px solid rgba(255,255,255,0.6)',
                  marginTop: plan.popular ? -12 : 0,
                  opacity: plansVisible ? 1 : 0,
                  transform: plansVisible ? 'translateY(0)' : 'translateY(30px)',
                  transition: `all 0.6s cubic-bezier(.22,1,.36,1) ${0.1 + idx * 0.15}s`,
                }} id={`plan-${plan.id}`}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.08)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = plansVisible ? 'translateY(0)' : 'translateY(30px)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.04)'; }}>

                  {plan.popular && (
                    <div style={{
                      position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)',
                      padding: '5px 18px', borderRadius: 50, fontSize: 11, fontWeight: 700, color: 'white',
                      background: 'linear-gradient(135deg, #7c3aed, #a855f7)', letterSpacing: '0.04em',
                    }}>Cel mai popular</div>
                  )}

                  <div style={{ textAlign: 'center', marginBottom: 16 }}>
                    <div style={{
                      width: 130, height: 130, margin: '0 auto 12px', borderRadius: 24, overflow: 'hidden',
                      background: ps.accentBg,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <img src={ps.img} alt={plan.name} style={{
                        width: 110, height: 110, objectFit: 'contain',
                      }} />
                    </div>
                    <h3 style={{ fontSize: 20, fontWeight: 700, color: '#1a1a1a', marginBottom: 2 }}>{plan.name}</h3>
                    <p style={{ fontSize: 11, color: '#999' }}>{plan.subtitle}</p>
                  </div>

                  <div style={{
                    textAlign: 'center', marginBottom: 20, padding: '20px 16px', borderRadius: 18,
                    background: ps.accentBg,
                  }}>
                    {plan.price !== null ? (
                      <>
                        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 4 }}>
                          <span style={{ fontSize: 40, fontWeight: 800, color: ps.accent }}>{plan.price}</span>
                          <span style={{ fontSize: 14, fontWeight: 500, color: '#888' }}>RON</span>
                        </div>
                        <p style={{ fontSize: 12, color: '#999', marginTop: 2 }}>pe {plan.period}</p>
                      </>
                    ) : (
                      <>
                        <p style={{ fontSize: 20, fontWeight: 700, color: ps.accent }}>Preț personalizat</p>
                        <p style={{ fontSize: 12, color: '#999', marginTop: 2 }}>în funcție de nr. persoane</p>
                      </>
                    )}
                  </div>

                  <p style={{ fontSize: 12, color: '#666', textAlign: 'center', marginBottom: 16 }}>{plan.description}</p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
                    {plan.features?.map((f, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: f.included ? ps.accentBg : 'rgba(0,0,0,0.04)',
                        }}>
                          {f.included
                            ? <Check size={11} style={{ color: ps.accent }} strokeWidth={3} />
                            : <X size={11} style={{ color: '#ccc' }} />}
                        </div>
                        <span style={{ fontSize: 12, color: f.included ? '#333' : '#bbb', textDecoration: f.included ? 'none' : 'line-through' }}>
                          {f.text}
                        </span>
                      </div>
                    ))}
                  </div>

                  {plan.price !== null ? (
                    <button onClick={() => handleSelectPlan(plan.id)} disabled={activating === plan.id} style={{
                      width: '100%', padding: '14px 0', borderRadius: 50, fontSize: 14, fontWeight: 600,
                      cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      ...(plan.popular
                        ? { background: 'linear-gradient(135deg,#7c3aed,#a855f7)', color: 'white', border: 'none', boxShadow: '0 4px 16px rgba(124,58,237,0.25)' }
                        : { background: 'white', color: ps.accent, border: `1.5px solid ${ps.border}` }),
                    }}>
                      {activating === plan.id ? <Loader2 size={16} className="animate-spin" /> : <>{logged ? 'Activează acum' : 'Începe gratuit o lună'} <ArrowRight size={14} /></>}
                    </button>
                  ) : (
                    <button onClick={() => setShowEnterprise(true)} style={{
                      width: '100%', padding: '14px 0', borderRadius: 50, fontSize: 14, fontWeight: 600,
                      cursor: 'pointer', fontFamily: 'inherit', background: 'white',
                      color: ps.accent, border: `1.5px solid ${ps.border}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    }}>
                      <Building2 size={14} /> Cere ofertă personalizată
                    </button>
                  )}

                  <p style={{ fontSize: 10, color: '#aaa', textAlign: 'center', marginTop: 10 }}>
                    {plan.price !== null ? 'Fără card bancar pentru trial' : `Target: ${plan.target}`}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Trust */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 32, padding: '0 24px 40px', flexWrap: 'wrap' }}>
        {[
          { Icon: Shield, text: 'Date securizate GDPR' },
          { Icon: Zap, text: 'Powered by Claude AI' },
          { Icon: Users, text: '1000+ utilizatori activi' },
        ].map((b, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#999' }}>
            <b.Icon size={14} /> <span>{b.text}</span>
          </div>
        ))}
      </div>

      {/* Enterprise Modal */}
      {showEnterprise && (
        <div onClick={() => !enterpriseSending && setShowEnterprise(false)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 24,
        }}>
          <div onClick={e => e.stopPropagation()} style={{ ...S.glass, padding: '32px 28px', maxWidth: 520, width: '100%', borderRadius: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 24 }}>🏢</span>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1a1a1a' }}>Enterprise</h3>
                  <p style={{ fontSize: 11, color: '#999' }}>Preț personalizat pe nr. persoane</p>
                </div>
              </div>
              <button onClick={() => setShowEnterprise(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999' }}><X size={18} /></button>
            </div>
            {enterpriseSent ? (
              <div style={{ textAlign: 'center', padding: '32px 0' }}>
                <span style={{ fontSize: 48, display: 'block', marginBottom: 12 }}>🎉</span>
                <h4 style={{ fontSize: 18, fontWeight: 700, color: '#1a1a1a', marginBottom: 8 }}>Cerere trimisă!</h4>
                <p style={{ fontSize: 14, color: '#666' }}>Te contactăm în maxim 24 de ore.</p>
              </div>
            ) : (
              <form onSubmit={handleEnterprise} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <input value={enterpriseForm.company} onChange={e => setEnterpriseForm(p => ({...p, company: e.target.value}))}
                  placeholder="Companie / Organizație *" style={S.input} required />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <input type="number" min="1" value={enterpriseForm.seats} onChange={e => setEnterpriseForm(p => ({...p, seats: e.target.value}))}
                    placeholder="Nr. persoane *" style={S.input} required />
                  <input value={enterpriseForm.phone} onChange={e => setEnterpriseForm(p => ({...p, phone: e.target.value}))}
                    placeholder="Telefon" style={S.input} />
                </div>
                <input type="email" value={enterpriseForm.email} onChange={e => setEnterpriseForm(p => ({...p, email: e.target.value}))}
                  placeholder="Email de contact *" style={S.input} required />
                <textarea value={enterpriseForm.message} onChange={e => setEnterpriseForm(p => ({...p, message: e.target.value}))}
                  placeholder="Mesaj (opțional)" style={{ ...S.input, height: 80, resize: 'none' }} />
                <button type="submit" disabled={enterpriseSending} style={{
                  padding: '14px 0', borderRadius: 50, fontSize: 14, fontWeight: 600, width: '100%',
                  background: '#1a1a1a', color: 'white', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}>
                  {enterpriseSending ? <Loader2 size={16} className="animate-spin" /> : <><Send size={14} /> Trimite cererea</>}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* FAQ */}
      <div ref={faqRef} style={{ maxWidth: 640, margin: '0 auto', padding: '0 24px 60px' }}>
        <h2 style={{
          fontSize: 24, fontWeight: 700, color: '#1a1a1a', textAlign: 'center', marginBottom: 24,
          opacity: faqVisible ? 1 : 0, transform: faqVisible ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.6s cubic-bezier(.22,1,.36,1)',
        }}>Întrebări frecvente</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {faqs.map((faq, i) => (
            <div key={i} style={{
              ...S.glass, overflow: 'hidden', padding: 0,
              opacity: faqVisible ? 1 : 0, transform: faqVisible ? 'translateY(0)' : 'translateY(20px)',
              transition: `all 0.5s cubic-bezier(.22,1,.36,1) ${0.1 + i * 0.08}s`,
            }}>
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{
                width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '16px 20px', background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: 'inherit', textAlign: 'left',
              }}>
                <span style={{ fontSize: 14, fontWeight: 500, color: '#1a1a1a', paddingRight: 16 }}>{faq.q}</span>
                <div style={{
                  flexShrink: 0, transition: 'transform 0.3s ease',
                  transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0deg)',
                }}>
                  <ChevronDown size={16} style={{ color: '#999' }} />
                </div>
              </button>
              <div style={{
                maxHeight: openFaq === i ? 200 : 0,
                opacity: openFaq === i ? 1 : 0,
                overflow: 'hidden',
                transition: 'max-height 0.4s cubic-bezier(.22,1,.36,1), opacity 0.3s ease',
              }}>
                <div style={{ padding: '0 20px 16px', fontSize: 13, color: '#666', lineHeight: 1.6 }}>{faq.a}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer style={{ textAlign: 'center', padding: '24px', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
        <p style={{ fontSize: 12, color: '#999' }}>HOME MANAGEMENT · Powered by Claude AI · 2026</p>
      </footer>

      <style>{`
        @keyframes priceFadeUp { from { opacity:0; transform:translateY(24px) } to { opacity:1; transform:translateY(0) } }
        @keyframes priceFadeDown { from { opacity:0; transform:translateY(-16px) } to { opacity:1; transform:translateY(0) } }
      `}</style>
    </div>
  );
}
