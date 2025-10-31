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
      case 'HIGH': return 'text-red-600';
      case 'MEDIUM': return 'text-yellow-600';
      case 'LOW-MEDIUM': return 'text-orange-500';
      case 'LOW': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getRiskBgColor = (level) => {
    switch (level?.toUpperCase()) {
      case 'HIGH': return 'bg-red-50 border-red-200';
      case 'MEDIUM': return 'bg-yellow-50 border-yellow-200';
      case 'LOW-MEDIUM': return 'bg-orange-50 border-orange-200';
      case 'LOW': return 'bg-green-50 border-green-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const getRiskIcon = (level) => {
    switch (level?.toUpperCase()) {
      case 'HIGH': return <FaTimesCircle className="text-red-600" />;
      case 'MEDIUM': return <FaExclamationTriangle className="text-yellow-600" />;
      case 'LOW-MEDIUM': return <FaExclamationTriangle className="text-orange-500" />;
      case 'LOW': return <FaCheckCircle className="text-green-600" />;
      default: return <FaCheckCircle className="text-gray-600" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <FaQrcode className="text-3xl text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-800">QR Code Scanner</h2>
            <p className="text-gray-600 text-sm">Upload a QR code image to check for phishing threats</p>
          </div>
        </div>

        {/* Upload Section */}
        {!result && (
          <div className="mb-6">
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center ${
                previewUrl ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
              } transition-colors cursor-pointer`}
              onClick={() => fileInputRef.current?.click()}
            >
              {previewUrl ? (
                <div className="space-y-4">
                  <img
                    src={previewUrl}
                    alt="QR Code Preview"
                    className="max-w-xs max-h-64 mx-auto rounded-lg shadow-md"
                  />
                  <p className="text-sm text-gray-600">{selectedFile?.name}</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReset();
                    }}
                    className="text-red-500 hover:text-red-700 text-sm flex items-center gap-2 mx-auto"
                  >
                    <FaTimes /> Remove
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <FaUpload className="text-5xl text-gray-400 mx-auto" />
                  <div>
                    <p className="text-lg font-medium text-gray-700">
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
                className={`w-full mt-4 py-3 px-6 rounded-lg font-semibold text-white transition-all ${
                  scanning
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
                }`}
              >
                {scanning ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
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
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <FaTimesCircle className="text-red-600 mt-1" />
            <div>
              <p className="font-semibold text-red-800">Error</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Results Section */}
        {result && (
          <div className="space-y-6">
            {/* Overall Risk Assessment */}
            <div className={`p-6 rounded-lg border-2 ${getRiskBgColor(result.overallRisk?.level)}`}>
              <div className="flex items-start gap-4">
                <div className="text-4xl mt-1">{getRiskIcon(result.overallRisk?.level)}</div>
                <div className="flex-1">
                  <h3 className={`text-2xl font-bold ${getRiskColor(result.overallRisk?.level)}`}>
                    {result.overallRisk?.level} RISK
                  </h3>
                  <p className="text-lg font-semibold mt-2">{result.overallRisk?.action}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Risk Score: {result.overallRisk?.score}/100
                  </p>
                </div>
              </div>
            </div>

            {/* QR Code Data */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <FaQrcode /> QR Code Contents
              </h4>
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-gray-600">Type:</span>
                  <span className="ml-2 text-sm font-mono bg-white px-2 py-1 rounded">
                    {result.qrCode?.type}
                  </span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Data:</span>
                  <div className="mt-1 p-2 bg-white rounded text-sm font-mono break-all">
                    {result.qrCode?.data}
                  </div>
                </div>
              </div>
            </div>

            {/* UPI Payment Details */}
            {result.upiPayment && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-3">💳 UPI Payment Details</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Payee:</span>
                    <p className="font-semibold">{result.upiPayment.payee}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Amount:</span>
                    <p className="font-semibold text-green-600">
                      ₹{result.upiPayment.amount}
                    </p>
                  </div>
                  {result.upiPayment.note && (
                    <div className="col-span-2">
                      <span className="text-gray-600">Note:</span>
                      <p className="font-medium">{result.upiPayment.note}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Risk Factors */}
            {result.overallRisk?.factors?.length > 0 && (
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Risk Factors Detected</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {result.overallRisk.factors.map((factor, index) => (
                    <li key={index} className="text-gray-700">{factor}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* AI Analysis */}
            {result.security?.aiAnalysis?.explanation && (
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h4 className="font-semibold text-purple-800 mb-2">🤖 AI Analysis</h4>
                <p className="text-sm text-gray-700">{result.security.aiAnalysis.explanation}</p>
                {result.security.aiAnalysis.safetyTips?.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-semibold text-purple-800 mb-1">Safety Tips:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                      {result.security.aiAnalysis.safetyTips.map((tip, index) => (
                        <li key={index}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Extracted URL */}
            {result.extractedURL && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-2">🔗 Extracted URL</h4>
                <p className="text-sm font-mono bg-white p-2 rounded break-all">
                  {result.extractedURL}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleReset}
                className="flex-1 py-2 px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-colors"
              >
                Scan Another QR Code
              </button>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">ℹ️ How it works</h4>
          <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
            <li>Upload a QR code image (from SMS, advertisement, payment request, etc.)</li>
            <li>System decodes the QR code and extracts URLs or UPI payment details</li>
            <li>Analyzes for phishing patterns using multiple detection layers</li>
            <li>Provides AI-powered explanation and safety recommendations</li>
            <li>Works with UPI payments, regular URLs, and shortened links</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default QRScanner;
