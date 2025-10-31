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
      
      if (response.success) {
        setScanResult(response.data);
      } else {
        setError(response.message || 'Failed to scan URL');
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 
        'Failed to scan URL. Please check your connection and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-6 py-12 max-w-5xl">
        {/* Scanner */}
        <div className="mb-8">
          <URLScanner onScan={handleScan} loading={loading} />
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 mb-8">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Scan Result */}
        {scanResult && (
          <ScanResult result={scanResult} />
        )}
      </div>
    </div>
  );
};

export default Home;
