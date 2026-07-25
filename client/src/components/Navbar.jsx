import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getToken, getUser, clearAuth } from '../services/api';

const links = [
  { to: '/scanner', code: '01', label: 'URL' },
  { to: '/qr-scanner', code: '02', label: 'QR' },
  { to: '/screenshot-analyzer', code: '03', label: 'IMG' },
  { to: '/email-scanner', code: '04', label: 'EML' },
  { to: '/history', code: '05', label: 'LOG' },
  { to: '/analytics', code: '06', label: 'DATA' }
];

const Clock = () => {
  const [t, setT] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setT(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="t-mono" style={{ fontSize: 10, letterSpacing: '0.1em' }}>
      {t.toISOString().slice(11, 19)}<span className="blink">_</span>
   </span>
  );
};

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const user = getUser();
  const isAuth = !!getToken();

  // Close the mobile menu whenever the route changes
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  // Lock body scroll while the mobile drawer is open
  useEffect(() => {
    if (menuOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [menuOpen]);

  return (
    <header style={{
      borderBottom: '1px solid var(--ink)',
      background: 'var(--bone)',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      <div className="nav-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr auto',
        alignItems: 'center',
        padding: '0 24px',
        height: 56
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
          <div style={{
            width: 28, height: 28,
            background: 'var(--ink)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--bone)',
            fontFamily: 'var(--type-display)', fontWeight: 700, fontSize: 14,
            flexShrink: 0
          }}>P</div>
          <div style={{ lineHeight: 1.1, minWidth: 0 }}>
            <div className="h-display-2" style={{ fontSize: 16 }}>PHISHGUARD</div>
            <div className="t-mono nav-version" style={{ fontSize: 9, color: 'var(--ink-60)', letterSpacing: '0.15em' }}>CONSOLE / v2.4</div>
         </div>
       </Link>

        <nav
          className={`nav-links${menuOpen ? ' open' : ''}`}
          style={{
            ...(menuOpen ? { display: 'flex' } : {}),
            justifyContent: 'center',
            gap: 0,
            height: '100%'
          }}
        >
          {links.map(l => {
            const active = location.pathname === l.to;
            return (
              <Link key={l.to} to={l.to} style={{
                display: 'flex',
                alignItems: 'center',
                height: '100%',
                padding: '0 18px',
                borderLeft: '1px solid var(--ink-08)',
                borderRight: '1px solid var(--ink-08)',
                background: active ? 'var(--ink)' : 'transparent',
                color: active ? 'var(--bone)' : 'var(--ink)',
                transition: 'background 120ms'
              }}>
                <span className="t-mono" style={{ fontSize: 10, color: active ? 'var(--bone-60)' : 'var(--ink-60)', marginRight: 8 }}>
                  {l.code}
               </span>
                <span style={{ fontFamily: 'var(--type-display)', fontWeight: 600, fontSize: 12, letterSpacing: '0.1em' }}>
                  {l.label}
               </span>
             </Link>
            );
          })}

          {/* Mobile-only auth row inside the drawer */}
          <div className="nav-mobile-auth" style={{
            borderTop: '1px solid var(--ink)',
            padding: 16,
            display: 'flex',
            gap: 8,
            background: 'var(--bone)'
          }}>
            {isAuth ? (
              <>
                <span className="t-mono" style={{ flex: 1, fontSize: 12, color: 'var(--ink-60)', alignSelf: 'center' }}>
                  {user?.name || 'OPERATOR'}
               </span>
                <button
                  onClick={() => { clearAuth(); navigate('/'); }}
                  className="btn-ghost"
                  style={{ padding: '10px 14px', fontSize: 11, flex: 1 }}
                >
                  Sign out
               </button>
              </>
            ) : (
              <>
                <Link to="/login" style={{ flex: 1 }}>
                  <button className="btn-ghost" style={{ padding: '10px 14px', fontSize: 11, width: '100%' }}>
                    Sign in
                  </button>
                </Link>
                <Link to="/register" style={{ flex: 1 }}>
                  <button className="btn-primary" style={{ padding: '10px 14px', fontSize: 11, width: '100%' }}>
                    Get access
                 </button>
               </Link>
              </>
            )}
         </div>
       </nav>

        <div className="nav-user-area" style={{ alignItems: 'center', gap: 16 }}>
          <Clock />
          {isAuth ? (
            <>
              <span className="t-mono" style={{ fontSize: 11, color: 'var(--ink-60)' }}>
                {user?.name || 'OPERATOR'}
             </span>
              <button
                onClick={() => { clearAuth(); navigate('/'); }}
                className="btn-ghost"
                style={{ padding: '6px 12px', fontSize: 10 }}
              >
                Sign out
             </button>
            </>
          ) : (
            <>
              <Link to="/login">
                <button className="btn-ghost" style={{ padding: '6px 12px', fontSize: 10 }}>Sign in</button>
             </Link>
              <Link to="/register">
                <button className="btn-primary" style={{ padding: '6px 12px', fontSize: 10 }}>Get access</button>
             </Link>
            </>
          )}
       </div>

        <button
          className="nav-hamburger"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(v => !v)}
        >
          <span style={{
            transform: menuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none',
            transition: 'transform 180ms var(--ease)'
          }} />
          <span style={{
            opacity: menuOpen ? 0 : 1,
            transition: 'opacity 120ms var(--ease)'
          }} />
          <span style={{
            transform: menuOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none',
            transition: 'transform 180ms var(--ease)'
          }} />
       </button>
     </div>

      {/* Backdrop only on mobile when menu is open */}
      {menuOpen && (
        <div
          className="nav-backdrop"
          onClick={() => setMenuOpen(false)}
          style={{
            position: 'fixed',
            top: 56,
            left: 0, right: 0, bottom: 0,
            background: 'rgba(11, 15, 20, 0.4)',
            zIndex: 55
          }}
        />
      )}
   </header>
  );
};

export default Navbar;
