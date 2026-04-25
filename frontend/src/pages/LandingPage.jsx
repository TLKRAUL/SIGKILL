import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  ChefHat, ScanLine, Bot, Wallet, FileText, LayoutDashboard,
  ArrowRight, Sparkles, Zap, Shield, Home, Brain
} from 'lucide-react';
import { testConnection } from '../api/apiClient';

const features = [
  { icon: LayoutDashboard, title: 'Dashboard Acasă', desc: 'Vizualizare completă a casei tale', to: '/dashboard', color: '#00d9ff' },
  { icon: ChefHat, title: 'Bucătărie AI', desc: 'Inventar, rețete, diete inteligente', to: '/kitchen', color: '#00f5a0' },
  { icon: ScanLine, title: 'Scanner Bonuri', desc: 'Scanare OCR cu Gemini Vision', to: '/scan', color: '#ffd166' },
  { icon: Bot, title: 'AI Asistent', desc: 'Chat inteligent powered by Gemini', to: '/assistant', color: '#a29bfe' },
  { icon: Wallet, title: 'Gestionare Bani', desc: 'Buget, cheltuieli, economii', to: '/budget', color: '#ff6b35' },
  { icon: FileText, title: 'Gestionare Facturi', desc: 'Facturi, scadențe, plăți', to: '/bills', color: '#f72585' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    testConnection().then(r => setConnected(!!r));
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 pt-24" id="landing-page">
      {/* Holographic decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full border border-neon-cyan/5 animate-holo-spin" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-neon-cyan/8" style={{ animation: 'holoSpin 25s linear infinite reverse' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full border border-neon-green/5 animate-holo-spin" />
        {/* Particles */}
        {[...Array(6)].map((_, i) => (
          <div key={i} className="particle" style={{ left: `${15 + i * 15}%`, top: `${20 + (i % 3) * 25}%`, animationDelay: `${i * 1.3}s` }} />
        ))}
      </div>

      <div className="relative z-10 max-w-5xl mx-auto text-center page-enter">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-cyan text-xs font-hud text-neon-cyan tracking-wider mb-6 animate-scale-in">
          <Zap size={12} />
          AI HOME MANAGER
          {connected && <div className="status-dot ml-1" />}
        </div>

        {/* Title */}
        <h1 className="text-5xl md:text-7xl font-hud font-bold text-white tracking-wider mb-4 animate-slide-up">
          <span className="gradient-text">SIGKILL</span>
        </h1>
        <p className="text-lg md:text-xl text-dark-200 mb-2 animate-slide-up stagger-1 font-display">
          Managementul Inteligent al Casei Tale
        </p>
        <p className="text-sm text-dark-400 mb-10 max-w-lg mx-auto animate-slide-up stagger-2">
          Controlează totul din casă: cămara, bugetul, facturile, rețetele — totul powered by Google Gemini AI
        </p>

        {/* CTA */}
        <div className="flex items-center justify-center gap-4 mb-14 animate-slide-up stagger-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-primary flex items-center gap-2 text-sm font-hud tracking-wider"
          >
            <span><Home size={16} /> DASHBOARD ACASĂ</span>
          </button>
          <button
            onClick={() => navigate('/login')}
            className="btn-secondary flex items-center gap-2 text-sm font-hud tracking-wider"
          >
            <Shield size={16} /> LOGARE
          </button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <button
                key={i}
                onClick={() => navigate(feature.to)}
                className="hud-panel p-6 text-left group hover:border-[rgba(0,217,255,0.3)] transition-all animate-scale-in"
                style={{ animationDelay: `${0.3 + i * 0.1}s` }}
                id={`feature-${i}`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center border transition-all group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(0,217,255,0.2)]"
                    style={{
                      backgroundColor: `${feature.color}10`,
                      borderColor: `${feature.color}30`,
                    }}
                  >
                    <Icon size={22} style={{ color: feature.color }} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-hud font-bold text-white tracking-wider mb-1 group-hover:text-neon-cyan transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-xs text-dark-400">{feature.desc}</p>
                  </div>
                  <ArrowRight size={16} className="text-dark-500 group-hover:text-neon-cyan group-hover:translate-x-1 transition-all mt-1" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-12 flex items-center justify-center gap-3 text-[10px] text-dark-500 animate-fade-in stagger-8">
          <Brain size={12} />
          <span className="font-hud tracking-wider">Powered by Google Gemini AI • SIGKILL Team • Hackathon 2026</span>
        </div>
      </div>
    </div>
  );
}