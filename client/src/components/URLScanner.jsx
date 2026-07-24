import React, { useState } from 'react';
import { FaSearch, FaSpinner, FaArrowRight } from 'react-icons/fa';

const URLScanner = ({ onScan, loading }) => {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!url.trim()) { setError('URL required'); return; }
    if (!/^https?:\/\//i.test(url.trim())) { setError('Must start with http:// or https://'); return; }
    onScan(url.trim());
  };

  return (
    <div className="panel" style={{ padding: 40 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }}>
        <div>
          <div className="t-eyebrow" style={{ marginBottom: 8 }}>§URL — INPUT</div>
          <h2 className="h-display-2" style={{ fontSize: 28, margin: 0 }}>Submit a target URL for analysis.</h2>
        </div>
        <div className="t-mono" style={{ fontSize: 11, color: 'var(--ink-60)' }}>
          7 LAYERS · ~800MS
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16 }}>
          <div style={{ flex: 1 }}>
            <label className="t-eyebrow" htmlFor="url">Target</label>
            <input
              id="url"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/login"
              className="field"
              disabled={loading}
              style={{ fontFamily: 'var(--type-mono)' }}
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary" style={{ height: 52, padding: '0 28px' }}>
            {loading ? <><FaSpinner className="animate-spin" /> ANALYZING</> : <>SCAN <FaArrowRight /></>}
          </button>
        </div>
        {error && (
          <div style={{ marginTop: 16, color: 'var(--signal)', fontFamily: 'var(--type-mono)', fontSize: 12 }}>
            ! {error}
          </div>
        )}
      </form>

      <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid var(--ink-08)' }}>
        <div className="t-eyebrow" style={{ marginBottom: 12 }}>SAMPLE TARGETS</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            { label: 'Legitimate', url: 'https://www.google.com', tone: 'ink' },
            { label: 'Suspicious TLD', url: 'http://secure-paypa1-login.tk', tone: 'ink' },
            { label: 'Brand typo', url: 'https://www.go0gle.com', tone: 'ink' }
          ].map((t, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setUrl(t.url)}
              className="focus-ring"
              style={{
                fontFamily: 'var(--type-mono)',
                fontSize: 11,
                padding: '6px 12px',
                border: '1px solid var(--ink-16)',
                background: 'transparent',
                cursor: 'pointer',
                transition: 'all 120ms'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--ink)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--ink-16)'; }}
            >
              <span style={{ color: 'var(--ink-60)' }}>{t.label}:</span> {t.url}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default URLScanner;
