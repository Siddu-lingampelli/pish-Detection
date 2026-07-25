import React, { useState, useEffect } from 'react';
import { getHistory, deleteScan, clearHistory } from '../services/api';

const History = () => {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [pagination, setPagination] = useState({});

  useEffect(() => { fetchHistory(); }, [filter]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const params = filter !== 'all' ? { result: filter } : {};
      const response = await getHistory(params);
      if (response.success) {
        setScans(response.data.scans);
        setPagination(response.data.pagination);
      }
    } catch { setScans([]); setPagination({}); } finally { setLoading(false); }
  };

  const onDelete = async (id) => {
    if (!confirm('Delete this scan?')) return;
    try {
      await deleteScan(id);
      setScans(prev => prev.filter(s => s._id !== id));
      setPagination(prev => ({ ...prev, total: Math.max(0, (prev.total || 1) - 1) }));
    } catch { alert('Delete failed'); }
  };

  const onClearAll = async () => {
    if (!confirm('Clear all scan history?')) return;
    try { await clearHistory(); setScans([]); setPagination({}); }
    catch { alert('Clear failed'); }
  };

  return (
    <div style={{ background: 'var(--bone)', minHeight: 'calc(100vh - 56px)' }}>
      <div style={{ borderBottom: '1px solid var(--ink-08)', padding: '10px clamp(16px, 3vw, 24px)', display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }} className="t-mono">
        <div style={{ fontSize: 10, letterSpacing: '0.15em', color: 'var(--ink-60)' }}>§CONSOLE / SCAN LOG</div>
        <div style={{ fontSize: 10, letterSpacing: '0.1em' }}><span className="blink" style={{ color: 'var(--signal)' }}>●</span> STREAMING</div>
      </div>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: 'clamp(24px, 4vw, 40px) clamp(16px, 3vw, 24px)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32, gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div className="t-eyebrow" style={{ marginBottom: 8 }}>§LOG</div>
            <h1 className="h-display" style={{ fontSize: 'clamp(32px, 5vw, 48px)', margin: 0 }}>Scan history</h1>
            <p className="t-mono" style={{ fontSize: 12, color: 'var(--ink-60)', marginTop: 8 }}>
              {pagination.total || 0} records in local store
            </p>
          </div>
          {scans.length > 0 && (
            <button onClick={onClearAll} className="btn-ghost" style={{ borderColor: 'var(--signal)', color: 'var(--signal)' }}>
              CLEAR ALL
            </button>
          )}
        </div>

        <div className="filter-tabs" style={{ display: 'flex', gap: 0, border: '1px solid var(--ink)', marginBottom: 24, flexWrap: 'wrap' }}>
          {['all', 'Legit', 'Suspicious', 'Phishing'].map((f, i) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                flex: 1,
                padding: '12px 16px',
                fontFamily: 'var(--type-display)',
                fontWeight: 600,
                fontSize: 12,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                background: filter === f ? 'var(--ink)' : 'transparent',
                color: filter === f ? 'var(--bone)' : 'var(--ink)',
                borderRight: i < 3 ? '1px solid var(--ink)' : 0,
                transition: 'all 120ms'
              }}
            >
              {f === 'all' ? 'All' : f}
            </button>
          ))}
        </div>

        {loading && <div className="t-mono" style={{ textAlign: 'center', padding: 40, color: 'var(--ink-60)' }}>LOADING...</div>}

        {!loading && scans.length === 0 && (
          <div className="panel" style={{ padding: 60, textAlign: 'center' }}>
            <div className="t-eyebrow" style={{ marginBottom: 8 }}>§EMPTY</div>
            <div className="h-display-2" style={{ fontSize: 20 }}>No scans match this filter</div>
          </div>
        )}

        <div style={{ border: '1px solid var(--ink)' }}>
          {scans.map((s, i) => {
            const tone = s.result === 'Phishing' ? 'signal' : s.result === 'Suspicious' ? 'ink' : 'bone';
            return (
              <div key={s._id} className="history-row-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(90px, 120px) minmax(0, 1fr) minmax(110px, 140px) minmax(60px, 100px) minmax(40px, 60px)',
                alignItems: 'center',
                padding: '16px 20px',
                borderTop: i === 0 ? 0 : '1px solid var(--ink-08)',
                gap: 20
              }}>
                <span className={`chip ${tone === 'signal' ? 'chip-signal' : 'chip-mute'}`}>{(s.result || 'UNKNOWN').toUpperCase()}</span>
                <div className="t-mono" style={{ fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.url}</div>
                <div className="t-mono" style={{ fontSize: 11, color: 'var(--ink-60)' }}>
                  {s.created_at ? new Date(s.created_at).toISOString().replace('T', ' ').slice(0, 16) : 'N/A'} UTC
                </div>
                <div className="t-mono" style={{ fontSize: 11, textAlign: 'right' }}>{s.scan_duration ?? '--'}ms</div>
                <button onClick={() => onDelete(s._id)} className="t-mono" style={{ fontSize: 11, color: 'var(--ink-60)', textAlign: 'right' }}>DELETE</button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default History;
