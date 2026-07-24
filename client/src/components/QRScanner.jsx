import { useState, useRef, useEffect } from 'react';
import { FaUpload, FaTimes } from 'react-icons/fa';
import { scanQR } from '../services/api';

const QRScanner = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [scanning, setScanning] = useState(false);
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

  const onScan = async () => {
    if (!file) { setError('Select a QR image first'); return; }
    setScanning(true);
    setError(null);
    try {
      const data = await scanQR(file);
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Scan failed');
    } finally {
      setScanning(false);
    }
  };

  const reset = () => { setFile(null); setPreview(null); setResult(null); setError(null); if (inputRef.current) inputRef.current.value = ''; };

  return (
    <div style={{ background: 'var(--bone)', minHeight: 'calc(100vh - 56px)' }}>
      <div style={{ borderBottom: '1px solid var(--ink-08)', padding: '10px 24px', display: 'flex', justifyContent: 'space-between' }} className="t-mono">
        <div style={{ fontSize: 10, letterSpacing: '0.15em', color: 'var(--ink-60)' }}>§CONSOLE / QR DECODER</div>
        <div style={{ fontSize: 10, letterSpacing: '0.1em' }}><span className="blink" style={{ color: 'var(--signal)' }}>●</span> READY</div>
      </div>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 24px' }}>
        {!result ? (
          <div className="panel" style={{ padding: 40 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }}>
              <div>
                <div className="t-eyebrow" style={{ marginBottom: 8 }}>§QR — INPUT</div>
                <h2 className="h-display-2" style={{ fontSize: 28, margin: 0 }}>Upload a QR code image.</h2>
              </div>
              <div className="t-mono" style={{ fontSize: 11, color: 'var(--ink-60)' }}>JPG · PNG · WEBP · 10MB MAX</div>
            </div>

            <div
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={(e) => { e.preventDefault(); setDrag(false); onSelect(e.dataTransfer.files?.[0]); }}
              style={{
                border: `2px dashed ${drag ? 'var(--ink)' : 'var(--ink-16)'}`,
                padding: 60,
                textAlign: 'center',
                cursor: 'pointer',
                background: drag ? 'var(--ink-04)' : 'transparent',
                transition: 'all 120ms'
              }}>
              {preview ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                  <img src={preview} alt="QR" style={{ maxWidth: 240, maxHeight: 240, border: '1px solid var(--ink)' }} />
                  <div className="t-mono" style={{ fontSize: 11, color: 'var(--ink-60)' }}>{file?.name}</div>
                  <button onClick={(e) => { e.stopPropagation(); reset(); }} className="t-mono" style={{ fontSize: 11, color: 'var(--signal)' }}>
                    <FaTimes size={10} style={{ marginRight: 6 }} />REMOVE
                  </button>
                </div>
              ) : (
                <>
                  <FaUpload size={32} style={{ color: 'var(--ink-40)', marginBottom: 16 }} />
                  <div className="h-display-2" style={{ fontSize: 18 }}>Drop QR image here or click to upload</div>
                  <div className="t-mono" style={{ fontSize: 11, color: 'var(--ink-60)', marginTop: 8 }}>UPI · URL · vCard · WiFi</div>
                </>
              )}
            </div>
            <input ref={inputRef} type="file" accept="image/*" onChange={(e) => onSelect(e.target.files?.[0])} style={{ display: 'none' }} />

            {preview && (
              <button onClick={onScan} disabled={scanning} className="btn-primary" style={{ width: '100%', marginTop: 24 }}>
                {scanning ? 'DECODING...' : 'DECODE QR →'}
              </button>
            )}

            {error && (
              <div className="t-mono" style={{ marginTop: 16, fontSize: 12, color: 'var(--signal)' }}>! {error}</div>
            )}
          </div>
        ) : (
          <QRResult result={result} onReset={reset} />
        )}
      </div>
    </div>
  );
};

