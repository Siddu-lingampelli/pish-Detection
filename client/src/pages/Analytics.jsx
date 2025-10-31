import React, { useState, useEffect } from 'react';
import { getStats } from '../services/api';
import { FaSpinner, FaShieldAlt, FaCheckCircle, FaExclamationTriangle, FaTimesCircle, FaClock } from 'react-icons/fa';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const Analytics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await getStats();
      
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-8 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-6xl text-white mx-auto mb-4" />
          <p className="text-gray-400 text-lg">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen py-8 flex items-center justify-center">
        <div className="bg-[#111111] border border-gray-800 rounded-lg p-8 text-center">
          <p className="text-gray-400">Failed to load analytics data</p>
        </div>
      </div>
    );
  }

  const pieData = [
    { name: 'Legit', value: stats.counts.legit, color: '#10b981' },
    { name: 'Suspicious', value: stats.counts.suspicious, color: '#f59e0b' },
    { name: 'Phishing', value: stats.counts.phishing, color: '#ef4444' },
  ];

  const barData = [
    { name: 'Legit', count: stats.counts.legit, fill: '#10b981' },
    { name: 'Suspicious', count: stats.counts.suspicious, fill: '#f59e0b' },
    { name: 'Phishing', count: stats.counts.phishing, fill: '#ef4444' },
  ];

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="bg-[#111111] border border-gray-800 rounded-lg p-8 mb-6">
          <div className="flex items-center space-x-3">
            <FaShieldAlt className="text-3xl text-white" />
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">Security Analytics</h1>
              <p className="text-gray-400">Comprehensive overview of scan results and threat detection</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-6">
          <div className="bg-[#111111] border border-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">Total Scans</p>
                <p className="text-4xl font-bold text-white tracking-tight">{stats.totalScans}</p>
              </div>
              <FaShieldAlt className="text-4xl text-gray-700" />
            </div>
          </div>

          <div className="bg-emerald-900/20 border border-emerald-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-emerald-400 mb-2">Legit URLs</p>
                <p className="text-4xl font-bold text-emerald-400 tracking-tight">{stats.counts.legit}</p>
                <p className="text-xs text-emerald-400/60 mt-1">{stats.percentages.legit}%</p>
              </div>
              <FaCheckCircle className="text-4xl text-emerald-400/30" />
            </div>
          </div>

          <div className="bg-yellow-900/20 border border-yellow-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-yellow-400 mb-2">Suspicious</p>
                <p className="text-4xl font-bold text-yellow-400 tracking-tight">{stats.counts.suspicious}</p>
                <p className="text-xs text-yellow-400/60 mt-1">{stats.percentages.suspicious}%</p>
              </div>
              <FaExclamationTriangle className="text-4xl text-yellow-400/30" />
            </div>
          </div>

          <div className="bg-red-900/20 border border-red-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-red-400 mb-2">Phishing</p>
                <p className="text-4xl font-bold text-red-400 tracking-tight">{stats.counts.phishing}</p>
                <p className="text-xs text-red-400/60 mt-1">{stats.percentages.phishing}%</p>
              </div>
              <FaTimesCircle className="text-4xl text-red-400/30" />
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Pie Chart */}
          <div className="bg-[#111111] border border-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-6">Detection Distribution</h2>
            {stats.totalScans > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1a1a1a', 
                      border: '1px solid #333', 
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ color: '#9ca3af' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-gray-500">
                No data available
              </div>
            )}
          </div>

          {/* Bar Chart */}
          <div className="bg-[#111111] border border-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-6">Scan Results Comparison</h2>
            {stats.totalScans > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="name" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1a1a1a', 
                      border: '1px solid #333', 
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                  <Bar dataKey="count" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-gray-500">
                No data available
              </div>
            )}
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Performance Stats */}
          <div className="bg-[#111111] border border-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-6">Performance Metrics</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-black/30 border border-gray-800 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FaClock className="text-white text-xl" />
                  <span className="text-sm text-gray-400">Avg Scan Duration</span>
                </div>
                <span className="text-2xl font-bold text-white tracking-tight">
                  {stats.avgScanDuration?.toFixed(2) || 0}ms
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-black/30 border border-gray-800 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FaShieldAlt className="text-emerald-400 text-xl" />
                  <span className="text-sm text-gray-400">Recent Scans (7 days)</span>
                </div>
                <span className="text-2xl font-bold text-white tracking-tight">
                  {stats.recentScans?.last7Days || 0}
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-black/30 border border-gray-800 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FaTimesCircle className="text-red-400 text-xl" />
                  <span className="text-sm text-gray-400">Threat Detection Rate</span>
                </div>
                <span className="text-2xl font-bold text-white tracking-tight">
                  {stats.totalScans > 0 
                    ? ((stats.counts.phishing / stats.totalScans) * 100).toFixed(1)
                    : 0}%
                </span>
              </div>
            </div>
          </div>

          {/* Top Risk Factors */}
          <div className="bg-[#111111] border border-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-6">Top Risk Factors</h2>
            {stats.topRiskFactors && stats.topRiskFactors.length > 0 ? (
              <div className="space-y-3">
                {stats.topRiskFactors.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-black/30 border border-gray-800 rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm text-gray-300">{item.factor}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="bg-white/10 border border-gray-700 text-white px-3 py-1 rounded text-sm font-semibold">
                        {item.count}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                No risk factors detected yet
              </div>
            )}
          </div>
        </div>

        {/* Security Insights */}
        <div className="bg-[#111111] border border-gray-800 rounded-lg p-6 mt-6">
          <h2 className="text-xl font-bold text-white mb-4">Security Insights</h2>
          <div className="space-y-3 text-sm text-gray-400">
            {stats.counts.phishing > 0 && (
              <p className="flex items-start gap-2">
                <span className="text-red-400">•</span>
                <span><span className="text-white font-semibold">{stats.counts.phishing}</span> phishing attempts detected. The system has protected you from potential threats.</span>
              </p>
            )}
            {stats.totalScans > 10 && (
              <p className="flex items-start gap-2">
                <span className="text-emerald-400">•</span>
                <span>You've performed <span className="text-white font-semibold">{stats.totalScans}</span> scans. Stay vigilant and keep scanning suspicious URLs.</span>
              </p>
            )}
            {parseFloat(stats.percentages.legit) > 70 && (
              <p className="flex items-start gap-2">
                <span className="text-emerald-400">•</span>
                <span>Over <span className="text-white font-semibold">{stats.percentages.legit}%</span> of scanned URLs were legitimate. Good job staying on safe websites.</span>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
