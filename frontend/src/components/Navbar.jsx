import { NavLink } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  Home, LayoutDashboard, ScanLine, Bot,
  Wallet, FileText, ChefHat, LogIn, Menu, X
} from 'lucide-react';

const navItems = [
  { to: '/', icon: Home, label: 'Acasă' },
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/kitchen', icon: ChefHat, label: 'Bucătărie AI' },
  { to: '/scan', icon: ScanLine, label: 'Scanează' },
  { to: '/assistant', icon: Bot, label: 'AI Asistent' },
  { to: '/budget', icon: Wallet, label: 'Buget' },
  { to: '/bills', icon: FileText, label: 'Facturi' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-[rgba(10,15,30,0.85)] backdrop-blur-xl border-b border-[rgba(0,217,255,0.1)] shadow-[0_4px_30px_rgba(0,0,0,0.3)]'
          : 'bg-transparent'
      }`}
      id="main-navbar"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-neon-cyan/20 to-neon-blue/10 flex items-center justify-center border border-neon-cyan/20 group-hover:border-neon-cyan/50 transition-all group-hover:shadow-[0_0_20px_rgba(0,217,255,0.2)]">
              <Home size={18} className="text-neon-cyan" />
            </div>
            <div>
              <h1 className="text-sm font-hud font-bold text-white tracking-wider">SIGKILL</h1>
              <p className="text-[8px] font-hud text-neon-cyan/60 tracking-[0.2em]">AI HOME</p>
            </div>
          </NavLink>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-300 ${
                      isActive
                        ? 'text-neon-cyan bg-neon-cyan/10 border border-neon-cyan/20 shadow-[0_0_15px_rgba(0,217,255,0.1)]'
                        : 'text-dark-200 hover:text-white hover:bg-white/5'
                    }`
                  }
                >
                  <Icon size={14} />
                  {item.label}
                </NavLink>
              );
            })}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neon-green/5 border border-neon-green/20">
              <div className="status-dot" />
              <span className="text-[10px] font-medium text-neon-green">AI Online</span>
            </div>
            
            <NavLink
              to="/login"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-dark-200 hover:text-neon-cyan hover:bg-neon-cyan/5 border border-transparent hover:border-neon-cyan/20 transition-all"
            >
              <LogIn size={14} />
              <span className="hidden sm:inline">Logare</span>
            </NavLink>

            {/* Mobile toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-dark-200"
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden glass-strong border-t border-[rgba(0,217,255,0.1)] animate-slide-down">
          <div className="px-4 py-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
                      isActive
                        ? 'text-neon-cyan bg-neon-cyan/10 border border-neon-cyan/20'
                        : 'text-dark-200 hover:text-white hover:bg-white/5'
                    }`
                  }
                >
                  <Icon size={18} />
                  {item.label}
                </NavLink>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}