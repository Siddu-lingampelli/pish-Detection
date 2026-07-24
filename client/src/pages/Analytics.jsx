import React, { useState, useEffect } from 'react';
import { getStats } from '../services/api';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const Analytics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { (async () => {
    try {
      const r = await getStats();
      if (r.success) setStats(r.data);
    } catch {} finally { setLoading(false); }
  })(); }, []);

  if (loading) return <div className="t-mono" style={{ padding: 40, textAlign: 'center', color: 'var(--ink-60)' }}>LOADING ANALYTICS...</div>;
  if (!stats) return <div className="t-mono" style={{ padding: 40, textAlign: 'center' }}>NO DATA</div>;

  const pieData = [
    { name: 'Legit', value: stats.counts.legit, color: 'var(--ink)' },
    { name: 'Suspicious', value: stats.counts.suspicious, color: 'var(--ink-40)' },
    { name: 'Phishing', value: stats.counts.phishing, color: 'var(--signal)' }
  ];
  const barData = [
    { name: 'Legit', count: stats.counts.legit, fill: 'var(--ink)' },
    { name: 'Suspicious', count: stats.counts.suspicious, fill: 'var(--ink-40)' },
    { name: 'Phishing', count: stats.counts.phishing, fill: 'var(--signal)' }
  ];

  return (
    <div style={{ background: 'var(--bone)', minHeight: 'calc(100vh - 56px)' }}>
      <div style={{ borderBottom: '1px solid var(--ink-08)', padding: '10px 24px', display: 'flex', justifyContent: 'space-between' }} className="t-mono">
        <div style={{ fontSize: 10, letterSpacing: '0.15em', color: 'var(--ink-60)' }}>§CONSOLE / ANALYTICS</div>
        <div style={{ fontSize: 10, letterSpacing: '0.1em' }}><span className="blink" style={{ color: 'var(--signal)' }}>●</span> LIVE</div>
      </div>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ marginBottom: 32 }}>
          <div className="t-eyebrow" style={{ marginBottom: 8 }}>§DATA</div>
          <h1 className="h-display" style={{ fontSize: 48, margin: 0 }}>Threat analytics</h1>
        </div>

        {/* STAT CARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0, border: '1px solid var(--ink)', marginBottom: 24 }}>
          {[
            { label: 'Total scans', val: stats.totalScans, sub: 'all time' },
            { label: 'Legit', val: stats.counts.legit, sub: `${stats.percentages.legit}%` },
            { label: 'Suspicious', val: stats.counts.suspicious, sub: `${stats.percentages.suspicious}%` },
            { label: 'Phishing', val: stats.counts.phishing, sub: `${stats.percentages.phishing}%`, accent: true }
          ].map((s, i) => (
            <div key={i} style={{
              padding: 24,
              borderRight: i < 3 ? '1px solid var(--ink)' : 0,
              background: s.accent && s.val > 0 ? 'var(--signal)' : 'transparent',
              color: s.accent && s.val > 0 ? 'var(--bone)' : 'var(--ink)'
            }}>
              <div className="t-eyebrow" style={{ color: s.accent && s.val > 0 ? 'var(--bone-60)' : 'var(--ink-60)' }}>{s.label}</div>
              <div className="stat-num" style={{ marginTop: 12 }}>{s.val}</div>
              <div className="t-mono" style={{ fontSize: 11, marginTop: 4, color: s.accent && s.val > 0 ? 'var(--bone-60)' : 'var(--ink-60)' }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* CHARTS */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, border: '1px solid var(--ink)', marginBottom: 24 }}>
          <div style={{ padding: 24, borderRight: '1px solid var(--ink)' }}>
            <div className="t-eyebrow" style={{ marginBottom: 16 }}>§DISTRIBUTION</div>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={100} dataKey="value" stroke="var(--bone)" strokeWidth={2}>
                  {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--ink)', border: 0, color: 'var(--bone)', fontFamily: 'var(--type-mono)', fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ padding: 24 }}>
            <div className="t-eyebrow" style={{ marginBottom: 16 }}>§COMPARISON</div>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={barData}>
                <CartesianGrid stroke="var(--ink-08)" strokeDasharray="0" />
                <XAxis dataKey="name" stroke="var(--ink-60)" style={{ fontFamily: 'var(--type-mono)', fontSize: 11 }} />
                <YAxis stroke="var(--ink-60)" style={{ fontFamily: 'var(--type-mono)', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: 'var(--ink)', border: 0, color: 'var(--bone)', fontFamily: 'var(--type-mono)', fontSize: 12 }} />
                <Bar dataKey="count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* BOTTOM ROW */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div className="panel" style={{ padding: 24 }}>
            <div className="t-eyebrow" style={{ marginBottom: 16 }}>§PERFORMANCE</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <div>
                <div className="t-eyebrow" style={{ color: 'var(--ink-60)' }}>Avg duration</div>
                <div className="stat-num" style={{ fontSize: 32, marginTop: 4 }}>{stats.avgScanDuration?.toFixed(0) || 0}<span style={{ fontSize: 12, color: 'var(--ink-60)' }}>ms</span></div>
              </div>
              <div>
                <div className="t-eyebrow" style={{ color: 'var(--ink-60)' }}>Last 7 days</div>
                <div className="stat-num" style={{ fontSize: 32, marginTop: 4 }}>{stats.recentScans?.last7Days || 0}</div>
              </div>
            </div>
          </div>
          <div className="panel" style={{ padding: 24 }}>
            <div className="t-eyebrow" style={{ marginBottom: 16 }}>§TOP INDICATORS</div>
            {stats.topRiskFactors?.length > 0 ? stats.topRiskFactors.map((r, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderTop: i === 0 ? 0 : '1px solid var(--ink-08)' }}>
                <span style={{ fontSize: 13 }}>{r.factor}</span>
                <span className="t-mono" style={{ fontSize: 12, color: 'var(--ink-60)' }}>×{r.count}</span>
              </div>
            )) : <div className="t-mono" style={{ fontSize: 11, color: 'var(--ink-60)' }}>NO DATA</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
