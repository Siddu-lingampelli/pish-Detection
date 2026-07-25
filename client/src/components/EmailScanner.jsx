import { useState } from 'react';
import { analyzeEmail } from '../services/api';

const EmailScanner = () => {
  const [email, setEmail] = useState({ content: '', sender: '', subject: '' });
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const analyze = async () => {
    if (!email.content.trim()) { setError('Paste email content'); return; }
    setError(null);
    setAnalyzing(true);
    setResult(null);
    try {
      const data = await analyzeEmail({
        emailContent: email.content,
        senderEmail: email.sender,
        subject: email.subject
      });
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  const reset = () => { setEmail({ content: '', sender: '', subject: '' }); setResult(null); };

  return (
    <div style={{ background: 'var(--bone)', minHeight: 'calc(100vh - 56px)' }}>
      <div style={{ borderBottom: '1px solid var(--ink-08)', padding: '10px clamp(16px, 3vw, 24px)', display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }} className="t-mono">
        <div style={{ fontSize: 10, letterSpacing: '0.15em', color: 'var(--ink-60)' }}>§CONSOLE / EMAIL TRIAGE</div>
        <div style={{ fontSize: 10, letterSpacing: '0.1em' }}><span className="blink" style={{ color: 'var(--signal)' }}>●</span> READY</div>
      </div>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: 'clamp(24px, 4vw, 40px) clamp(16px, 3vw, 24px)' }}>
        <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: result ? 'repeat(2, minmax(0, 1fr))' : '1fr', gap: 24 }}>
          <div className="panel" style={{ padding: 'clamp(20px, 3vw, 32px)' }}>
            <div className="t-eyebrow" style={{ marginBottom: 8 }}>§EML — INPUT</div>
            <h2 className="h-display-2" style={{ fontSize: 'clamp(20px, 2.5vw, 24px)', margin: '0 0 24px' }}>Paste the email to triage.</h2>

            <label className="t-eyebrow" style={{ display: 'block', marginTop: 16 }}>Sender (optional)</label>
            <input type="email" value={email.sender} onChange={(e) => setEmail({ ...email, sender: e.target.value })} placeholder="from@example.com" className="field" />

            <label className="t-eyebrow" style={{ display: 'block', marginTop: 20 }}>Subject (optional)</label>
            <input type="text" value={email.subject} onChange={(e) => setEmail({ ...email, subject: e.target.value })} placeholder="Urgent action required" className="field" />

            <label className="t-eyebrow" style={{ display: 'block', marginTop: 20 }}>Email body</label>
            <textarea
              value={email.content}
              onChange={(e) => setEmail({ ...email, content: e.target.value })}
              placeholder="Paste the full email content here..."
              className="field"
              style={{ minHeight: 220, resize: 'vertical', fontFamily: 'var(--type-mono)', fontSize: 13, lineHeight: 1.5 }}
            />

            {error && <div className="t-mono" style={{ marginTop: 12, fontSize: 12, color: 'var(--signal)' }}>! {error}</div>}

            <div className="input-group" style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <button onClick={analyze} disabled={analyzing} className="btn-primary" style={{ flex: 1 }}>
                {analyzing ? 'TRIAGING...' : 'ANALYZE EMAIL →'}
              </button>
              <button onClick={reset} className="btn-ghost">CLEAR</button>
            </div>
          </div>

          {result && <EmailResult result={result} />}
        </div>
      </div>
    </div>
  );
};

const EmailResult = ({ result }) => {
  const tone = result.riskLevel === 'HIGH' ? 'signal' : result.riskLevel === 'MEDIUM' ? 'ink' : 'bone';
  return (
    <div>
      <div className={`verdict verdict-${tone}`} style={{ padding: 24 }}>
        <div className="t-eyebrow" style={{ color: tone === 'bone' ? 'var(--ink-60)' : 'var(--bone-60)' }}>§EMAIL — VERDICT</div>
        <h2 className="h-display" style={{ fontSize: 'clamp(32px, 5vw, 48px)', margin: '12px 0 0' }}>{result.riskLevel}</h2>
        <div style={{ fontFamily: 'var(--type-display)', fontWeight: 700, fontSize: 'clamp(40px, 6vw, 56px)', lineHeight: 1, marginTop: 12 }}>
          {result.riskScore}<span style={{ fontSize: 16, opacity: 0.6, fontWeight: 500 }}>/100</span>
        </div>
      </div>

      {result.threats?.length > 0 && (
        <div className="panel" style={{ padding: 24, marginTop: 16 }}>
          <div className="t-eyebrow" style={{ marginBottom: 12 }}>§THREATS — {result.threats.length}</div>
          {result.threats.map((t, i) => (
            <div key={i} className="t-mono" style={{ fontSize: 12, padding: '8px 0', borderTop: i === 0 ? 0 : '1px solid var(--ink-08)' }}>
              <span style={{ color: 'var(--signal)', marginRight: 12 }}>!</span>{t}
            </div>
          ))}
        </div>
      )}

      {result.suspiciousKeywords?.length > 0 && (
        <div className="panel" style={{ padding: 24, marginTop: 16 }}>
          <div className="t-eyebrow" style={{ marginBottom: 12 }}>§KEYWORDS</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {result.suspiciousKeywords.map((k, i) => <span key={i} className="chip chip-mute">{k}</span>)}
          </div>
        </div>
      )}

      {result.linksFound?.length > 0 && (
        <div className="panel" style={{ padding: 24, marginTop: 16 }}>
          <div className="t-eyebrow" style={{ marginBottom: 12 }}>§LINKS — {result.linksFound.length}</div>
          <div className="t-mono" style={{ fontSize: 11, wordBreak: 'break-all', maxHeight: 200, overflow: 'auto' }}>
            {result.linksFound.map((l, i) => <div key={i} style={{ padding: 4, borderTop: i === 0 ? 0 : '1px solid var(--ink-08)' }}>{l}</div>)}
          </div>
        </div>
      )}

      {result.recommendations?.length > 0 && (
        <div className="panel" style={{ padding: 24, marginTop: 16 }}>
          <div className="t-eyebrow" style={{ marginBottom: 12 }}>§ACTIONS</div>
          {result.recommendations.map((r, i) => (
            <div key={i} style={{ padding: '6px 0', fontSize: 13, borderTop: i === 0 ? 0 : '1px solid var(--ink-08)' }}>
              <span style={{ color: 'var(--signal)', marginRight: 10 }}>→</span>{r}
            </div>
          ))}
        </div>
      )}

      {result.aiAnalysis && (
        <div className="panel" style={{ padding: 24, marginTop: 16, background: 'var(--ink)', color: 'var(--bone)' }}>
          <div className="t-eyebrow" style={{ marginBottom: 12, color: 'var(--bone-60)' }}>§AI ANALYSIS</div>
          <p style={{ fontSize: 14, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{result.aiAnalysis}</p>
        </div>
      )}
    </div>
  );
};

export default EmailScanner;