const QRResult = ({ result, onReset }) => {
  const risk = result.overallRisk;
  const tone = risk?.level === 'HIGH' ? 'signal' : risk?.level === 'MEDIUM' ? 'ink' : 'bone';

  return (
    <div>
      <div className={`verdict verdict-${tone}`} style={{ flexDirection: 'row' }}>
        <div style={{ flex: 1, padding: 32 }}>
          <div className="t-eyebrow" style={{ color: tone === 'bone' ? 'var(--ink-60)' : 'var(--bone-60)' }}>§QR — VERDICT</div>
          <h2 className="h-display" style={{ fontSize: 48, margin: '12px 0 0' }}>{risk?.level || 'UNKNOWN'}</h2>
          <p style={{ marginTop: 12, fontSize: 16, opacity: 0.8 }}>{risk?.action}</p>
        </div>
        <div style={{ width: 1, background: tone === 'bone' ? 'var(--ink-08)' : 'var(--bone-08)' }} />
        <div style={{ flex: 1, padding: 32, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div className="t-eyebrow" style={{ color: tone === 'bone' ? 'var(--ink-60)' : 'var(--bone-60)' }}>RISK SCORE</div>
          <div style={{ fontFamily: 'var(--type-display)', fontWeight: 700, fontSize: 72, lineHeight: 1, marginTop: 4, color: tone === 'signal' ? 'var(--bone)' : 'var(--ink)' }}>
            {risk?.score || 0}<span style={{ fontSize: 18, opacity: 0.6, fontWeight: 500, marginLeft: 4 }}>/100</span>
          </div>
        </div>
      </div>

      <div className="panel" style={{ padding: 24, marginTop: 24 }}>
        <div className="t-eyebrow" style={{ marginBottom: 8 }}>§DECODED DATA — {result.qrCode?.type}</div>
        <div className="t-mono" style={{ fontSize: 14, wordBreak: 'break-all', lineHeight: 1.4 }}>{result.qrCode?.data}</div>
      </div>

      {result.upiPayment && (
        <div className="panel" style={{ padding: 24, marginTop: 24, background: 'var(--ink)', color: 'var(--bone)' }}>
          <div className="t-eyebrow" style={{ marginBottom: 16, color: 'var(--bone-60)' }}>§UPI PAYMENT</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <div>
              <div className="t-eyebrow" style={{ color: 'var(--bone-60)' }}>PAYEE</div>
              <div className="t-mono" style={{ fontSize: 18, marginTop: 4 }}>{result.upiPayment.payee}</div>
            </div>
            <div>
              <div className="t-eyebrow" style={{ color: 'var(--bone-60)' }}>AMOUNT</div>
              <div className="t-mono" style={{ fontSize: 18, marginTop: 4, color: 'var(--signal)' }}>₹{result.upiPayment.amount}</div>
            </div>
            {result.upiPayment.note && (
              <div style={{ gridColumn: '1 / -1' }}>
                <div className="t-eyebrow" style={{ color: 'var(--bone-60)' }}>NOTE</div>
                <div style={{ fontSize: 14, marginTop: 4 }}>{result.upiPayment.note}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {result.overallRisk?.factors?.length > 0 && (
        <div className="panel" style={{ padding: 24, marginTop: 24 }}>
          <div className="t-eyebrow" style={{ marginBottom: 16 }}>§INDICATORS — {result.overallRisk.factors.length}</div>
          {result.overallRisk.factors.map((f, i) => (
            <div key={i} className="t-mono" style={{ fontSize: 12, padding: '8px 0', borderTop: i === 0 ? 0 : '1px solid var(--ink-08)' }}>
              <span style={{ color: 'var(--ink-40)', marginRight: 12 }}>{String(i + 1).padStart(2, '0')}</span>{f}
            </div>
          ))}
        </div>
      )}

      {result.security?.aiAnalysis?.explanation && (
        <div className="panel" style={{ padding: 24, marginTop: 24, background: 'var(--ink)', color: 'var(--bone)' }}>
          <div className="t-eyebrow" style={{ marginBottom: 12, color: 'var(--bone-60)' }}>§AI ANALYSIS</div>
          <p style={{ fontSize: 14, lineHeight: 1.6 }}>{result.security.aiAnalysis.explanation}</p>
        </div>
      )}

      <button onClick={onReset} className="btn-ghost" style={{ width: '100%', marginTop: 24 }}>
        SCAN ANOTHER QR
      </button>
    </div>
  );
};

export default QRScanner;
