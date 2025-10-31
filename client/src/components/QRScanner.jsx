import { useState, useRef } from 'react';
import { FaQrcode, FaUpload, FaCamera, FaTimes, FaCheckCircle, FaExclamationTriangle, FaTimesCircle } from 'react-icons/fa';
import axios from 'axios';

const QRScanner = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

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

  const handleScanQR = async () => {
    if (!selectedFile) {
      setError('Please select a QR code image first');
      return;
    }

    setScanning(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('qrImage', selectedFile);

      console.log('📤 Uploading QR code image...');
      
      const response = await axios.post('http://localhost:5000/api/qr/scan', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('✅ QR scan response:', response.data);
      setResult(response.data);

    } catch (err) {
      console.error('❌ QR scan error:', err);
      setError(err.response?.data?.error || 'Failed to scan QR code. Please try again.');
    } finally {
      setScanning(false);
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
    switch (level?.toUpperCase()) {
      case 'HIGH': return 'text-red-400';
      case 'MEDIUM': return 'text-yellow-400';
      case 'LOW-MEDIUM': return 'text-orange-400';
      case 'LOW': return 'text-emerald-400';
      default: return 'text-gray-400';
    }
  };

  const getRiskBgColor = (level) => {
    switch (level?.toUpperCase()) {
      case 'HIGH': return 'bg-red-900/20 border-red-800';
      case 'MEDIUM': return 'bg-yellow-900/20 border-yellow-800';
      case 'LOW-MEDIUM': return 'bg-orange-900/20 border-orange-800';
      case 'LOW': return 'bg-emerald-900/20 border-emerald-800';
      default: return 'bg-gray-900/20 border-gray-800';
    }
  };

  const getRiskIcon = (level) => {
    switch (level?.toUpperCase()) {
      case 'HIGH': return <FaTimesCircle className="text-red-400" />;
      case 'MEDIUM': return <FaExclamationTriangle className="text-yellow-400" />;
      case 'LOW-MEDIUM': return <FaExclamationTriangle className="text-orange-400" />;
      case 'LOW': return <FaCheckCircle className="text-emerald-400" />;
      default: return <FaCheckCircle className="text-gray-400" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-[#111111] border border-gray-800 rounded-lg p-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <FaQrcode className="text-2xl text-white" />
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">QR Code Scanner</h2>
            <p className="text-gray-400 text-sm">Upload a QR code image to check for phishing threats</p>
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
                    alt="QR Code Preview"
                    className="max-w-xs max-h-64 mx-auto rounded-lg border border-gray-800"
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
                      Click to upload QR code image
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Supports JPG, PNG, GIF (Max 10MB)
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

            {/* Scan Button */}
            {previewUrl && (
              <button
                onClick={handleScanQR}
                disabled={scanning}
                className={`w-full mt-4 py-3 px-6 rounded-lg font-semibold transition-all ${
                  scanning
                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                    : 'bg-white text-black hover:bg-gray-200 active:scale-[0.98]'
                }`}
              >
                {scanning ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-500"></div>
                    Scanning QR Code...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <FaCamera /> Scan QR Code
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
            {/* Overall Risk Assessment */}
            <div className={`p-8 rounded-lg border ${getRiskBgColor(result.overallRisk?.level)}`}>
              <div className="flex items-start gap-6">
                <div className="text-4xl mt-1">{getRiskIcon(result.overallRisk?.level)}</div>
                <div className="flex-1">
                  <h3 className={`text-3xl font-bold tracking-tight ${getRiskColor(result.overallRisk?.level)}`}>
                    {result.overallRisk?.level}
                  </h3>
                  <p className="text-lg text-white font-medium mt-2">{result.overallRisk?.action}</p>
                  <p className="text-xs uppercase tracking-wider text-gray-500 mt-3">
                    Risk Score: {result.overallRisk?.score}/100
                  </p>
                </div>
              </div>
            </div>

            {/* QR Code Data */}
            <div className="bg-black/30 p-6 rounded-lg border border-gray-800">
              <h4 className="text-xs uppercase tracking-wider font-semibold text-gray-400 mb-4 flex items-center gap-2">
                <FaQrcode /> QR Code Contents
              </h4>
              <div className="space-y-3">
                <div>
                  <span className="text-xs uppercase tracking-wider text-gray-500">Type</span>
                  <span className="ml-3 text-sm font-mono text-white bg-black/50 px-3 py-1 rounded border border-gray-800">
                    {result.qrCode?.type}
                  </span>
                </div>
                <div>
                  <span className="text-xs uppercase tracking-wider text-gray-500 block mb-2">Data</span>
                  <div className="p-3 bg-black/50 rounded border border-gray-800 text-sm font-mono text-white break-all">
                    {result.qrCode?.data}
                  </div>
                </div>
              </div>
            </div>

            {/* UPI Payment Details */}
            {result.upiPayment && (
              <div className="bg-[#111111] p-6 rounded-lg border border-gray-800">
                <h4 className="text-xs uppercase tracking-wider font-semibold text-gray-400 mb-4">UPI Payment Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-xs uppercase tracking-wider text-gray-500 block mb-1">Payee</span>
                    <p className="font-semibold text-white">{result.upiPayment.payee}</p>
                  </div>
                  <div>
                    <span className="text-xs uppercase tracking-wider text-gray-500 block mb-1">Amount</span>
                    <p className="font-semibold text-emerald-400">
                      ₹{result.upiPayment.amount}
                    </p>
                  </div>
                  {result.upiPayment.note && (
                    <div className="col-span-2">
                      <span className="text-xs uppercase tracking-wider text-gray-500 block mb-1">Note</span>
                      <p className="font-medium text-white">{result.upiPayment.note}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Risk Factors */}
            {result.overallRisk?.factors?.length > 0 && (
              <div className="bg-[#111111] p-6 rounded-lg border border-gray-800">
                <h4 className="text-xs uppercase tracking-wider font-semibold text-gray-400 mb-4">Risk Factors Detected</h4>
                <ul className="space-y-2">
                  {result.overallRisk.factors.map((factor, index) => (
                    <li key={index} className="flex items-start gap-3 text-sm text-gray-300">
                      <span className="text-red-400 mt-1">•</span>
                      <span>{factor}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* AI Analysis */}
            {result.security?.aiAnalysis?.explanation && (
              <div className="bg-[#111111] p-6 rounded-lg border border-gray-800">
                <h4 className="text-xs uppercase tracking-wider font-semibold text-gray-400 mb-4">AI Analysis</h4>
                <p className="text-sm text-gray-300 leading-relaxed">{result.security.aiAnalysis.explanation}</p>
                {result.security.aiAnalysis.safetyTips?.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-800">
                    <p className="text-xs uppercase tracking-wider text-gray-500 mb-3">Safety Tips</p>
                    <ul className="space-y-2">
                      {result.security.aiAnalysis.safetyTips.map((tip, index) => (
                        <li key={index} className="flex items-start gap-3 text-sm text-gray-400">
                          <span className="text-white mt-1">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Extracted URL */}
            {result.extractedURL && (
              <div className="bg-black/30 p-6 rounded-lg border border-gray-800">
                <h4 className="text-xs uppercase tracking-wider font-semibold text-gray-400 mb-3">Extracted URL</h4>
                <p className="text-sm font-mono text-white bg-black/50 p-3 rounded border border-gray-800 break-all">
                  {result.extractedURL}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleReset}
                className="flex-1 py-3 px-4 bg-white hover:bg-gray-200 text-black rounded-lg font-semibold transition-all active:scale-[0.98]"
              >
                Scan Another QR Code
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
              <span>Upload a QR code image (from SMS, advertisement, payment request, etc.)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-white mt-0.5">•</span>
              <span>System decodes the QR code and extracts URLs or UPI payment details</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-white mt-0.5">•</span>
              <span>Analyzes for phishing patterns using multiple detection layers</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-white mt-0.5">•</span>
              <span>Provides AI-powered explanation and safety recommendations</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-white mt-0.5">•</span>
              <span>Works with UPI payments, regular URLs, and shortened links</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default QRScanner;
