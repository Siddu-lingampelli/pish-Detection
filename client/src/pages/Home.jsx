import React, { useState, useEffect } from 'react';
import URLScanner from '../components/URLScanner';
import ScanResult from '../components/ScanResult';
import { scanURL } from '../services/api';
import { FaInfoCircle } from 'react-icons/fa';

const Home = () => {
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);

  const handleScan = async (url) => {
    console.log('🔍 Starting scan for URL:', url);
    setLoading(true);
    setError(null);
    setScanResult(null);

    try {
      console.log('📡 Sending request to API...');
      const response = await scanURL(url);
      console.log('✅ API Response received:', response);
      
      if (response.success) {
        console.log('✅ Scan successful, setting result:', response.data);
        setScanResult(response.data);
      } else {
        console.error('❌ Scan failed:', response.message);
        setError(response.message || 'Failed to scan URL');
      }
    } catch (err) {
      console.error('❌ Scan error:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      setError(
        err.response?.data?.message || 
        'Failed to scan URL. Please check your connection and try again.'
      );
    } finally {
      setLoading(false);
      console.log('🏁 Scan complete, loading=false');
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8 text-white">
          <h1 className="text-4xl font-bold mb-2">
            AI-Powered Phishing Detection
          </h1>
          <p className="text-lg opacity-90">
            Protect yourself from phishing attacks in real-time
          </p>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <FaInfoCircle className="text-blue-500 mt-1 mr-3 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">How it works:</p>
              <p>
                Our AI analyzes URLs using multiple detection methods including pattern recognition, 
                keyword analysis, SSL verification, and threat intelligence databases to identify 
                phishing attempts with high accuracy.
              </p>
            </div>
          </div>
        </div>

        {/* Scanner */}
        <div className="mb-6">
          <URLScanner onScan={handleScan} loading={loading} />
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <FaInfoCircle className="text-red-500 mt-1 mr-3 flex-shrink-0" />
              <div className="text-sm text-red-800">
                <p className="font-semibold mb-1">Error</p>
                <p>{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Scan Result */}
        {scanResult && (
          <div className="animate-slideIn">
            <ScanResult result={scanResult} />
          </div>
        )}

        {/* Features */}
        {!scanResult && !loading && (
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            <div className="card text-center">
              <div className="text-4xl mb-3">🧠</div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                AI Detection
              </h3>
              <p className="text-sm text-gray-600">
                Advanced machine learning algorithms analyze URL patterns
              </p>
            </div>

            <div className="card text-center">
              <div className="text-4xl mb-3">⚡</div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                Real-Time Analysis
              </h3>
              <p className="text-sm text-gray-600">
                Get instant results in milliseconds
              </p>
            </div>

            <div className="card text-center">
              <div className="text-4xl mb-3">🔒</div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                Stay Protected
              </h3>
              <p className="text-sm text-gray-600">
                Identify threats before they harm you
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
