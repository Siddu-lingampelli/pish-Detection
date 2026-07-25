import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../services/api';

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.email || !form.password) { setError('All fields required'); return; }
    if (form.password.length < 8) { setError('Password must be 8+ characters'); return; }
    if (form.password !== form.confirm) { setError('Passwords do not match'); return; }
    setLoading(true);
    try {
      await register({ name: form.name, email: form.email, password: form.password });
      navigate('/scanner');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-split" style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr', background: 'var(--bone)' }}>
      <div style={{ background: 'var(--ink)', color: 'var(--bone)', padding: 48, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 32, height: 32, background: 'var(--signal)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--type-display)', fontWeight: 700, color: 'var(--bone)' }}>P</div>
          <div>
            <div className="h-display-2" style={{ fontSize: 18 }}>PHISHGUARD</div>
            <div className="t-mono" style={{ fontSize: 9, color: 'var(--bone-60)', letterSpacing: '0.15em' }}>CONSOLE</div>
          </div>
        </Link>

        <div>
          <div className="t-eyebrow" style={{ color: 'var(--bone-60)', marginBottom: 24 }}>§01 — ENLIST</div>
          <h1 className="h-display" style={{ fontSize: 'clamp(44px, 7vw, 72px)', margin: 0, lineHeight: 0.95 }}>
            New<br />operator<span style={{ color: 'var(--signal)' }}>.</span>
          </h1>
          <p style={{ marginTop: 24, color: 'var(--bone-60)', maxWidth: 360, lineHeight: 1.5 }}>
            Create an account to access the console, persistent history, and analytics dashboard.
          </p>
        </div>

        <div className="t-mono" style={{ fontSize: 10, color: 'var(--bone-60)', letterSpacing: '0.1em' }}>
          PG//02 — BUILD 2024.11
        </div>
      </div>

      <div style={{ padding: 48, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <form onSubmit={submit} className="auth-form-mobile-full" style={{ width: '100%', maxWidth: 380 }}>
          <div className="t-eyebrow" style={{ marginBottom: 32 }}>§CREDENTIALS</div>

          <label className="t-eyebrow" style={{ display: 'block', marginTop: 20 }}>Operator name</label>
          <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Alex Hunter" className="field" />

          <label className="t-eyebrow" style={{ display: 'block', marginTop: 20 }}>Email</label>
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@company.com" className="field" />

          <label className="t-eyebrow" style={{ display: 'block', marginTop: 20 }}>Password</label>
          <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Minimum 8 characters" className="field" maxLength={128} />

          <label className="t-eyebrow" style={{ display: 'block', marginTop: 20 }}>Confirm password</label>
          <input type="password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} placeholder="Repeat password" className="field" maxLength={128} />

          {error && (
            <div className="t-mono" style={{ marginTop: 16, fontSize: 12, color: 'var(--signal)' }}>! {error}</div>
          )}

          <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', marginTop: 32 }}>
            {loading ? 'CREATING OPERATOR...' : 'CREATE ACCOUNT →'}
          </button>

          <div style={{ marginTop: 24, textAlign: 'center', fontSize: 13, color: 'var(--ink-60)' }}>
            Already enlisted? <Link to="/login" style={{ borderBottom: '1px solid var(--ink)' }}>Sign in</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
