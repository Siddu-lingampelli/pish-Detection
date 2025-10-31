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
          <FaSpinner className="animate-spin text-6xl text-blue-600 mx-auto mb-4" />
          <p className="text-white text-lg">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen py-8 flex items-center justify-center">
        <div className="card text-center">
          <p className="text-gray-600">Failed to load analytics data</p>
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
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="card mb-6">
          <div className="flex items-center space-x-3">
            <FaShieldAlt className="text-4xl text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Security Analytics</h1>
              <p className="text-gray-600">Comprehensive overview of scan results and threat detection</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-6">
          <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90 mb-1">Total Scans</p>
                <p className="text-3xl font-bold">{stats.totalScans}</p>
              </div>
              <FaShieldAlt className="text-4xl opacity-50" />
            </div>
          </div>

          <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90 mb-1">Legit URLs</p>
                <p className="text-3xl font-bold">{stats.counts.legit}</p>
                <p className="text-xs opacity-90">{stats.percentages.legit}%</p>
              </div>
              <FaCheckCircle className="text-4xl opacity-50" />
            </div>
          </div>

          <div className="card bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90 mb-1">Suspicious</p>
                <p className="text-3xl font-bold">{stats.counts.suspicious}</p>
                <p className="text-xs opacity-90">{stats.percentages.suspicious}%</p>
              </div>
              <FaExclamationTriangle className="text-4xl opacity-50" />
            </div>
          </div>

          <div className="card bg-gradient-to-br from-red-500 to-red-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90 mb-1">Phishing</p>
                <p className="text-3xl font-bold">{stats.counts.phishing}</p>
                <p className="text-xs opacity-90">{stats.percentages.phishing}%</p>
              </div>
              <FaTimesCircle className="text-4xl opacity-50" />
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Pie Chart */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Detection Distribution</h2>
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
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-gray-500">
                No data available
              </div>
            )}
          </div>

          {/* Bar Chart */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Scan Results Comparison</h2>
            {stats.totalScans > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
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
          <div className="card">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Performance Metrics</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FaClock className="text-blue-600 text-xl" />
                  <span className="font-medium text-gray-700">Avg Scan Duration</span>
                </div>
                <span className="text-lg font-bold text-gray-800">
                  {stats.avgScanDuration?.toFixed(2) || 0}ms
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FaShieldAlt className="text-green-600 text-xl" />
                  <span className="font-medium text-gray-700">Recent Scans (7 days)</span>
                </div>
                <span className="text-lg font-bold text-gray-800">
                  {stats.recentScans?.last7Days || 0}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FaTimesCircle className="text-red-600 text-xl" />
                  <span className="font-medium text-gray-700">Threat Detection Rate</span>
                </div>
                <span className="text-lg font-bold text-gray-800">
                  {stats.totalScans > 0 
                    ? ((stats.counts.phishing / stats.totalScans) * 100).toFixed(1)
                    : 0}%
                </span>
              </div>
            </div>
          </div>

          {/* Top Risk Factors */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Top Risk Factors</h2>
            {stats.topRiskFactors && stats.topRiskFactors.length > 0 ? (
              <div className="space-y-3">
                {stats.topRiskFactors.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700">{item.factor}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
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
        <div className="card mt-6 bg-gradient-to-r from-purple-50 to-blue-50 border-l-4 border-purple-500">
          <h2 className="text-xl font-bold text-gray-800 mb-3">🔍 Security Insights</h2>
          <div className="space-y-2 text-sm text-gray-700">
            {stats.counts.phishing > 0 && (
              <p>
                ⚠️ <strong>{stats.counts.phishing}</strong> phishing attempts detected! 
                The system has protected you from potential threats.
              </p>
            )}
            {stats.totalScans > 10 && (
              <p>
                ✓ You've performed <strong>{stats.totalScans}</strong> scans. 
                Stay vigilant and keep scanning suspicious URLs.
              </p>
            )}
            {parseFloat(stats.percentages.legit) > 70 && (
              <p>
                👍 Over {stats.percentages.legit}% of scanned URLs were legitimate. 
                Good job staying on safe websites!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
