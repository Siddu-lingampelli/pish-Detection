import { useState, useRef, useEffect } from 'react';
import { FaUpload, FaTimes } from 'react-icons/fa';
import { analyzeScreenshot } from '../services/api';

const ScreenshotAnalyzer = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [drag, setDrag] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  const onSelect = (f) => {
    if (!f) return;
    if (!f.type.startsWith('image/')) { setError('Image files only'); return; }
    if (f.size > 10 * 1024 * 1024) { setError('Max 10MB'); return; }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setError(null);
    setResult(null);
  };

  const onAnalyze = async () => {
    if (!file) { setError('Select a screenshot first'); return; }
    setAnalyzing(true);
    setError(null);
    try {
      const data = await analyzeScreenshot(file);
      setResult(data?.data || data);
    } catch (err) {
      setError(err.response?.data?.error || 'Analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  const reset = () => { setFile(null); setPreview(null); setResult(null); setError(null); if (inputRef.current) inputRef.current.value = ''; };

  return (
    <div style={{ background: 'var(--bone)', minHeight: 'calc(100vh - 56px)' }}>
      <div style={{ borderBottom: '1px solid var(--ink-08)', padding: '10px clamp(16px, 3vw, 24px)', display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }} className="t-mono">
        <div style={{ fontSize: 10, letterSpacing: '0.15em', color: 'var(--ink-60)' }}>§CONSOLE / SCREENSHOT</div>
        <div style={{ fontSize: 10, letterSpacing: '0.1em' }}><span className="blink" style={{ color: 'var(--signal)' }}>●</span> READY</div>
      </div>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: 'clamp(24px, 4vw, 40px) clamp(16px, 3vw, 24px)' }}>
        {!result ? (
          <div className="panel" style={{ padding: 'clamp(20px, 3vw, 40px)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24, gap: 16, flexWrap: 'wrap' }}>
              <div>
                <div className="t-eyebrow" style={{ marginBottom: 8 }}>§IMG — INPUT</div>
                <h2 className="h-display-2" style={{ fontSize: 'clamp(22px, 3vw, 28px)', margin: 0 }}>Upload a screenshot of a suspicious page.</h2>
              </div>
              <div className="t-mono" style={{ fontSize: 11, color: 'var(--ink-60)' }}>VISION + OCR · 10MB</div>
            </div>

            <div
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={(e) => { e.preventDefault(); setDrag(false); onSelect(e.dataTransfer.files?.[0]); }}
              style={{
                border: `2px dashed ${drag ? 'var(--ink)' : 'var(--ink-16)'}`,
                padding: 'clamp(28px, 6vw, 60px)',
                textAlign: 'center',
                cursor: 'pointer',
                background: drag ? 'var(--ink-04)' : 'transparent'
              }}>
              {preview ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                  <img src={preview} alt="" style={{ maxWidth: '100%', maxHeight: 400, border: '1px solid var(--ink)' }} />
                  <div className="t-mono" style={{ fontSize: 11, color: 'var(--ink-60)' }}>{file?.name}</div>
                  <button onClick={(e) => { e.stopPropagation(); reset(); }} className="t-mono" style={{ fontSize: 11, color: 'var(--signal)' }}>
                    <FaTimes size={10} style={{ marginRight: 6 }} />REMOVE
                  </button>
                </div>
              ) : (
                <>
                  <FaUpload size={32} style={{ color: 'var(--ink-40)', marginBottom: 16 }} />
                  <div className="h-display-2" style={{ fontSize: 18 }}>Drop screenshot here or click to upload</div>
                  <div className="t-mono" style={{ fontSize: 11, color: 'var(--ink-60)', marginTop: 8 }}>OCR + BRAND DETECTION + FORM ANALYSIS</div>
                </>
              )}
            </div>
            <input ref={inputRef} type="file" accept="image/*" onChange={(e) => onSelect(e.target.files?.[0])} style={{ display: 'none' }} />

            {preview && (
              <button onClick={onAnalyze} disabled={analyzing} className="btn-primary" style={{ width: '100%', marginTop: 24 }}>
                {analyzing ? 'ANALYZING...' : 'ANALYZE →'}
              </button>
            )}

            {error && (
              <div className="t-mono" style={{ marginTop: 16, fontSize: 12, color: 'var(--signal)' }}>! {error}</div>
            )}
          </div>
        ) : (
          <ScreenshotResult result={result} onReset={reset} />
        )}
      </div>
    </div>
  );
};

const ScreenshotResult = ({ result, onReset }) => {
  const a = result.analysis;
  const tone = a?.riskLevel === 'HIGH' ? 'signal' : a?.riskLevel === 'MEDIUM' ? 'ink' : 'bone';

  return (
    <div>
      <div className={`verdict verdict-${tone} verdict-row`} style={{ flexDirection: 'row' }}>
        <div className="verdict-pad" style={{ flex: 1, padding: 32, minWidth: 0 }}>
          <div className="t-eyebrow" style={{ color: tone === 'bone' ? 'var(--ink-60)' : 'var(--bone-60)' }}>§IMG — VERDICT</div>
          <h2 className="h-display" style={{ fontSize: 'clamp(32px, 5vw, 48px)', margin: '12px 0 0' }}>{a?.riskLevel || 'UNKNOWN'} RISK</h2>
          <p style={{ marginTop: 12, fontSize: 14, opacity: 0.8 }}>
            {a?.hasLoginForm ? 'Login form detected in screenshot' : 'No obvious login form detected'}
          </p>
        </div>
        <div className="verdict-divider" style={{ width: 1, background: tone === 'bone' ? 'var(--ink-08)' : 'var(--bone-08)', minHeight: 1 }} />
        <div className="verdict-pad" style={{ flex: 1, padding: 32, display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 16, alignContent: 'center', minWidth: 0 }}>
          <div>
            <div className="t-eyebrow" style={{ color: tone === 'bone' ? 'var(--ink-60)' : 'var(--bone-60)' }}>RISK</div>
            <div style={{ fontFamily: 'var(--type-display)', fontWeight: 700, fontSize: 'clamp(28px, 4vw, 40px)', lineHeight: 1, marginTop: 4 }}>{a?.riskScore || 0}<span style={{ fontSize: 14, opacity: 0.6, fontWeight: 500 }}>/100</span></div>
          </div>
          <div>
            <div className="t-eyebrow" style={{ color: tone === 'bone' ? 'var(--ink-60)' : 'var(--bone-60)' }}>CONFIDENCE</div>
            <div style={{ fontFamily: 'var(--type-display)', fontWeight: 700, fontSize: 'clamp(28px, 4vw, 40px)', lineHeight: 1, marginTop: 4 }}>{((a?.confidence || 0) * 100).toFixed(0)}%</div>
          </div>
        </div>
      </div>

      {a?.suspiciousElements?.length > 0 && (
        <div className="panel" style={{ padding: 24, marginTop: 24 }}>
          <div className="t-eyebrow" style={{ marginBottom: 16 }}>§SUSPICIOUS ELEMENTS — {a.suspiciousElements.length}</div>
          {a.suspiciousElements.map((s, i) => (
            <div key={i} className="t-mono" style={{ fontSize: 12, padding: '8px 0', borderTop: i === 0 ? 0 : '1px solid var(--ink-08)' }}>
              <span style={{ color: 'var(--ink-40)', marginRight: 12 }}>{String(i + 1).padStart(2, '0')}</span>{s}
            </div>
          ))}
        </div>
      )}

      {a?.textAnalysis?.suspiciousKeywords?.length > 0 && (
        <div className="panel" style={{ padding: 24, marginTop: 24 }}>
          <div className="t-eyebrow" style={{ marginBottom: 16 }}>§KEYWORDS DETECTED</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {a.textAnalysis.suspiciousKeywords.map((k, i) => (
              <span key={i} className="chip chip-mute">{k}</span>
            ))}
          </div>
        </div>
      )}

      {a?.brandImpersonation && (
        <div className="panel" style={{ padding: 24, marginTop: 24 }}>
          <div className="t-eyebrow" style={{ marginBottom: 12 }}>§BRAND DETECTION</div>
          <p style={{ fontSize: 14, color: 'var(--ink-60)', marginBottom: 12 }}>{a.brandImpersonation.reason}</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {a.brandImpersonation.brands?.map((b, i) => (
              <span key={i} className="chip">{b}</span>
            ))}
          </div>
        </div>
      )}

      {a?.recommendations?.length > 0 && (
        <div className="panel" style={{ padding: 24, marginTop: 24 }}>
          <div className="t-eyebrow" style={{ marginBottom: 16 }}>§RECOMMENDATIONS</div>
          {a.recommendations.map((r, i) => (
            <div key={i} style={{ padding: '8px 0', fontSize: 14, borderTop: i === 0 ? 0 : '1px solid var(--ink-08)' }}>
              <span style={{ color: 'var(--signal)', marginRight: 12 }}>→</span>{r}
            </div>
          ))}
        </div>
      )}

      {a?.extractedText && (
        <details className="panel" style={{ padding: 24, marginTop: 24 }}>
          <summary className="t-eyebrow" style={{ cursor: 'pointer' }}>§EXTRACTED TEXT (OCR)</summary>
          <pre className="t-mono" style={{ fontSize: 11, marginTop: 16, whiteSpace: 'pre-wrap', color: 'var(--ink-60)', maxHeight: 200, overflow: 'auto' }}>{a.extractedText}</pre>
        </details>
      )}

      <button onClick={onReset} className="btn-ghost" style={{ width: '100%', marginTop: 24 }}>ANALYZE ANOTHER</button>
    </div>
  );
};

export default ScreenshotAnalyzer;
