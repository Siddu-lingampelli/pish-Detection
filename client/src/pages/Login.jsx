import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../services/api';

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) { setError('Email and password required'); return; }
    setLoading(true);
    try {
      await login(form);
      navigate('/scanner');
    } catch (err) {
      setError(err.response?.data?.error || 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr', background: 'var(--bone)' }}>
      {/* LEFT: brand panel */}
      <div style={{ background: 'var(--ink)', color: 'var(--bone)', padding: 48, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 32, height: 32, background: 'var(--signal)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--type-display)', fontWeight: 700, color: 'var(--bone)' }}>P</div>
          <div>
            <div className="h-display-2" style={{ fontSize: 18 }}>PHISHGUARD</div>
            <div className="t-mono" style={{ fontSize: 9, color: 'var(--bone-60)', letterSpacing: '0.15em' }}>CONSOLE</div>
          </div>
        </Link>

        <div>
          <div className="t-eyebrow" style={{ color: 'var(--bone-60)', marginBottom: 24 }}>§01 — SIGN IN</div>
          <h1 className="h-display" style={{ fontSize: 72, margin: 0, lineHeight: 0.95 }}>
            Welcome<br />back<span style={{ color: 'var(--signal)' }}>.</span>
          </h1>
          <p style={{ marginTop: 24, color: 'var(--bone-60)', maxWidth: 360, lineHeight: 1.5 }}>
            Sign in to access the console, history, and analytics. URL scanning works without an account.
          </p>
        </div>

        <div className="t-mono" style={{ fontSize: 10, color: 'var(--bone-60)', letterSpacing: '0.1em' }}>
          PG//02 — BUILD 2024.11
        </div>
      </div>

      {/* RIGHT: form */}
      <div style={{ padding: 48, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <form onSubmit={submit} style={{ width: '100%', maxWidth: 380 }}>
          <div className="t-eyebrow" style={{ marginBottom: 32 }}>§CREDENTIALS</div>

          <label className="t-eyebrow" style={{ display: 'block', marginTop: 24 }}>Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="you@company.com"
            className="field"
            autoComplete="email"
          />

          <label className="t-eyebrow" style={{ display: 'block', marginTop: 24 }}>Password</label>
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="••••••••"
            className="field"
            maxLength={128}
            autoComplete="current-password"
          />

          {error && (
            <div className="t-mono" style={{ marginTop: 16, fontSize: 12, color: 'var(--signal)' }}>! {error}</div>
          )}

          <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', marginTop: 32 }}>
            {loading ? 'AUTHENTICATING...' : 'SIGN IN →'}
          </button>

          <div style={{ marginTop: 24, textAlign: 'center', fontSize: 13, color: 'var(--ink-60)' }}>
            No account? <Link to="/register" style={{ borderBottom: '1px solid var(--ink)' }}>Request access</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
