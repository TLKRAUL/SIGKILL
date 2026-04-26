import { useState } from 'react';
import { Eye, EyeOff, ArrowRight, ArrowLeft, Mail, Lock, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { loginUser, registerUser } from '../api/apiClient';

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (isRegister && password !== confirmPassword) {
      setError('Parolele nu se potrivesc');
      return;
    }
    setLoading(true);
    try {
      if (isRegister) {
        await registerUser(name, email, password);
      } else {
        await loginUser(email, password);
      }
      navigate('/home');
    } catch (err) {
      setError(err?.response?.data?.error || 'Ceva nu a mers. Încearcă din nou.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '14px 16px 14px 44px', borderRadius: 14, fontSize: 14,
    fontFamily: 'inherit', background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(0,0,0,0.08)',
    outline: 'none', color: '#1a1a1a', transition: 'border-color 0.2s, box-shadow 0.2s',
  };

  const iconStyle = {
    position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#aaa',
  };

  return (
    <div style={{
      minHeight: '100vh', fontFamily: "'Inter',-apple-system,sans-serif",
      background: 'linear-gradient(160deg, #c8e0dd 0%, #d6e5ea 25%, #e8eff2 50%, #d4e3e0 80%, #bdd8d4 100%)',
      display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden',
    }} id="login-page">

      {/* Floating orbs */}
      <div style={{ position:'absolute', width:450, height:450, borderRadius:'50%', background:'radial-gradient(circle,rgba(77,208,200,0.12) 0%,transparent 70%)', top:'-10%', right:'-8%', animation:'loginFloat1 8s ease-in-out infinite' }} />
      <div style={{ position:'absolute', width:350, height:350, borderRadius:'50%', background:'radial-gradient(circle,rgba(139,92,246,0.08) 0%,transparent 70%)', bottom:'5%', left:'-6%', animation:'loginFloat2 10s ease-in-out infinite' }} />

      {/* Header */}
      <header style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 32px',
        position: 'relative', zIndex: 2, animation: 'loginFadeDown 0.6s cubic-bezier(.22,1,.36,1) both',
      }}>
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
      </header>

      {/* Form */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '0 24px 48px', position: 'relative', zIndex: 2,
      }}>
        <div className="dashboard-charts-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 420px 1fr', gap: 40, maxWidth: 1100, width: '100%', alignItems: 'center' }}>

          {/* Left side — feature cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'flex-end' }}>
            {[
              { icon: '📱', title: 'Scanner AI', desc: 'Scanează bonuri și produse instant', delay: 0.3 },
              { icon: '🗄️', title: 'Inventar Smart', desc: 'Știi exact ce ai și când expiră', delay: 0.45 },
              { icon: '👨‍🍳', title: 'Rețete AI', desc: 'Sugestii din ce ai în cămară', delay: 0.6 },
            ].map((f, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(20px)',
                borderRadius: 18, padding: '16px 20px', maxWidth: 240, width: '100%',
                border: '1px solid rgba(255,255,255,0.6)', boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                animation: `loginFadeRight 0.7s cubic-bezier(.22,1,.36,1) ${f.delay}s both`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <span style={{ fontSize: 18 }}>{f.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a' }}>{f.title}</span>
                </div>
                <p style={{ fontSize: 11, color: '#888', margin: 0, lineHeight: 1.4 }}>{f.desc}</p>
              </div>
            ))}
          </div>

          {/* Center — form */}
          <div>

          {/* Heading */}
          <div style={{ textAlign: 'center', marginBottom: 32, animation: 'loginFadeUp 0.7s cubic-bezier(.22,1,.36,1) 0.1s both' }}>
            <div style={{
              width: 64, height: 64, borderRadius: 20, margin: '0 auto 16px',
              background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 32px rgba(77,208,200,0.15)',
            }}>
              <span style={{ fontSize: 28, fontWeight: 800, color: '#4dd0c8', fontFamily: "'Georgia',serif" }}>H</span>
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1a1a1a', marginBottom: 6, letterSpacing: '-0.02em' }}>
              {isRegister ? 'Creează un cont' : 'Bine ai revenit'}
            </h1>
            <p style={{ fontSize: 14, color: '#888' }}>
              {isRegister
                ? 'Începe să-ți gestionezi casa mai ușor'
                : 'Hai să vedem ce ai prin cămară'}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              marginBottom: 16, padding: '12px 16px', borderRadius: 14,
              background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.15)',
              color: '#dc2626', fontSize: 13, fontWeight: 500, textAlign: 'center',
            }}>{error}</div>
          )}

          {/* Card */}
          <form onSubmit={handleSubmit} style={{
            background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(40px) saturate(140%)',
            borderRadius: 28, padding: '32px 28px', border: '1px solid rgba(255,255,255,0.6)',
            boxShadow: '0 16px 64px rgba(0,0,0,0.06)',
            animation: 'loginFadeUp 0.7s cubic-bezier(.22,1,.36,1) 0.2s both',
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Name */}
              {isRegister && (
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#888', marginBottom: 6 }}>Cum te cheamă?</label>
                  <div style={{ position: 'relative' }}>
                    <User size={15} style={iconStyle} />
                    <input type="text" value={name} onChange={e => setName(e.target.value)}
                      placeholder="Numele tău" style={inputStyle} required id="register-name"
                      onFocus={e => { e.target.style.borderColor = 'rgba(77,208,200,0.4)'; e.target.style.boxShadow = '0 0 0 3px rgba(77,208,200,0.1)'; }}
                      onBlur={e => { e.target.style.borderColor = 'rgba(0,0,0,0.08)'; e.target.style.boxShadow = 'none'; }} />
                  </div>
                </div>
              )}

              {/* Email */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#888', marginBottom: 6 }}>Email</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={15} style={iconStyle} />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="tu@email.com" style={inputStyle} required id="login-email"
                    onFocus={e => { e.target.style.borderColor = 'rgba(77,208,200,0.4)'; e.target.style.boxShadow = '0 0 0 3px rgba(77,208,200,0.1)'; }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(0,0,0,0.08)'; e.target.style.boxShadow = 'none'; }} />
                </div>
              </div>

              {/* Password */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#888', marginBottom: 6 }}>Parolă</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} style={iconStyle} />
                  <input type={showPassword ? 'text' : 'password'} value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder={isRegister ? 'Minim 6 caractere' : 'Parola ta'}
                    style={{ ...inputStyle, paddingRight: 44 }} required minLength={6} id="login-password"
                    onFocus={e => { e.target.style.borderColor = 'rgba(77,208,200,0.4)'; e.target.style.boxShadow = '0 0 0 3px rgba(77,208,200,0.1)'; }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(0,0,0,0.08)'; e.target.style.boxShadow = 'none'; }} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#aaa' }}>
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Confirm */}
              {isRegister && (
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#888', marginBottom: 6 }}>Confirmă parola</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={15} style={iconStyle} />
                    <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Introdu parola din nou" style={inputStyle} required minLength={6} id="register-confirm"
                      onFocus={e => { e.target.style.borderColor = 'rgba(77,208,200,0.4)'; e.target.style.boxShadow = '0 0 0 3px rgba(77,208,200,0.1)'; }}
                      onBlur={e => { e.target.style.borderColor = 'rgba(0,0,0,0.08)'; e.target.style.boxShadow = 'none'; }} />
                  </div>
                </div>
              )}

              {/* Submit */}
              <button type="submit" disabled={loading} id="login-submit" style={{
                width: '100%', padding: '15px 0', borderRadius: 50, fontSize: 15, fontWeight: 700,
                background: '#1a1a1a', color: 'white', border: 'none', cursor: 'pointer',
                fontFamily: 'inherit', marginTop: 4, transition: 'all 0.25s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(0,0,0,0.2)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)'; }}>
                {loading ? (
                  <div style={{ width: 20, height: 20, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'loginSpin 0.6s linear infinite' }} />
                ) : (
                  <>{isRegister ? 'Creează cont' : 'Intră în cont'} <ArrowRight size={16} /></>
                )}
              </button>
            </div>

            {/* Toggle */}
            <div style={{ textAlign: 'center', marginTop: 20 }}>
              <button type="button" onClick={() => { setIsRegister(!isRegister); setError(''); }}
                style={{
                  background: 'none', border: 'none', fontSize: 13, color: '#999',
                  cursor: 'pointer', fontFamily: 'inherit', transition: 'color 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = '#4dd0c8'; }}
                onMouseLeave={e => { e.currentTarget.style.color = '#999'; }}>
                {isRegister ? 'Ai deja cont? Conectează-te' : 'Nu ai cont? Creează unul nou'}
              </button>
            </div>
          </form>

          {/* Footer */}
          <p style={{ textAlign: 'center', fontSize: 11, color: '#aaa', marginTop: 20, animation: 'loginFadeUp 0.7s cubic-bezier(.22,1,.36,1) 0.35s both' }}>
            🔒 Datele tale sunt protejate și stocate securizat
          </p>
        </div>

          {/* Right side — stats cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'flex-start' }}>
            {/* Buget card */}
            <div style={{
              background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(20px)',
              borderRadius: 18, padding: '18px 20px', maxWidth: 240, width: '100%',
              border: '1px solid rgba(255,255,255,0.6)', boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
              animation: 'loginFadeLeft 0.7s cubic-bezier(.22,1,.36,1) 0.3s both',
            }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a', marginBottom: 10 }}>Buget Lunar</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <svg width="50" height="50" viewBox="0 0 50 50">
                  <circle cx="25" cy="25" r="18" fill="none" stroke="#e5e7eb" strokeWidth="7" />
                  <circle cx="25" cy="25" r="18" fill="none" stroke="#4dd0c8" strokeWidth="7"
                    strokeDasharray="45 113" strokeLinecap="round" transform="rotate(-90 25 25)" />
                  <circle cx="25" cy="25" r="18" fill="none" stroke="#8b5cf6" strokeWidth="7"
                    strokeDasharray="28 113" strokeDashoffset="-45" strokeLinecap="round" transform="rotate(-90 25 25)" />
                </svg>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4dd0c8' }} />
                    <span style={{ fontSize: 10, color: '#888' }}>Cămară</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#8b5cf6' }} />
                    <span style={{ fontSize: 10, color: '#888' }}>Utilități</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Economie */}
            <div style={{
              background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(20px)',
              borderRadius: 18, padding: '14px 20px', maxWidth: 240, width: '100%',
              border: '1px solid rgba(255,255,255,0.6)', boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
              display: 'flex', alignItems: 'center', gap: 12,
              animation: 'loginFadeLeft 0.7s cubic-bezier(.22,1,.36,1) 0.45s both',
            }}>
              <div style={{ width: 4, height: 32, borderRadius: 3, background: '#16a34a' }} />
              <div>
                <p style={{ fontSize: 10, color: '#888', margin: 0 }}>Economie:</p>
                <p style={{ fontSize: 16, fontWeight: 800, color: '#1a1a1a', margin: 0 }}>150 RON</p>
              </div>
            </div>

            {/* Alertă */}
            <div style={{
              background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(20px)',
              borderRadius: 18, padding: '14px 20px', maxWidth: 240, width: '100%',
              border: '1px solid rgba(255,255,255,0.6)', boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
              display: 'flex', alignItems: 'center', gap: 12,
              animation: 'loginFadeLeft 0.7s cubic-bezier(.22,1,.36,1) 0.6s both',
            }}>
              <div style={{ width: 4, height: 32, borderRadius: 3, background: '#dc2626' }} />
              <div>
                <p style={{ fontSize: 10, color: '#888', margin: 0 }}>Alertă:</p>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a', margin: 0 }}>Factura Gaz</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      <style>{`
        @keyframes loginFadeUp { from { opacity:0; transform:translateY(24px) } to { opacity:1; transform:translateY(0) } }
        @keyframes loginFadeDown { from { opacity:0; transform:translateY(-16px) } to { opacity:1; transform:translateY(0) } }
        @keyframes loginFadeRight { from { opacity:0; transform:translateX(-30px) } to { opacity:1; transform:translateX(0) } }
        @keyframes loginFadeLeft { from { opacity:0; transform:translateX(30px) } to { opacity:1; transform:translateX(0) } }
        @keyframes loginSpin { to { transform:rotate(360deg) } }
        @keyframes loginFloat1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-15px,12px)} }
        @keyframes loginFloat2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(12px,-15px)} }
      `}</style>
    </div>
  );
}
