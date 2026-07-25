import React from 'react';
import { FaExternalLinkAlt, FaCheckCircle, FaExclamationTriangle, FaTimesCircle } from 'react-icons/fa';
import RiskGauge from './RiskGauge';

const VerdictConfig = (result) => {
  if (result === 'Phishing') return { tone: 'signal', tag: 'PHISHING', icon: FaTimesCircle, action: 'Do not visit. Treat as hostile.' };
  if (result === 'Suspicious') return { tone: 'ink', tag: 'SUSPICIOUS', icon: FaExclamationTriangle, action: 'Verify before proceeding. Likely unsafe.' };
  if (result === 'Legit') return { tone: 'bone', tag: 'CLEAR', icon: FaCheckCircle, action: 'No threats detected. Safe to proceed.' };
  return { tone: 'bone', tag: 'UNKNOWN', icon: FaCheckCircle, action: 'Unable to classify.' };
};

const ScanResult = ({ result }) => {
  if (!result) return null;

  const cfg = VerdictConfig(result.result);
  const Icon = cfg.icon;
  const conf = result.confidence_score != null ? (result.confidence_score * 100).toFixed(0) : '--';

  return (
    <div style={{ marginTop: 32 }}>
      {/* VERDICT BAND */}
      <div className={`verdict verdict-${cfg.tone} verdict-row`} style={{ flexDirection: 'row', alignItems: 'stretch', padding: 0 }}>
        <div className="verdict-pad" style={{ flex: 1, padding: 32, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 0 }}>
          <div>
            <div className="t-eyebrow" style={{ color: cfg.tone === 'bone' ? 'var(--ink-60)' : 'var(--bone-60)' }}>
              §VERDICT — {result.created_at ? new Date(result.created_at).toISOString().replace('T', ' ').slice(0, 19) : 'N/A'} UTC
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12, flexWrap: 'wrap' }}>
              <Icon size={28} />
              <h2 className="h-display" style={{ fontSize: 'clamp(32px, 5vw, 48px)', margin: 0 }}>{cfg.tag}</h2>
            </div>
            <p style={{ marginTop: 12, fontSize: 16, opacity: 0.8, maxWidth: 480 }}>{cfg.action}</p>
          </div>
          <div style={{ display: 'flex', gap: 24, marginTop: 24, paddingTop: 16, borderTop: `1px solid ${cfg.tone === 'bone' ? 'var(--ink-08)' : 'var(--bone-08)'}`, flexWrap: 'wrap' }}>
            <div>
              <div className="t-eyebrow" style={{ color: cfg.tone === 'bone' ? 'var(--ink-60)' : 'var(--bone-60)' }}>CONFIDENCE</div>
              <div className="t-mono" style={{ fontSize: 22, marginTop: 4, fontWeight: 600 }}>{conf}%</div>
            </div>
            <div>
              <div className="t-eyebrow" style={{ color: cfg.tone === 'bone' ? 'var(--ink-60)' : 'var(--bone-60)' }}>DURATION</div>
              <div className="t-mono" style={{ fontSize: 22, marginTop: 4, fontWeight: 600 }}>{result.scan_duration ?? '--'}ms</div>
            </div>
            <div>
              <div className="t-eyebrow" style={{ color: cfg.tone === 'bone' ? 'var(--ink-60)' : 'var(--bone-60)' }}>SSL</div>
              <div className="t-mono" style={{ fontSize: 22, marginTop: 4, fontWeight: 600 }}>{result.meta_data?.has_ssl ? 'YES' : 'NO'}</div>
            </div>
          </div>
        </div>
        <div className="verdict-divider" style={{ width: 1, background: cfg.tone === 'bone' ? 'var(--ink-08)' : 'var(--bone-08)', minHeight: 1 }} />
        <div className="verdict-pad" style={{ flex: 1, padding: 32, display: 'flex', alignItems: 'center', minWidth: 0 }}>
          <RiskGauge score={result.confidence_score != null ? Math.round(result.confidence_score * 100) : 0} />
        </div>
      </div>

      {/* TARGET URL */}
      <div className="panel" style={{ marginTop: 24, padding: 24 }}>
        <div className="t-eyebrow" style={{ marginBottom: 8 }}>§TARGET</div>
        <div className="t-mono" style={{ fontSize: 14, wordBreak: 'break-all', lineHeight: 1.4 }}>{result.url}</div>
      </div>

      {/* RISK FACTORS */}
      {result.meta_data?.risk_factors?.length > 0 && (
        <div className="panel" style={{ marginTop: 24, padding: 24 }}>
          <div className="t-eyebrow" style={{ marginBottom: 16 }}>
            §INDICATORS — {result.meta_data.risk_factors.length} DETECTED
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {result.meta_data.risk_factors.map((f, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 16,
                padding: '12px 0',
                borderTop: i === 0 ? 0 : '1px solid var(--ink-08)',
                fontSize: 14
              }}>
                <span className="t-mono" style={{ color: 'var(--ink-40)', fontSize: 11, minWidth: 32 }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span style={{ flex: 1 }}>{f}</span>
                <span className="t-mono" style={{ fontSize: 10, color: 'var(--signal)', letterSpacing: '0.1em' }}>FLAGGED</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KEYWORDS + THREATS */}
      <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 24, marginTop: 24 }}>
        {result.meta_data?.keywords?.length > 0 && (
          <div className="panel" style={{ padding: 24 }}>
            <div className="t-eyebrow" style={{ marginBottom: 16 }}>§KEYWORDS</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {result.meta_data.keywords.map((k, i) => (
                <span key={i} className="chip chip-mute">{k}</span>
              ))}
            </div>
          </div>
        )}
        {result.meta_data?.threat_types?.length > 0 && (
          <div className="panel" style={{ padding: 24, background: 'var(--ink)', color: 'var(--bone)' }}>
            <div className="t-eyebrow" style={{ marginBottom: 16, color: 'var(--bone-60)' }}>§THREAT TYPES</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {result.meta_data.threat_types.map((t, i) => (
                <div key={i} className="t-mono" style={{ fontSize: 13 }}>
                  <span style={{ color: 'var(--signal)' }}>●</span> {t.toUpperCase()}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* URLSCAN */}
      {result.meta_data?.urlscan && (
        <div className="panel" style={{ marginTop: 24, padding: 24 }}>
          <div className="t-eyebrow" style={{ marginBottom: 12 }}>§URLSCAN.IO</div>
          <p style={{ fontSize: 14, color: 'var(--ink-60)', marginBottom: 12 }}>{result.meta_data.urlscan.message}</p>
          {result.meta_data.urlscan.resultUrl && (
            <a href={result.meta_data.urlscan.resultUrl} target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, borderBottom: '1px solid var(--ink)' }}>
              Open full report <FaExternalLinkAlt size={10} />
            </a>
          )}
        </div>
      )}

      {/* AI EXPLANATION */}
      {result.ai_explanation?.text && (
        <div className="panel" style={{ marginTop: 24, padding: 24, background: 'var(--ink)', color: 'var(--bone)' }}>
          <div className="t-eyebrow" style={{ marginBottom: 12, color: 'var(--bone-60)' }}>§AI ANALYSIS — {result.ai_explanation.generated_by}</div>
          <p style={{ fontSize: 15, lineHeight: 1.6 }}>{result.ai_explanation.text}</p>
          {result.ai_explanation.safety_tips?.length > 0 && (
            <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--bone-08)' }}>
              <div className="t-eyebrow" style={{ marginBottom: 12, color: 'var(--bone-60)' }}>ACTIONS</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {result.ai_explanation.safety_tips.map((t, i) => (
                  <li key={i} style={{ padding: '6px 0', fontSize: 13, color: 'var(--bone-60)' }}>
                    <span style={{ color: 'var(--signal)', marginRight: 12 }}>→</span>{t}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ScanResult;
