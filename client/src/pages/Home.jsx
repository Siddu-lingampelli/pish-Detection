import React, { useState } from 'react';
import URLScanner from '../components/URLScanner';
import ScanResult from '../components/ScanResult';
import { scanURL } from '../services/api';

const Home = () => {
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);

  const handleScan = async (url) => {
    setLoading(true);
    setError(null);
    setScanResult(null);
    try {
      const response = await scanURL(url);
      if (response.success) setScanResult(response.data);
      else setError(response.message || 'Scan failed');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to scan URL');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: 'var(--bone)', minHeight: 'calc(100vh - 56px)' }}>
      {/* Status ribbon */}
      <div style={{
        borderBottom: '1px solid var(--ink-08)',
        padding: '10px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }} className="t-mono">
        <div style={{ fontSize: 10, letterSpacing: '0.15em', color: 'var(--ink-60)' }}>
          §CONSOLE / URL SCANNER
        </div>
        <div style={{ fontSize: 10, letterSpacing: '0.1em' }}>
          <span className="blink" style={{ color: 'var(--signal)' }}>●</span> READY
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 24px' }}>
        <URLScanner onScan={handleScan} loading={loading} />

        {error && (
          <div className="panel" style={{ marginTop: 24, padding: 20, background: 'var(--signal)', color: 'var(--bone)', borderColor: 'var(--signal)' }}>
            <div className="t-mono" style={{ fontSize: 12 }}>! {error}</div>
          </div>
        )}

        {scanResult && <ScanResult result={scanResult} />}
      </div>
    </div>
  );
};

export default Home;
