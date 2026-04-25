import { useState } from 'react';
import { Lock, User, Eye, EyeOff, ArrowRight, Sparkles, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulare login
    setTimeout(() => {
      setLoading(false);
      navigate('/dashboard');
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-16" id="login-page">
      {/* Holographic rings background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-neon-cyan/10 animate-holo-spin" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-neon-cyan/15" style={{ animation: 'holoSpin 15s linear infinite reverse' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] rounded-full border border-neon-green/10 animate-holo-spin" />
        {/* Ripple effect at center */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100px] h-[100px] rounded-full border border-neon-cyan/20 animate-ripple" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100px] h-[100px] rounded-full border border-neon-cyan/15 animate-ripple" style={{ animationDelay: '0.5s' }} />
      </div>

      <div className="w-full max-w-md relative z-10 page-enter">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-neon-cyan/20 to-neon-blue/10 border border-neon-cyan/30 flex items-center justify-center mb-4 animate-float shadow-[0_0_40px_rgba(0,217,255,0.15)]">
            <Lock size={32} className="text-neon-cyan" />
          </div>
          <h1 className="text-2xl font-hud font-bold text-white tracking-wider mb-1">CONECTARE LA ACASĂ</h1>
          <p className="text-sm text-dark-300">Autentifică-te pentru a accesa panoul de control</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="hud-panel p-8 hud-corners animate-holo-pulse">
          <div className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-xs font-hud text-neon-cyan/60 tracking-wider mb-2 uppercase">Utilizator</label>
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400" />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Nume Utilizator sau Email"
                  className="input-hud pl-11"
                  id="login-email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-hud text-neon-cyan/60 tracking-wider mb-2 uppercase">Parolă</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Parolă"
                  className="input-hud pl-11 pr-11"
                  id="login-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-400 hover:text-neon-cyan transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center gap-2 py-3.5 text-sm font-hud tracking-wider"
              id="login-submit"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-dark-900/30 border-t-dark-900 rounded-full animate-spin" />
              ) : (
                <>
                  ACCESEAZĂ <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>

          {/* Links */}
          <div className="mt-6 flex flex-col items-center gap-2">
            <button type="button" className="text-xs text-neon-cyan/60 hover:text-neon-cyan transition-colors">
              Am uitat parola?
            </button>
            <button type="button" className="text-xs text-neon-cyan/60 hover:text-neon-cyan transition-colors">
              Creează un cont nou
            </button>
          </div>

          {/* Security badge */}
          <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-dark-400">
            <Shield size={12} />
            <span>Conexiune securizată • AES-256</span>
          </div>
        </form>
      </div>
    </div>
  );
}
