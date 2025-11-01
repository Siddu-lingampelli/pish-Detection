import { useState } from 'react';
import { FiMail, FiAlertTriangle, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { BsShieldCheck } from 'react-icons/bs';
import axios from 'axios';

const EmailScanner = () => {
  const [emailContent, setEmailContent] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState(null);

  const handleAnalyze = async () => {
    if (!emailContent.trim()) {
      alert('Please paste the email content');
      return;
    }

    setIsAnalyzing(true);
    setResults(null);

    try {
      const response = await axios.post('http://localhost:5000/api/email/analyze', {
        emailContent,
        senderEmail,
        subject
      });

      setResults(response.data);
    } catch (error) {
      console.error('Email analysis error:', error);
      alert('Failed to analyze email. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleClear = () => {
    setEmailContent('');
    setSenderEmail('');
    setSubject('');
    setResults(null);
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'HIGH': return 'text-red-500';
      case 'MEDIUM': return 'text-yellow-500';
      default: return 'text-emerald-500';
    }
  };

  const getRiskBg = (level) => {
    switch (level) {
      case 'HIGH': return 'bg-red-500';
      case 'MEDIUM': return 'bg-yellow-500';
      default: return 'bg-emerald-500';
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-12">
      <div className="container mx-auto px-6 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <FiMail className="w-12 h-12 text-white" />
            <h1 className="text-4xl font-bold text-white">Email Phishing Scanner</h1>
          </div>
          <p className="text-gray-400 text-lg">
            Paste suspicious email content to analyze for phishing indicators
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="bg-[#111111] border border-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <FiMail className="w-5 h-5" />
              Email Details
            </h2>

            {/* Sender Email */}
            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-2">
                Sender Email (Optional)
              </label>
              <input
                type="email"
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
                placeholder="support@example.com"
                className="w-full bg-[#0a0a0a] border border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-gray-700"
              />
            </div>

            {/* Subject */}
            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-2">
                Subject Line (Optional)
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Urgent: Verify your account"
                className="w-full bg-[#0a0a0a] border border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-gray-700"
              />
            </div>

            {/* Email Content */}
            <div className="mb-6">
              <label className="block text-sm text-gray-400 mb-2">
                Email Content *
              </label>
              <textarea
                value={emailContent}
                onChange={(e) => setEmailContent(e.target.value)}
                placeholder="Paste the full email content here..."
                rows={12}
                className="w-full bg-[#0a0a0a] border border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-gray-700 resize-none font-mono text-sm"
              />
              <p className="text-xs text-gray-600 mt-2">
                Include all text, links, and formatting
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !emailContent.trim()}
                className="flex-1 bg-white text-black py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAnalyzing ? 'Analyzing...' : 'Analyze Email'}
              </button>
              <button
                onClick={handleClear}
                className="px-6 bg-[#1a1a1a] text-white py-3 rounded-lg font-semibold border border-gray-800 hover:bg-[#222222] transition-colors"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Results Section */}
          <div className="bg-[#111111] border border-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <BsShieldCheck className="w-5 h-5" />
              Analysis Results
            </h2>

            {!results && !isAnalyzing && (
              <div className="flex flex-col items-center justify-center h-[500px] text-center">
                <FiMail className="w-16 h-16 text-gray-700 mb-4" />
                <p className="text-gray-500">
                  Paste email content and click "Analyze Email" to see results
                </p>
              </div>
            )}

            {isAnalyzing && (
              <div className="flex flex-col items-center justify-center h-[500px]">
                <div className="w-12 h-12 border-4 border-gray-800 border-t-white rounded-full animate-spin mb-4"></div>
                <p className="text-gray-400">Analyzing email for threats...</p>
              </div>
            )}

            {results && (
              <div className="space-y-4">
                {/* Risk Score */}
                <div className={`p-4 rounded-lg border ${
                  results.riskLevel === 'HIGH' ? 'bg-red-500/10 border-red-500/30' :
                  results.riskLevel === 'MEDIUM' ? 'bg-yellow-500/10 border-yellow-500/30' :
                  'bg-emerald-500/10 border-emerald-500/30'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Risk Level</span>
                    <span className={`text-2xl font-bold ${getRiskColor(results.riskLevel)}`}>
                      {results.riskLevel}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Risk Score</span>
                    <span className="text-xl font-semibold text-white">
                      {results.riskScore}/100
                    </span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2 mt-3">
                    <div
                      className={`h-2 rounded-full ${getRiskBg(results.riskLevel)}`}
                      style={{ width: `${results.riskScore}%` }}
                    ></div>
                  </div>
                </div>

                {/* Threats Detected */}
                {results.threats && results.threats.length > 0 && (
                  <div className="bg-[#0a0a0a] border border-gray-800 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                      <FiAlertTriangle className="w-4 h-4 text-red-500" />
                      Threats Detected
                    </h3>
                    <ul className="space-y-2">
                      {results.threats.map((threat, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-400">
                          <FiXCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                          <span>{threat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Suspicious Keywords */}
                {results.suspiciousKeywords && results.suspiciousKeywords.length > 0 && (
                  <div className="bg-[#0a0a0a] border border-gray-800 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-white mb-3">
                      Suspicious Keywords
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {results.suspiciousKeywords.map((keyword, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-yellow-500/20 text-yellow-500 text-xs rounded-full border border-yellow-500/30"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Links Found */}
                {results.linksFound && results.linksFound.length > 0 && (
                  <div className="bg-[#0a0a0a] border border-gray-800 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-white mb-3">
                      Links Found
                    </h3>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {results.linksFound.map((link, idx) => (
                        <div key={idx} className="text-xs text-gray-400 break-all bg-[#111111] p-2 rounded border border-gray-800">
                          {link}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {results.recommendations && results.recommendations.length > 0 && (
                  <div className="bg-[#0a0a0a] border border-gray-800 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                      <FiCheckCircle className="w-4 h-4 text-emerald-500" />
                      Recommendations
                    </h3>
                    <ul className="space-y-2">
                      {results.recommendations.map((rec, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-400">
                          <span className="text-emerald-500 mt-0.5">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* AI Analysis */}
                {results.aiAnalysis && (
                  <div className="bg-[#0a0a0a] border border-gray-800 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-white mb-3">
                      AI Analysis
                    </h3>
                    <p className="text-sm text-gray-400 leading-relaxed whitespace-pre-wrap">
                      {results.aiAnalysis}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailScanner;
