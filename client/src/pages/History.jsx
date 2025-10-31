import React, { useState, useEffect } from 'react';
import { getHistory, deleteScan, clearHistory } from '../services/api';
import { FaTrash, FaSpinner, FaCheckCircle, FaExclamationTriangle, FaTimesCircle, FaFilter } from 'react-icons/fa';

const History = () => {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    fetchHistory();
  }, [filter]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const params = filter !== 'all' ? { result: filter } : {};
      const response = await getHistory(params);
      
      if (response.success) {
        setScans(response.data.scans);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this scan?')) {
      return;
    }

    try {
      await deleteScan(id);
      setScans(scans.filter(scan => scan._id !== id));
    } catch (error) {
      console.error('Failed to delete scan:', error);
      alert('Failed to delete scan');
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to clear all scan history? This action cannot be undone.')) {
      return;
    }

    try {
      await clearHistory();
      setScans([]);
      setPagination({});
    } catch (error) {
      console.error('Failed to clear history:', error);
      alert('Failed to clear history');
    }
  };

  const getResultIcon = (result) => {
    switch (result) {
      case 'Legit':
        return <FaCheckCircle className="text-emerald-400" />;
      case 'Suspicious':
        return <FaExclamationTriangle className="text-yellow-400" />;
      case 'Phishing':
        return <FaTimesCircle className="text-red-400" />;
      default:
        return null;
    }
  };

  const getResultBadge = (result) => {
    const styles = {
      Legit: 'bg-emerald-900/20 border border-emerald-800 text-emerald-400',
      Suspicious: 'bg-yellow-900/20 border border-yellow-800 text-yellow-400',
      Phishing: 'bg-red-900/20 border border-red-800 text-red-400',
    };

    return (
      <span className={`px-3 py-1 rounded text-xs font-semibold uppercase tracking-wider ${styles[result]}`}>
        {result}
      </span>
    );
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="bg-[#111111] border border-gray-800 rounded-lg p-8 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Scan History</h1>
              <p className="text-gray-400">
                {pagination.total || 0} total scans recorded
              </p>
            </div>
            {scans.length > 0 && (
              <button
                onClick={handleClearAll}
                className="bg-red-900/20 hover:bg-red-900/30 border border-red-800 text-red-400 px-4 py-2 rounded-lg font-semibold transition flex items-center space-x-2"
              >
                <FaTrash />
                <span>Clear All</span>
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-[#111111] border border-gray-800 rounded-lg p-6 mb-6">
          <div className="flex items-center space-x-2 mb-4">
            <FaFilter className="text-gray-400" />
            <span className="text-xs uppercase tracking-wider font-semibold text-gray-400">Filter by Result</span>
          </div>
          <div className="flex space-x-3">
            {['all', 'Legit', 'Suspicious', 'Phishing'].map((filterOption) => (
              <button
                key={filterOption}
                onClick={() => setFilter(filterOption)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filter === filterOption
                    ? 'bg-white text-black'
                    : 'bg-black/30 border border-gray-800 text-gray-400 hover:bg-black/50 hover:text-white'
                }`}
              >
                {filterOption === 'all' ? 'All Scans' : filterOption}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-[#111111] border border-gray-800 rounded-lg text-center py-12">
            <FaSpinner className="animate-spin text-4xl text-white mx-auto mb-4" />
            <p className="text-gray-400">Loading scan history...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && scans.length === 0 && (
          <div className="bg-[#111111] border border-gray-800 rounded-lg text-center py-12">
            <div className="text-6xl mb-4 opacity-50">📋</div>
            <h3 className="text-xl font-bold text-white mb-2">No Scans Yet</h3>
            <p className="text-gray-400">
              {filter !== 'all' 
                ? `No ${filter} scans found. Try a different filter.`
                : 'Start scanning URLs to see your history here.'}
            </p>
          </div>
        )}

        {/* Scan List */}
        {!loading && scans.length > 0 && (
          <div className="space-y-4">
            {scans.map((scan) => (
              <div key={scan._id} className="bg-[#111111] border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="text-3xl mt-1">
                      {getResultIcon(scan.result)}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        {getResultBadge(scan.result)}
                        <span className="text-xs uppercase tracking-wider text-gray-500">
                          {(scan.confidence_score * 100).toFixed(1)}% confidence
                        </span>
                      </div>

                      <p className="text-sm font-mono text-white bg-black/50 p-3 rounded border border-gray-800 mb-4 break-all">
                        {scan.url}
                      </p>

                      <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                        <div>
                          <span className="text-gray-500">SSL:</span>{' '}
                          {scan.meta_data?.has_ssl ? '✓ Yes' : '✗ No'}
                        </div>
                        <div>
                          <span className="text-gray-500">Duration:</span>{' '}
                          {scan.scan_duration}ms
                        </div>
                        <div>
                          <span className="text-gray-500">Scanned:</span>{' '}
                          {new Date(scan.created_at).toLocaleString()}
                        </div>
                      </div>

                      {scan.meta_data?.risk_factors && scan.meta_data.risk_factors.length > 0 && (
                        <div className="mt-4">
                          <details className="text-sm">
                            <summary className="cursor-pointer text-gray-300 font-medium hover:text-white transition">
                              {scan.meta_data.risk_factors.length} Risk Factor(s)
                            </summary>
                            <ul className="mt-3 space-y-2 ml-4">
                              {scan.meta_data.risk_factors.map((factor, index) => (
                                <li key={index} className="text-gray-400 flex items-start gap-2">
                                  <span className="text-red-400">•</span> {factor}
                                </li>
                              ))}
                            </ul>
                          </details>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(scan._id)}
                    className="text-red-400 hover:text-red-300 p-2 hover:bg-red-900/20 rounded transition"
                    title="Delete scan"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
