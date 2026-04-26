import { useState } from 'react';
import { Scale, Ruler, Calendar, Target, Wallet, Loader2, ShoppingCart, Clock, Flame, Beef, Wheat, Droplet, ChevronDown, ChevronUp, Sparkles, AlertTriangle } from 'lucide-react';
import { getMealPlan } from '../api/apiClient';

const goals = [
  { id: 'lose', label: 'Slăbire', emoji: '🔥', desc: 'Deficit caloric' },
  { id: 'maintain', label: 'Menținere', emoji: '⚖️', desc: 'Echilibru' },
  { id: 'gain', label: 'Masă musculară', emoji: '💪', desc: 'Surplus caloric' },
];

const budgets = [
  { id: 'low', label: 'Econom', emoji: '💚', desc: '< 150 RON/săpt.' },
  { id: 'medium', label: 'Mediu', emoji: '💛', desc: '150-300 RON/săpt.' },
  { id: 'high', label: 'Premium', emoji: '🧡', desc: '300+ RON/săpt.' },
];

const mealEmoji = { 'Mic dejun': '🌅', 'Prânz': '🍽️', 'Gustare': '🍎', 'Cină': '🌙' };

export default function DietPlanPage() {
  const [form, setForm] = useState({ weight: '', height: '', age: '', gender: 'm', goal: 'lose', budget: 'medium', allergies: '' });
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedDay, setExpandedDay] = useState(0);

  const handleGenerate = async () => {
    if (!form.weight || !form.height || !form.age) {
      setError('Completează greutatea, înălțimea și vârsta.');
      return;
    }
    setError('');
    setLoading(true);
    setPlan(null);
    try {
      const result = await getMealPlan(form);
      setPlan(result);
    } catch (err) {
      setError(err?.response?.data?.error || 'Eroare la generarea planului. Încearcă din nou.');
    }
    setLoading(false);
  };

  const bmiColor = (bmi) => {
    if (bmi < 18.5) return 'text-blue-500';
    if (bmi < 25) return 'text-green-500';
    if (bmi < 30) return 'text-yellow-500';
    return 'text-red-500';
  };

  const glass = { background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(30px) saturate(140%)', border: '1px solid rgba(255,255,255,0.6)', borderRadius: 24, boxShadow: '0 4px 24px rgba(0,0,0,0.04)' };

  return (
    <div style={{ fontFamily: "'Inter',-apple-system,sans-serif", position: 'relative', overflow: 'hidden' }} id="diet-plan-page">
      {/* Orbs */}
      <div style={{ position:'absolute', width:450, height:450, borderRadius:'50%', background:'radial-gradient(circle,rgba(77,208,200,0.1) 0%,transparent 70%)', top:'-8%', right:'-5%', animation:'dietFloat1 10s ease-in-out infinite', pointerEvents:'none' }} />
      <div style={{ position:'absolute', width:350, height:350, borderRadius:'50%', background:'radial-gradient(circle,rgba(37,99,235,0.06) 0%,transparent 70%)', bottom:'5%', left:'-5%', animation:'dietFloat2 12s ease-in-out infinite', pointerEvents:'none' }} />

      <div style={{ position: 'relative', zIndex: 2 }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 32, animation: 'dietFadeUp 0.7s cubic-bezier(.22,1,.36,1) both' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 50, background: 'rgba(77,208,200,0.1)', color: '#0d9488', fontSize: 11, fontWeight: 600, marginBottom: 12 }}>
          <Sparkles size={12} /> Plan Alimentar AI
        </div>
        <h1 style={{ fontSize: 42, fontWeight: 800, color: '#1a1a1a', lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: 8 }}>
          Planul tău <span className="gradient-text">personalizat</span>
        </h1>
        <p style={{ fontSize: 14, color: '#777', maxWidth: 480, margin: '0 auto' }}>
          Introdu datele tale și AI-ul generează un plan alimentar complet pe 7 zile cu listă de cumpărături.
        </p>
      </div>

      {!plan ? (
        /* ===== FORM ===== */
        <div style={{ maxWidth: 520, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Metrics */}
          <div style={{ ...glass, padding: '24px', animation: 'dietFadeUp 0.7s cubic-bezier(.22,1,.36,1) 0.1s both' }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: '#1a1a1a', marginBottom: 16 }}>📏 Date fizice</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 12 }}>
              {[{ label: 'Greutate (kg)', icon: <Scale size={13} />, key: 'weight', ph: '75' },
                { label: 'Înălțime (cm)', icon: <Ruler size={13} />, key: 'height', ph: '175' },
                { label: 'Vârstă', icon: <Calendar size={13} />, key: 'age', ph: '25' }].map(f => (
                <div key={f.key}>
                  <label style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#999', display: 'block', marginBottom: 4 }}>{f.label}</label>
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#999' }}>{f.icon}</div>
                    <input type="number" placeholder={f.ph} value={form[f.key]}
                      onChange={e => setForm(ff => ({ ...ff, [f.key]: e.target.value }))}
                      className="input text-sm" style={{ paddingLeft: 36 }} />
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {['m', 'f'].map(g => (
                <button key={g} onClick={() => setForm(f => ({ ...f, gender: g }))}
                  style={{
                    flex: 1, padding: '10px 0', borderRadius: 50, border: 'none', cursor: 'pointer',
                    fontFamily: 'inherit', fontSize: 13, fontWeight: 600, transition: 'all 0.2s',
                    background: form.gender === g ? 'rgba(77,208,200,0.12)' : 'rgba(0,0,0,0.02)',
                    color: form.gender === g ? '#0d9488' : '#888',
                  }}>
                  {g === 'm' ? '👨 Masculin' : '👩 Feminin'}
                </button>
              ))}
            </div>
          </div>

          {/* Goal */}
          <div style={{ ...glass, padding: '24px', animation: 'dietFadeUp 0.7s cubic-bezier(.22,1,.36,1) 0.15s both' }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: '#1a1a1a', marginBottom: 12 }}>🎯 Obiectiv</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              {goals.map(g => (
                <button key={g.id} onClick={() => setForm(f => ({ ...f, goal: g.id }))}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '14px 8px',
                    borderRadius: 16, border: 'none', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
                    background: form.goal === g.id ? 'rgba(77,208,200,0.12)' : 'rgba(0,0,0,0.02)',
                    color: form.goal === g.id ? '#0d9488' : '#888',
                  }}>
                  <span style={{ fontSize: 22 }}>{g.emoji}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: form.goal === g.id ? '#0d9488' : '#1a1a1a' }}>{g.label}</span>
                  <span style={{ fontSize: 10, color: '#999' }}>{g.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Budget */}
          <div style={{ ...glass, padding: '24px', animation: 'dietFadeUp 0.7s cubic-bezier(.22,1,.36,1) 0.2s both' }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: '#1a1a1a', marginBottom: 12 }}>💰 Buget săptămânal</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              {budgets.map(b => (
                <button key={b.id} onClick={() => setForm(f => ({ ...f, budget: b.id }))}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '14px 8px',
                    borderRadius: 16, border: 'none', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
                    background: form.budget === b.id ? 'rgba(77,208,200,0.12)' : 'rgba(0,0,0,0.02)',
                    color: form.budget === b.id ? '#0d9488' : '#888',
                  }}>
                  <span style={{ fontSize: 22 }}>{b.emoji}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: form.budget === b.id ? '#0d9488' : '#1a1a1a' }}>{b.label}</span>
                  <span style={{ fontSize: 10, color: '#999' }}>{b.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Allergies */}
          <div style={{ ...glass, padding: '24px', animation: 'dietFadeUp 0.7s cubic-bezier(.22,1,.36,1) 0.25s both' }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: '#1a1a1a', marginBottom: 12 }}>⚠️ Alergii / Restricții</h3>
            <input type="text" placeholder="Ex: lactoză, gluten, nuci (opțional)" value={form.allergies}
              onChange={e => setForm(f => ({ ...f, allergies: e.target.value }))}
              className="input text-sm" />
          </div>

          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#dc2626', background: 'rgba(220,38,38,0.06)', padding: '10px 16px', borderRadius: 14 }}>
              <AlertTriangle size={14} /> {error}
            </div>
          )}

          <button onClick={handleGenerate} disabled={loading}
            style={{
              width: '100%', padding: '16px 0', borderRadius: 50, border: 'none', fontSize: 14, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer',
              fontFamily: 'inherit', transition: 'all 0.2s',
              background: loading ? 'rgba(0,0,0,0.04)' : '#1a1a1a',
              color: loading ? '#999' : 'white',
              boxShadow: loading ? 'none' : '0 4px 20px rgba(0,0,0,0.15)',
              animation: 'dietFadeUp 0.7s cubic-bezier(.22,1,.36,1) 0.3s both',
            }}>
            {loading ? (
              <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> AI generează planul... (20-30s)</>
            ) : (
              <><Sparkles size={16} /> Generează Plan Alimentar</>
            )}
          </button>
        </div>
      ) : (
        /* ===== RESULTS ===== */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Stats Header */}
          <div className="dashboard-actions-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, animation: 'dietFadeUp 0.7s cubic-bezier(.22,1,.36,1) both' }}>
            {[
              { val: plan.bmi?.toFixed(1), label: `BMI · ${plan.bmiCategory}`, color: plan.bmi < 25 ? '#16a34a' : plan.bmi < 30 ? '#f59e0b' : '#dc2626', icon: null },
              { val: plan.dailyCalories, label: 'kcal / zi', color: '#0d9488', icon: <Flame size={16} /> },
              { val: `${plan.macros?.protein}g`, label: 'Proteine', color: '#dc2626', icon: <Beef size={14} /> },
              { val: `${plan.macros?.carbs}g`, label: 'Carbohidrați', color: '#f59e0b', icon: <Wheat size={14} /> },
              { val: `${plan.macros?.fat}g`, label: 'Grăsimi', color: '#2563eb', icon: <Droplet size={14} /> },
            ].map((s, i) => (
              <div key={i} style={{ ...glass, padding: '16px 12px', textAlign: 'center' }}>
                <p style={{ fontSize: 24, fontWeight: 800, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>{s.icon}{s.val}</p>
                <p style={{ fontSize: 10, color: '#999', marginTop: 4 }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* AI Tip */}
          {plan.tip && (
            <div style={{ ...glass, padding: '16px 20px', background: 'rgba(77,208,200,0.08)', border: '1px solid rgba(77,208,200,0.15)', animation: 'dietFadeUp 0.7s cubic-bezier(.22,1,.36,1) 0.1s both' }}>
              <p style={{ fontSize: 13, color: '#555' }}>💡 <strong style={{ color: '#1a1a1a' }}>Sfat AI:</strong> {plan.tip}</p>
            </div>
          )}

          <div className="dashboard-charts-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
            {/* Days */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: '#1a1a1a', marginBottom: 4 }}>📅 Plan pe 7 zile</h3>
              {plan.days?.map((day, di) => (
                <div key={di} style={{ ...glass, padding: 0, overflow: 'hidden' }}>
                  <button onClick={() => setExpandedDay(expandedDay === di ? -1 : di)}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '12px 16px', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                    }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 18 }}>📋</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a' }}>{day.day}</span>
                      <span style={{ fontSize: 10, color: '#999' }}>{day.meals?.reduce((s, m) => s + (m.calories || 0), 0)} kcal</span>
                    </div>
                    {expandedDay === di ? <ChevronUp size={14} style={{ color: '#999' }} /> : <ChevronDown size={14} style={{ color: '#999' }} />}
                  </button>
                  {expandedDay === di && (
                    <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 8, borderTop: '1px solid rgba(0,0,0,0.04)' }}>
                      {day.meals?.map((meal, mi) => (
                        <div key={mi} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px', borderRadius: 14, background: 'rgba(0,0,0,0.02)' }}>
                          <span style={{ fontSize: 18, marginTop: 2 }}>{mealEmoji[meal.type] || '🍽️'}</span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <p style={{ fontSize: 12, fontWeight: 700, color: '#1a1a1a' }}>{meal.name}</p>
                              <span style={{ fontSize: 10, color: '#0d9488', fontWeight: 600 }}>{meal.calories} kcal</span>
                            </div>
                            <p style={{ fontSize: 10, color: '#999', marginTop: 2 }}>{meal.description}</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                              <span style={{ fontSize: 10, color: '#999', display: 'flex', alignItems: 'center', gap: 3 }}><Clock size={9} />{meal.prepTime} min</span>
                              <span style={{ fontSize: 9, padding: '2px 8px', borderRadius: 50, background: 'rgba(0,0,0,0.03)', color: '#999' }}>{meal.type}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Shopping List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ ...glass, padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <ShoppingCart size={14} style={{ color: '#0d9488' }} />
                  <h3 style={{ fontSize: 14, fontWeight: 800, color: '#1a1a1a' }}>Listă cumpărături</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 400, overflowY: 'auto' }}>
                  {plan.shoppingList?.map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: 10, background: 'rgba(0,0,0,0.02)', fontSize: 12 }}>
                      <span style={{ color: '#555' }}>{item.item}</span>
                      <span style={{ fontWeight: 600, color: '#1a1a1a' }}>{item.price} RON</span>
                    </div>
                  ))}
                </div>
                <div style={{ height: 1, background: 'rgba(0,0,0,0.06)', margin: '12px 0' }} />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#1a1a1a' }}>Total săptămânal</span>
                  <span style={{ fontSize: 14, fontWeight: 800, color: '#0d9488' }}>{plan.weeklyBudget} RON</span>
                </div>
                {plan.estimatedSavings && (
                  <p style={{ fontSize: 10, color: '#16a34a', marginTop: 8 }}>💚 {plan.estimatedSavings}</p>
                )}
              </div>

              <button onClick={() => setPlan(null)}
                style={{
                  width: '100%', padding: '12px 0', borderRadius: 50, border: '1px solid rgba(0,0,0,0.08)',
                  background: 'rgba(255,255,255,0.55)', fontSize: 13, fontWeight: 600, color: '#555',
                  cursor: 'pointer', fontFamily: 'inherit', backdropFilter: 'blur(12px)', transition: 'all 0.2s',
                }}>
                ← Generează alt plan
              </button>
            </div>
          </div>
        </div>
      )}
      </div>

      <style>{`
        @keyframes dietFadeUp { from { opacity:0; transform:translateY(24px) } to { opacity:1; transform:translateY(0) } }
        @keyframes dietFloat1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-12px,10px)} }
        @keyframes dietFloat2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(10px,-12px)} }
      `}</style>
    </div>
  );
}


