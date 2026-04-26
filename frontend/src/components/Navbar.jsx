import { NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { LogOut, Menu, X } from 'lucide-react';
import { logoutUser, getCurrentUser } from '../api/apiClient';

const navItems = [
  { to: '/budget', label: 'FINANCES' },
  { to: '/kitchen', label: 'REȚETE' },
  { to: '/scan', label: 'SCANNER' },
  { to: '/assistant', label: 'AI CHAT' },
  { to: '/diet', label: 'DIET' },
  { to: '/bills', label: 'BILLS' },
];

export default function TopNav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const user = getCurrentUser();
  const handleLogout = () => { logoutUser(); navigate('/'); };

  return (
    <>
      {/* Desktop floating pill */}
      <nav style={{
        position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)',
        zIndex: 100, height: 52,
        background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(30px) saturate(180%)',
        border: '1px solid rgba(255,255,255,0.7)', borderRadius: 50,
        display: 'flex', alignItems: 'center', padding: '0 8px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
        fontFamily: "'Inter',-apple-system,sans-serif",
      }} className="hidden md:flex" id="main-topnav">

        <NavLink to="/home" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 16px', textDecoration: 'none', flexShrink: 0 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(77,208,200,0.12)', border: '1px solid rgba(77,208,200,0.2)',
          }}>
            <span style={{ fontSize: 14, fontWeight: 800, color: '#4dd0c8', fontFamily: "'Georgia',serif" }}>H</span>
          </div>
          <span style={{ fontSize: 10, fontWeight: 600, color: '#999', letterSpacing: '0.06em', lineHeight: 1.2 }}>HOME<br/>MANAGEMENT</span>
        </NavLink>

        {navItems.map(item => (
          <NavLink key={item.to} to={item.to} style={{ textDecoration: 'none' }}>
            {({ isActive }) => (
              <span style={{
                padding: '6px 14px', borderRadius: 50, fontSize: 11, fontWeight: 600,
                letterSpacing: '0.05em', transition: 'all 0.2s', display: 'block',
                background: isActive ? 'rgba(77,208,200,0.12)' : 'transparent',
                color: isActive ? '#0d9488' : '#888',
              }}
              onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'rgba(0,0,0,0.04)'; e.currentTarget.style.color = '#555'; }}}
              onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#888'; }}}>
                {item.label}
              </span>
            )}
          </NavLink>
        ))}

        {/* Sign Out */}
        <button onClick={handleLogout} style={{
          display: 'flex', alignItems: 'center', gap: 5, padding: '6px 14px', borderRadius: 50,
          fontSize: 11, fontWeight: 600, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
          background: 'rgba(220,38,38,0.06)', color: '#dc2626', transition: 'all 0.2s', marginLeft: 4,
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(220,38,38,0.12)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(220,38,38,0.06)'; }}>
          <LogOut size={12} /> SIGN OUT
        </button>

      </nav>

      {/* Mobile */}
      <div className="md:hidden" style={{ position: 'fixed', top: 12, left: 12, right: 12, zIndex: 100 }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          height: 48, padding: '0 16px', borderRadius: 50,
          background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(30px)',
          border: '1px solid rgba(255,255,255,0.7)', boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
        }}>
          <NavLink to="/home" style={{ display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}>
            <span style={{ fontSize: 14, fontWeight: 800, color: '#4dd0c8', fontFamily: "'Georgia',serif" }}>H</span>
            <span style={{ fontSize: 9, fontWeight: 600, color: '#999', lineHeight: 1.2 }}>HOME<br/>MGMT</span>
          </NavLink>
          <button onClick={() => setMobileOpen(!mobileOpen)} style={{
            width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'none', border: 'none', cursor: 'pointer', color: '#888',
          }}>
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <>
          <div className="sidebar-overlay md:hidden" onClick={() => setMobileOpen(false)} />
          <div className="md:hidden" style={{
            position: 'fixed', top: 70, left: 16, right: 16, zIndex: 95,
            background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(40px)',
            border: '1px solid rgba(255,255,255,0.7)', borderRadius: 20,
            boxShadow: '0 12px 40px rgba(0,0,0,0.1)', padding: 16,
          }}>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {navItems.map(item => (
                <NavLink key={item.to} to={item.to} onClick={() => setMobileOpen(false)} style={{ textDecoration: 'none' }}>
                  {({ isActive }) => (
                    <span style={{
                      display: 'block', padding: '12px 16px', borderRadius: 12, fontSize: 13, fontWeight: 600,
                      letterSpacing: '0.05em', transition: 'all 0.2s',
                      background: isActive ? 'rgba(77,208,200,0.1)' : 'transparent',
                      color: isActive ? '#0d9488' : '#888',
                    }}>{item.label}</span>
                  )}
                </NavLink>
              ))}
              <hr style={{ border: 'none', borderTop: '1px solid rgba(0,0,0,0.06)', margin: '4px 0' }} />
              <button onClick={handleLogout} style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', borderRadius: 12,
                fontSize: 13, fontWeight: 500, color: '#dc2626', background: 'none', border: 'none',
                cursor: 'pointer', fontFamily: 'inherit', width: '100%',
              }}>
                <LogOut size={14} /> Deconectare
              </button>
            </nav>
          </div>
        </>
      )}
    </>
  );
}