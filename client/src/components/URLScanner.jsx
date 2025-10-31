import React, { useState } from 'react';
import { FaSearch, FaSpinner } from 'react-icons/fa';

const URLScanner = ({ onScan, loading }) => {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

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
    <div className="bg-[#111111] border border-gray-800 rounded-lg p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">URL Threat Scanner</h2>
        <p className="text-gray-400 text-sm">
          Enter a URL for comprehensive threat analysis
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="url" className="block text-sm font-medium text-gray-400 mb-3">
            Target URL
          </label>
          <input
            type="text"
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="w-full px-4 py-3 bg-black border border-gray-800 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-white transition-colors"
            disabled={loading}
          />
          {error && (
            <p className="text-red-500 text-sm mt-3">{error}</p>
          )}
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className={`flex-1 flex items-center justify-center gap-3 px-6 py-3 rounded-lg font-medium transition-colors ${
              loading
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                : 'bg-white text-black hover:bg-gray-200'
            }`}
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin" />
                <span>Analyzing...</span>
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
            className="px-6 py-3 bg-transparent border border-gray-800 text-gray-400 hover:text-white hover:border-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Clear
          </button>
        </div>
      </form>

      <div className="mt-8 pt-8 border-t border-gray-800">
        <p className="text-sm font-medium text-gray-400 mb-4">Test URLs</p>
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Legitimate', url: 'https://www.google.com' },
            { label: 'Suspicious', url: 'http://secure-paypal-verify-login.tk' },
            { label: 'IP-based', url: 'http://192.168.1.1/login' }
          ].map((test, index) => (
            <button
              key={index}
              onClick={() => setUrl(test.url)}
              disabled={loading}
              className="text-sm px-3 py-1.5 bg-[#1a1a1a] border border-gray-800 text-gray-400 hover:text-white hover:border-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {test.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default URLScanner;
