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
  const user = getUser();
  const isAuth = !!getToken();

  return (
    <header style={{
      borderBottom: '1px solid var(--ink)',
      background: 'var(--bone)',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr auto',
        alignItems: 'center',
        padding: '0 24px',
        height: 56
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 28, height: 28,
            background: 'var(--ink)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--bone)',
            fontFamily: 'var(--type-display)', fontWeight: 700, fontSize: 14
          }}>P</div>
          <div style={{ lineHeight: 1.1 }}>
            <div className="h-display-2" style={{ fontSize: 16 }}>PHISHGUARD</div>
            <div className="t-mono" style={{ fontSize: 9, color: 'var(--ink-60)', letterSpacing: '0.15em' }}>CONSOLE / v2.4</div>
          </div>
        </Link>

        <nav style={{ display: 'flex', justifyContent: 'center', gap: 0, height: '100%' }}>
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
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Clock />
          {isAuth ? (
            <>
              <span className="t-mono" style={{ fontSize: 11, color: 'var(--ink-60)' }}>{user?.name || 'OPERATOR'}</span>
              <button onClick={() => { clearAuth(); navigate('/'); }} className="btn-ghost" style={{ padding: '6px 12px', fontSize: 10 }}>
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login"><button className="btn-ghost" style={{ padding: '6px 12px', fontSize: 10 }}>Sign in</button></Link>
              <Link to="/register"><button className="btn-primary" style={{ padding: '6px 12px', fontSize: 10 }}>Get access</button></Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
