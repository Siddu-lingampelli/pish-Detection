import React from 'react';
import { FaCheckCircle, FaExclamationTriangle, FaTimesCircle, FaExternalLinkAlt } from 'react-icons/fa';

const ScanResult = ({ result }) => {
  if (!result) return null;

  const getResultConfig = () => {
    switch (result.result) {
      case 'Legit':
        return {
          bgColor: 'bg-emerald-900/20',
          borderColor: 'border-emerald-600',
          textColor: 'text-emerald-400',
          icon: <FaCheckCircle className="text-4xl text-emerald-400" />,
          title: 'Safe',
          subtitle: 'This URL appears to be legitimate'
        };
      case 'Suspicious':
        return {
          bgColor: 'bg-yellow-900/20',
          borderColor: 'border-yellow-600',
          textColor: 'text-yellow-400',
          icon: <FaExclamationTriangle className="text-4xl text-yellow-400" />,
          title: 'Suspicious',
          subtitle: 'Exercise caution with this URL'
        };
      case 'Phishing':
        return {
          bgColor: 'bg-red-900/20',
          borderColor: 'border-red-600',
          textColor: 'text-red-400',
          icon: <FaTimesCircle className="text-4xl text-red-400" />,
          title: 'Phishing detected',
          subtitle: 'Do not visit this URL'
        };
      default:
        return {
          bgColor: 'bg-gray-900/20',
          borderColor: 'border-gray-600',
          textColor: 'text-gray-400',
          icon: <FaCheckCircle className="text-4xl text-gray-400" />,
          title: 'Analysis complete',
          subtitle: 'Scan finished successfully'
        };
    }
  };

  const config = getResultConfig();
  const confidenceScore = (result.confidence_score * 100).toFixed(0);

  return (
    <div className="space-y-4">
      {/* Main Result Card */}
      <div className={`${config.bgColor} border ${config.borderColor} rounded-lg p-8`}>
        <div className="flex items-start gap-6">
          <div className="flex-shrink-0">
            {config.icon}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className={`text-3xl font-bold ${config.textColor} mb-1`}>
              {config.title}
            </h3>
            <p className="text-gray-400 mb-6">{config.subtitle}</p>

            {/* URL */}
            <div className="mb-6">
              <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">Analyzed URL</p>
              <p className="text-sm text-white font-mono bg-black/50 px-4 py-3 rounded border border-gray-800 break-all">
                {result.url}
              </p>
            </div>

            {/* Confidence Score */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs uppercase tracking-wider text-gray-500">Confidence</span>
                <span className={`text-3xl font-bold tracking-tight ${config.textColor}`}>{confidenceScore}%</span>
              </div>
              <div className="w-full bg-gray-800/50 rounded-sm h-1.5 overflow-hidden">
                <div
                  className={`h-full transition-all duration-1000 ${
                    result.result === 'Legit'
                      ? 'bg-emerald-500'
                      : result.result === 'Suspicious'
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                  }`}
                  style={{ width: `${confidenceScore}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Technical Details */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* SSL Status */}
        <div className="bg-[#111111] border border-gray-800 rounded-lg p-6">
          <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">SSL Certificate</p>
          <p className="text-lg font-semibold text-white">
            {result.meta_data?.has_ssl ? 'Secured' : 'Not secured'}
          </p>
        </div>

        {/* Scan Duration */}
        <div className="bg-[#111111] border border-gray-800 rounded-lg p-6">
          <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">Scan duration</p>
          <p className="text-lg font-semibold text-white">{result.scan_duration}ms</p>
        </div>
      </div>

      {/* Risk Factors */}
      {result.meta_data?.risk_factors && result.meta_data.risk_factors.length > 0 && (
        <div className="bg-[#111111] border border-gray-800 rounded-lg p-6">
          <h4 className="text-sm font-semibold text-white mb-4">Risk factors</h4>
          <ul className="space-y-2">
            {result.meta_data.risk_factors.map((factor, index) => (
              <li key={index} className="flex items-start gap-3 text-sm text-gray-400">
                <span className="text-red-500 mt-1">•</span>
                <span>{factor}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Keywords */}
      {result.meta_data?.keywords && result.meta_data.keywords.length > 0 && (
        <div className="bg-[#111111] border border-gray-800 rounded-lg p-6">
          <h4 className="text-sm font-semibold text-white mb-4">Suspicious keywords</h4>
          <div className="flex flex-wrap gap-2">
            {result.meta_data.keywords.map((keyword, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-orange-900/30 border border-orange-800 text-orange-400 text-xs rounded-md"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Threat Types */}
      {result.meta_data?.threat_types && result.meta_data.threat_types.length > 0 && (
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-6">
          <h4 className="text-sm font-semibold text-red-400 mb-4">Identified threats</h4>
          <div className="flex flex-wrap gap-2">
            {result.meta_data.threat_types.map((threat, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-red-900/40 border border-red-700 text-red-300 text-xs font-medium rounded-md uppercase tracking-wider"
              >
                {threat}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* URLScan.io */}
      {result.meta_data?.urlscan && (
        <div className="bg-[#111111] border border-gray-800 rounded-lg p-6">
          <h4 className="text-sm font-semibold text-white mb-3">URLScan.io analysis</h4>
          <p className="text-sm text-gray-400 mb-4">{result.meta_data.urlscan.message}</p>
          {result.meta_data.urlscan.resultUrl && (
            <a
              href={result.meta_data.urlscan.resultUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-white hover:text-gray-300 transition-colors"
            >
              View detailed report
              <FaExternalLinkAlt className="text-xs" />
            </a>
          )}
        </div>
      )}

      {/* AI Explanation */}
      {result.ai_explanation && (
        <div className="bg-[#111111] border border-gray-800 rounded-lg p-6">
          <h4 className="text-sm font-semibold text-white mb-4">AI analysis</h4>
          <p className="text-sm text-gray-300 leading-relaxed mb-4">
            {result.ai_explanation.text}
          </p>

          {result.ai_explanation.safety_tips && result.ai_explanation.safety_tips.length > 0 && (
            <div className="border-t border-gray-800 pt-4 mt-4">
              <h5 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Safety recommendations
              </h5>
              <ul className="space-y-2">
                {result.ai_explanation.safety_tips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm text-gray-400">
                    <span className="text-white mt-1">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-gray-800">
            <p className="text-xs text-gray-500">{result.ai_explanation.generated_by}</p>
          </div>
        </div>
      )}

      {/* Timestamp */}
      <div className="text-center">
        <p className="text-xs text-gray-500">
          Analyzed on {new Date(result.created_at).toLocaleString()}
        </p>
      </div>
    </div>
  );
};

export default ScanResult;
