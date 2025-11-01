import { useState, useRef, useEffect } from 'react';
import { FaImage, FaUpload, FaCamera, FaTimes, FaCheckCircle, FaExclamationTriangle, FaTimesCircle, FaSpinner } from 'react-icons/fa';
import axios from 'axios';

const ScreenshotAnalyzer = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  // Cleanup object URL to prevent memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }

      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }

      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
      setResult(null);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError('Please select a screenshot first');
      return;
    }

    setAnalyzing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('screenshot', selectedFile);

      console.log('📤 Uploading screenshot for analysis...');
      
      const response = await axios.post('http://localhost:5000/api/screenshot/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('✅ Screenshot analysis response:', response.data);
      setResult(response.data.data);

    } catch (err) {
      console.error('❌ Screenshot analysis error:', err);
      setError(err.response?.data?.error || 'Failed to analyze screenshot. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'HIGH': return 'text-red-400';
      case 'MEDIUM': return 'text-yellow-400';
      case 'LOW': return 'text-emerald-400';
      default: return 'text-gray-400';
    }
  };

  const getRiskBgColor = (level) => {
    switch (level) {
      case 'HIGH': return 'bg-red-900/20 border-red-800';
      case 'MEDIUM': return 'bg-yellow-900/20 border-yellow-800';
      case 'LOW': return 'bg-emerald-900/20 border-emerald-800';
      default: return 'bg-gray-900/20 border-gray-800';
    }
  };

  const getRiskIcon = (level) => {
    switch (level) {
      case 'HIGH': return <FaTimesCircle className="text-red-400" />;
      case 'MEDIUM': return <FaExclamationTriangle className="text-yellow-400" />;
      case 'LOW': return <FaCheckCircle className="text-emerald-400" />;
      default: return <FaCheckCircle className="text-gray-400" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-[#111111] border border-gray-800 rounded-lg p-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <FaImage className="text-2xl text-white" />
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">AI Screenshot Analyzer</h2>
            <p className="text-gray-400 text-sm">Detect fake login pages and phishing attempts from screenshots</p>
          </div>
        </div>

        {/* Upload Section */}
        {!result && (
          <div className="mb-6">
            <div
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-all cursor-pointer ${
                previewUrl 
                  ? 'border-gray-700 bg-black/30' 
                  : 'border-gray-800 hover:border-gray-700 bg-black/20'
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              {previewUrl ? (
                <div className="space-y-4">
                  <img
                    src={previewUrl}
                    alt="Screenshot Preview"
                    className="max-w-full max-h-96 mx-auto rounded-lg border border-gray-800"
                  />
                  <p className="text-sm text-gray-400 font-mono">{selectedFile?.name}</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReset();
                    }}
                    className="text-red-400 hover:text-red-300 text-sm flex items-center gap-2 mx-auto transition-colors"
                  >
                    <FaTimes /> Remove
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <FaUpload className="text-5xl text-gray-600 mx-auto" />
                  <div>
                    <p className="text-lg font-medium text-white">
                      Click to upload screenshot
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      JPG, PNG, GIF - Max 10MB
                    </p>
                  </div>
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Analyze Button */}
            {previewUrl && (
              <button
                onClick={handleAnalyze}
                disabled={analyzing}
                className={`w-full mt-4 py-3 px-6 rounded-lg font-semibold transition-all ${
                  analyzing
                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                    : 'bg-white text-black hover:bg-gray-200 active:scale-[0.98]'
                }`}
              >
                {analyzing ? (
                  <span className="flex items-center justify-center gap-2">
                    <FaSpinner className="animate-spin" />
                    Analyzing Screenshot...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <FaCamera /> Analyze Screenshot
                  </span>
                )}
              </button>
            )}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-800 rounded-lg flex items-start gap-3">
            <FaTimesCircle className="text-red-400 mt-1" />
            <div>
              <p className="font-semibold text-red-400">Error</p>
              <p className="text-red-300/80 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Results Section */}
        {result && (
          <div className="space-y-4">
            {/* Screenshot Preview */}
            {previewUrl && (
              <div className="bg-black/30 p-4 rounded-lg border border-gray-800">
                <img
                  src={previewUrl}
                  alt="Analyzed Screenshot"
                  className="max-w-full max-h-64 mx-auto rounded border border-gray-700"
                />
              </div>
            )}

            {/* Overall Risk Assessment */}
            <div className={`p-8 rounded-lg border ${getRiskBgColor(result.analysis.riskLevel)}`}>
              <div className="flex items-start gap-6">
                <div className="text-4xl mt-1">{getRiskIcon(result.analysis.riskLevel)}</div>
                <div className="flex-1">
                  <h3 className={`text-3xl font-bold tracking-tight ${getRiskColor(result.analysis.riskLevel)}`}>
                    {result.analysis.riskLevel} RISK
                  </h3>
                  <p className="text-lg text-white font-medium mt-2">
                    {result.analysis.hasLoginForm ? 'Login form detected in screenshot' : 'No obvious login form detected'}
                  </p>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-gray-500">Risk Score</p>
                      <p className={`text-2xl font-bold ${getRiskColor(result.analysis.riskLevel)}`}>
                        {result.analysis.riskScore}/100
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-gray-500">Confidence</p>
                      <p className="text-2xl font-bold text-white">
                        {(result.analysis.confidence * 100).toFixed(0)}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Suspicious Elements */}
            {result.analysis.suspiciousElements.length > 0 && (
              <div className="bg-[#111111] p-6 rounded-lg border border-gray-800">
                <h4 className="text-xs uppercase tracking-wider font-semibold text-gray-400 mb-4">Suspicious Elements Detected</h4>
                <ul className="space-y-2">
                  {result.analysis.suspiciousElements.map((element, index) => (
                    <li key={index} className="flex items-start gap-3 text-sm text-gray-300">
                      <span className="text-red-400 mt-1">•</span>
                      <span>{element}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Text Analysis */}
            {result.analysis.textAnalysis.suspiciousKeywords.length > 0 && (
              <div className="bg-[#111111] p-6 rounded-lg border border-gray-800">
                <h4 className="text-xs uppercase tracking-wider font-semibold text-gray-400 mb-4">Suspicious Keywords Found</h4>
                <div className="flex flex-wrap gap-2">
                  {result.analysis.textAnalysis.suspiciousKeywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-yellow-900/30 border border-yellow-800 text-yellow-400 text-xs rounded"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Brand Impersonation */}
            {result.analysis.brandImpersonation && (
              <div className={`p-6 rounded-lg border ${
                result.analysis.brandImpersonation.detected 
                  ? 'bg-red-900/20 border-red-800' 
                  : 'bg-[#111111] border-gray-800'
              }`}>
                <h4 className="text-xs uppercase tracking-wider font-semibold text-gray-400 mb-3">Brand Detection</h4>
                <p className="text-sm text-gray-300 mb-2">{result.analysis.brandImpersonation.reason}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {result.analysis.brandImpersonation.brands.map((brand, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-white/10 border border-gray-700 text-white text-xs rounded capitalize"
                    >
                      {brand}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {result.analysis.recommendations.length > 0 && (
              <div className="bg-[#111111] p-6 rounded-lg border border-gray-800">
                <h4 className="text-xs uppercase tracking-wider font-semibold text-gray-400 mb-4">Safety Recommendations</h4>
                <ul className="space-y-2">
                  {result.analysis.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-3 text-sm text-gray-400">
                      <span className="text-white mt-1">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Extracted Text Preview */}
            {result.analysis.extractedText && (
              <details className="bg-black/30 p-6 rounded-lg border border-gray-800">
                <summary className="cursor-pointer text-xs uppercase tracking-wider font-semibold text-gray-400 hover:text-white transition">
                  View Extracted Text (OCR)
                </summary>
                <div className="mt-4 p-4 bg-black/50 rounded border border-gray-800 max-h-64 overflow-y-auto">
                  <pre className="text-xs text-gray-400 whitespace-pre-wrap font-mono">
                    {result.analysis.extractedText || 'No text extracted'}
                  </pre>
                </div>
              </details>
            )}

            {/* Action Button */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleReset}
                className="flex-1 py-3 px-4 bg-white hover:bg-gray-200 text-black rounded-lg font-semibold transition-all active:scale-[0.98]"
              >
                Analyze Another Screenshot
              </button>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-8 p-6 bg-black/30 border border-gray-800 rounded-lg">
          <h4 className="text-xs uppercase tracking-wider font-semibold text-gray-400 mb-3">How it works</h4>
          <ul className="text-sm text-gray-400 space-y-2">
            <li className="flex items-start gap-3">
              <span className="text-white mt-0.5">•</span>
              <span>Upload a screenshot of a suspicious website or login page</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-white mt-0.5">•</span>
              <span>AI extracts text using OCR and analyzes visual elements</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-white mt-0.5">•</span>
              <span>Detects fake login forms, brand impersonation, and phishing patterns</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-white mt-0.5">•</span>
              <span>Identifies urgency tactics and suspicious keywords</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-white mt-0.5">•</span>
              <span>Provides risk score and safety recommendations</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ScreenshotAnalyzer;
