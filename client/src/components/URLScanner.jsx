import React, { useState } from 'react';
import { FaSearch, FaSpinner } from 'react-icons/fa';

const URLScanner = ({ onScan, loading }) => {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Validate URL
    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      setError('URL must start with http:// or https://');
      return;
    }

    onScan(url.trim());
  };

  const handleClear = () => {
    setUrl('');
    setError('');
  };

  return (
    <div className="card">
      <div className="flex items-center space-x-3 mb-6">
        <FaSearch className="text-3xl text-blue-600" />
        <div>
          <h2 className="text-2xl font-bold text-gray-800">URL Scanner</h2>
          <p className="text-gray-500 text-sm">
            Enter a URL to check for phishing threats
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
            Website URL
          </label>
          <input
            type="text"
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="input-field"
            disabled={loading}
          />
          {error && (
            <p className="text-red-500 text-sm mt-2">{error}</p>
          )}
        </div>

        <div className="flex space-x-3">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex items-center space-x-2 flex-1"
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin" />
                <span>Scanning...</span>
              </>
            ) : (
              <>
                <FaSearch />
                <span>Scan URL</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleClear}
            disabled={loading}
            className="btn-secondary"
          >
            Clear
          </button>
        </div>
      </form>

      {/* Sample URLs for testing */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <p className="text-sm text-gray-600 mb-2">Quick test URLs:</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setUrl('https://www.google.com')}
            className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700"
            disabled={loading}
          >
            Legit: google.com
          </button>
          <button
            onClick={() => setUrl('http://secure-paypal-verify-login.tk')}
            className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700"
            disabled={loading}
          >
            Suspicious: paypal-verify.tk
          </button>
          <button
            onClick={() => setUrl('http://192.168.1.1/login')}
            className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700"
            disabled={loading}
          >
            Suspicious: IP-based URL
          </button>
        </div>
      </div>
    </div>
  );
};

export default URLScanner;
