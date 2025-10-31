import React from 'react';
import { FaCheckCircle, FaExclamationTriangle, FaTimesCircle, FaClock, FaShieldAlt, FaInfoCircle } from 'react-icons/fa';

const ScanResult = ({ result }) => {
  console.log('🎨 ScanResult component rendering with data:', result);
  
  if (!result) {
    console.log('⚠️ No result data provided to ScanResult');
    return null;
  }

  const getResultStyle = () => {
    switch (result.result) {
      case 'Legit':
        return {
          bg: 'bg-green-50',
          border: 'border-green-500',
          text: 'text-green-800',
          icon: <FaCheckCircle className="text-5xl text-green-500" />,
          title: 'Safe Website',
          message: 'This URL appears to be legitimate and safe to visit.',
        };
      case 'Suspicious':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-500',
          text: 'text-yellow-800',
          icon: <FaExclamationTriangle className="text-5xl text-yellow-500" />,
          title: 'Suspicious Website',
          message: 'This URL shows suspicious characteristics. Proceed with caution.',
        };
      case 'Phishing':
        return {
          bg: 'bg-red-50',
          border: 'border-red-500',
          text: 'text-red-800',
          icon: <FaTimesCircle className="text-5xl text-red-500" />,
          title: 'Phishing Detected!',
          message: 'This URL is highly likely to be a phishing attempt. Do NOT visit!',
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-500',
          text: 'text-gray-800',
          icon: <FaShieldAlt className="text-5xl text-gray-500" />,
          title: 'Analysis Complete',
          message: 'Scan completed successfully.',
        };
    }
  };

  const style = getResultStyle();
  const confidencePercentage = (result.confidence_score * 100).toFixed(1);

  return (
    <div className={`card ${style.bg} border-l-4 ${style.border} animate-fadeIn`}>
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">{style.icon}</div>

        <div className="flex-1">
          <h3 className={`text-2xl font-bold ${style.text} mb-2`}>
            {style.title}
          </h3>
          <p className={`${style.text} mb-4`}>{style.message}</p>

          {/* URL Display */}
          <div className="bg-white rounded-lg p-3 mb-4">
            <p className="text-sm text-gray-500 mb-1">Scanned URL:</p>
            <p className="text-sm font-mono text-gray-800 break-all">
              {result.url}
            </p>
          </div>

          {/* Confidence Score */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">
                Confidence Score
              </span>
              <span className="text-sm font-bold text-gray-800">
                {confidencePercentage}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-500 ${
                  result.result === 'Legit'
                    ? 'bg-green-500'
                    : result.result === 'Suspicious'
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                }`}
                style={{ width: `${confidencePercentage}%` }}
              ></div>
            </div>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-white rounded-lg p-3">
              <p className="text-xs text-gray-500">SSL/HTTPS</p>
              <p className="text-sm font-semibold text-gray-800">
                {result.meta_data?.has_ssl ? '✓ Secured' : '✗ Not Secured'}
              </p>
            </div>
            <div className="bg-white rounded-lg p-3">
              <p className="text-xs text-gray-500">Scan Duration</p>
              <p className="text-sm font-semibold text-gray-800 flex items-center">
                <FaClock className="mr-1" />
                {result.scan_duration}ms
              </p>
            </div>
          </div>

          {/* Risk Factors */}
          {result.meta_data?.risk_factors && result.meta_data.risk_factors.length > 0 && (
            <div className="bg-white rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                Risk Factors Detected:
              </h4>
              <ul className="space-y-1">
                {result.meta_data.risk_factors.map((factor, index) => (
                  <li key={index} className="text-sm text-gray-600 flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span>{factor}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Phishing Keywords */}
          {result.meta_data?.keywords && result.meta_data.keywords.length > 0 && (
            <div className="bg-white rounded-lg p-4 mt-3">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                Suspicious Keywords Found:
              </h4>
              <div className="flex flex-wrap gap-2">
                {result.meta_data.keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Threat Types */}
          {result.meta_data?.threat_types && result.meta_data.threat_types.length > 0 && (
            <div className="bg-red-100 rounded-lg p-4 mt-3">
              <h4 className="text-sm font-semibold text-red-800 mb-2">
                ⚠️ Threat Types Identified:
              </h4>
              <div className="flex flex-wrap gap-2">
                {result.meta_data.threat_types.map((threat, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-red-200 text-red-900 text-xs rounded-full font-semibold"
                  >
                    {threat}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* URLScan.io Section */}
          {result.meta_data?.urlscan && (
            <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg">
              <h4 className="text-sm font-semibold text-blue-800 mb-2 flex items-center">
                <FaInfoCircle className="mr-2" />
                URLScan.io Analysis
              </h4>
              <p className="text-sm text-blue-700 mb-3">
                {result.meta_data.urlscan.message}
              </p>
              {result.meta_data.urlscan.resultUrl && (
                <a
                  href={result.meta_data.urlscan.resultUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-md transition-colors"
                >
                  View Detailed Report →
                </a>
              )}
              <p className="text-xs text-blue-600 mt-2">
                Scan ID: {result.meta_data.urlscan.scanId}
              </p>
            </div>
          )}

          {/* AI Explanation Section */}
          {result.ai_explanation && (
            <div className={`mt-6 p-4 rounded-lg border-l-4 ${
              result.result === 'Legit' 
                ? 'bg-green-50 border-green-500' 
                : result.result === 'Suspicious'
                ? 'bg-yellow-50 border-yellow-500'
                : 'bg-red-50 border-red-500'
            }`}>
              <h4 className={`text-sm font-semibold mb-2 flex items-center ${
                result.result === 'Legit' 
                  ? 'text-green-800' 
                  : result.result === 'Suspicious'
                  ? 'text-yellow-800'
                  : 'text-red-800'
              }`}>
                <FaInfoCircle className="mr-2" />
                AI Analysis
              </h4>
              <p className={`text-sm mb-3 ${
                result.result === 'Legit' 
                  ? 'text-green-700' 
                  : result.result === 'Suspicious'
                  ? 'text-yellow-700'
                  : 'text-red-700'
              }`}>
                {result.ai_explanation.text}
              </p>

              {/* Safety Tips */}
              {result.ai_explanation.safety_tips && result.ai_explanation.safety_tips.length > 0 && (
                <div className="mt-3">
                  <h5 className={`text-xs font-semibold mb-2 ${
                    result.result === 'Legit' 
                      ? 'text-green-800' 
                      : result.result === 'Suspicious'
                      ? 'text-yellow-800'
                      : 'text-red-800'
                  }`}>
                    Safety Tips:
                  </h5>
                  <ul className={`text-xs space-y-1 ${
                    result.result === 'Legit' 
                      ? 'text-green-700' 
                      : result.result === 'Suspicious'
                      ? 'text-yellow-700'
                      : 'text-red-700'
                  }`}>
                    {result.ai_explanation.safety_tips.map((tip, index) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* AI Attribution */}
              <div className="mt-3 text-xs text-gray-500 italic">
                {result.ai_explanation.generated_by}
              </div>
            </div>
          )}

          {/* Timestamp */}
          <div className="mt-4 text-xs text-gray-500">
            Scanned at: {new Date(result.created_at).toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScanResult;
