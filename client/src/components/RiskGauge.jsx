import React from 'react';

const RiskGauge = ({ score = 0, label }) => {
  const pct = Math.max(0, Math.min(100, score));
  const tone = pct >= 70 ? 'signal' : pct >= 40 ? 'ink' : 'ink';

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
        <div className="t-eyebrow">{label || 'RISK SCORE'}</div>
        <div style={{
          fontFamily: 'var(--type-display)',
          fontWeight: 700,
          fontSize: 56,
          letterSpacing: '-0.04em',
          lineHeight: 1,
          color: tone === 'signal' ? 'var(--signal)' : 'var(--ink)'
        }}>
          {pct}<span style={{ fontSize: 18, color: 'var(--ink-60)', fontWeight: 500, marginLeft: 4 }}>/100</span>
        </div>
      </div>

      <div style={{ position: 'relative' }}>
        <div className="gauge" style={{ '--gauge-pos': `${pct}%` }}>
          <div className="gauge-ticks">
            {Array.from({ length: 10 }).map((_, i) => <div key={i} className="gauge-tick" />)}
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }} className="t-mono">
          <span style={{ fontSize: 10, color: 'var(--ink-60)' }}>00 LOW</span>
          <span style={{ fontSize: 10, color: 'var(--ink-60)' }}>40 MED</span>
          <span style={{ fontSize: 10, color: 'var(--ink-60)' }}>70 HIGH</span>
          <span style={{ fontSize: 10, color: 'var(--signal)' }}>100 CRIT</span>
        </div>
      </div>
    </div>
  );
};

export default RiskGauge;
