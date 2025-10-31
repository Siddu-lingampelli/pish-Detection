import { useState, useRef } from 'react';
import { FaQrcode, FaUpload, FaCamera, FaTimes, FaCheckCircle, FaExclamationTriangle, FaTimesCircle, FaShieldAlt } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
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
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }

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
      
      const response = await axios.post('http://localhost:5000/api/qr/scan', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setResult(response.data);
    } catch (err) {
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
    const colors = {
      'HIGH': 'text-red-400',
      'MEDIUM': 'text-yellow-400',
      'LOW-MEDIUM': 'text-orange-400',
      'LOW': 'text-emerald-400'
    };
    return colors[level?.toUpperCase()] || 'text-gray-400';
  };

  const getRiskBgColor = (level) => {
    const colors = {
      'HIGH': 'from-red-500/20 to-rose-500/10 border-red-500/30',
      'MEDIUM': 'from-yellow-500/20 to-amber-500/10 border-yellow-500/30',
      'LOW-MEDIUM': 'from-orange-500/20 to-yellow-500/10 border-orange-500/30',
      'LOW': 'from-emerald-500/20 to-green-500/10 border-emerald-500/30'
    };
    return colors[level?.toUpperCase()] || 'from-gray-500/20 to-gray-500/10 border-gray-500/30';
  };

  const getRiskIcon = (level) => {
    const icons = {
      'HIGH': <FaTimesCircle className="text-red-400 text-5xl" />,
      'MEDIUM': <FaExclamationTriangle className="text-yellow-400 text-5xl" />,
      'LOW-MEDIUM': <FaExclamationTriangle className="text-orange-400 text-5xl" />,
      'LOW': <FaCheckCircle className="text-emerald-400 text-5xl" />
    };
    return icons[level?.toUpperCase()] || <FaCheckCircle className="text-gray-400 text-5xl" />;
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-4 rounded-2xl">
            <FaQrcode className="text-3xl text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">QR Code Analyzer</h2>
            <p className="text-blue-200 text-sm">Upload QR code for deep threat analysis</p>
          </div>
        </div>

        {/* Upload Section */}
        <AnimatePresence mode="wait">
          {!result && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div
                className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer ${
                  previewUrl 
                    ? 'border-cyan-400 bg-cyan-500/10' 
                    : 'border-white/20 hover:border-cyan-400/50 bg-white/5'
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                {previewUrl ? (
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="space-y-4"
                  >
                    <img
                      src={previewUrl}
                      alt="QR Code Preview"
                      className="max-w-xs max-h-64 mx-auto rounded-xl shadow-2xl border-2 border-cyan-400"
                    />
                    <p className="text-sm text-blue-200 font-medium">{selectedFile?.name}</p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReset();
                      }}
                      className="text-red-400 hover:text-red-300 text-sm flex items-center gap-2 mx-auto bg-red-500/20 px-4 py-2 rounded-lg"
                    >
                      <FaTimes /> Remove Image
                    </motion.button>
                  </motion.div>
                ) : (
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="space-y-6"
                  >
                    <FaUpload className="text-6xl text-cyan-400/50 mx-auto" />
                    <div>
                      <p className="text-xl font-semibold text-white mb-2">
                        Upload QR Code Image
                      </p>
                      <p className="text-sm text-blue-200">
                        Supports JPG, PNG, GIF • Maximum 10MB
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              {previewUrl && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={handleScanQR}
                  disabled={scanning}
                  whileHover={{ scale: scanning ? 1 : 1.02 }}
                  whileTap={{ scale: scanning ? 1 : 0.98 }}
                  className={`w-full mt-6 py-4 px-8 rounded-xl font-semibold text-white transition-all ${
                    scanning
                      ? 'bg-gray-600 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-600 to-pink-500 hover:shadow-lg hover:shadow-purple-500/50'
                  }`}
                >
                  {scanning ? (
                    <span className="flex items-center justify-center gap-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      Analyzing QR Code...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-3">
                      <FaCamera /> Scan QR Code
                    </span>
                  )}
                </motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl flex items-start gap-3"
            >
              <FaTimesCircle className="text-red-400 text-xl mt-0.5" />
              <div>
                <p className="font-semibold text-red-300">Analysis Failed</p>
                <p className="text-red-200 text-sm mt-1">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Section */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Overall Risk Assessment */}
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`relative bg-gradient-to-br ${getRiskBgColor(result.overallRisk?.level)} border-2 rounded-2xl p-8 overflow-hidden`}
              >
                <div className="absolute top-0 right-0 opacity-10">
                  <FaShieldAlt className="text-9xl" />
                </div>
                <div className="relative flex items-start gap-6">
                  <div className="flex-shrink-0">
                    {getRiskIcon(result.overallRisk?.level)}
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-3xl font-bold ${getRiskColor(result.overallRisk?.level)} mb-3`}>
                      {result.overallRisk?.level} RISK
                    </h3>
                    <p className="text-xl font-semibold text-white mb-2">
                      {result.overallRisk?.action}
                    </p>
                    <p className="text-blue-200">
                      Threat Score: <span className="font-bold">{result.overallRisk?.score}/100</span>
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* QR Code Data */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-6"
              >
                <h4 className="font-bold text-white mb-4 flex items-center gap-2 text-lg">
                  <FaQrcode className="text-cyan-400" /> Decoded Content
                </h4>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-semibold text-blue-300">Type</span>
                    <div className="mt-1 px-4 py-2 bg-cyan-500/20 border border-cyan-500/30 rounded-lg text-cyan-300 font-mono text-sm">
                      {result.qrCode?.type}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-blue-300">Data</span>
                    <div className="mt-1 p-4 bg-white/5 rounded-lg text-white font-mono text-sm break-all border border-white/10">
                      {result.qrCode?.data}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* UPI Payment Details */}
              {result.upiPayment && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-gradient-to-br from-blue-500/20 to-cyan-500/10 border border-blue-500/30 rounded-2xl p-6"
                >
                  <h4 className="font-bold text-blue-300 mb-4 text-lg">Payment Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-blue-200">Payee</span>
                      <p className="font-bold text-white text-lg">{result.upiPayment.payee}</p>
                    </div>
                    <div>
                      <span className="text-sm text-blue-200">Amount</span>
                      <p className="font-bold text-emerald-400 text-lg">₹{result.upiPayment.amount}</p>
                    </div>
                    {result.upiPayment.note && (
                      <div className="col-span-2">
                        <span className="text-sm text-blue-200">Note</span>
                        <p className="font-semibold text-white">{result.upiPayment.note}</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Risk Factors */}
              {result.overallRisk?.factors?.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-yellow-500/20 border border-yellow-500/30 rounded-2xl p-6"
                >
                  <h4 className="font-bold text-yellow-300 mb-4 text-lg">Detected Risk Factors</h4>
                  <ul className="space-y-2">
                    {result.overallRisk.factors.map((factor, index) => (
                      <li key={index} className="flex items-start gap-3 text-yellow-100">
                        <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></span>
                        <span>{factor}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}

              {/* AI Analysis */}
              {result.security?.aiAnalysis?.explanation && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-purple-500/20 border border-purple-500/30 rounded-2xl p-6"
                >
                  <h4 className="font-bold text-purple-300 mb-4 text-lg">AI Threat Assessment</h4>
                  <p className="text-blue-100 leading-relaxed mb-4">
                    {result.security.aiAnalysis.explanation}
                  </p>
                  {result.security.aiAnalysis.safetyTips?.length > 0 && (
                    <div>
                      <p className="text-sm font-bold text-purple-300 mb-2">Security Recommendations</p>
                      <ul className="space-y-2">
                        {result.security.aiAnalysis.safetyTips.map((tip, index) => (
                          <li key={index} className="flex items-start gap-3 text-blue-100">
                            <FaCheckCircle className="text-purple-400 mt-1 flex-shrink-0" />
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Action Button */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                onClick={handleReset}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold rounded-xl transition-all"
              >
                Scan Another QR Code
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info Section */}
        {!result && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8 p-6 bg-blue-500/10 border border-blue-500/20 rounded-2xl"
          >
            <h4 className="font-bold text-blue-300 mb-3 text-lg">Analysis Capabilities</h4>
            <ul className="space-y-2 text-blue-100 text-sm">
              <li className="flex items-start gap-3">
                <FaCheckCircle className="text-cyan-400 mt-0.5 flex-shrink-0" />
                <span>Decode QR codes from SMS, payments, and advertisements</span>
              </li>
              <li className="flex items-start gap-3">
                <FaCheckCircle className="text-cyan-400 mt-0.5 flex-shrink-0" />
                <span>Extract and analyze URLs and UPI payment information</span>
              </li>
              <li className="flex items-start gap-3">
                <FaCheckCircle className="text-cyan-400 mt-0.5 flex-shrink-0" />
                <span>Multi-layer threat detection with AI-powered analysis</span>
              </li>
              <li className="flex items-start gap-3">
                <FaCheckCircle className="text-cyan-400 mt-0.5 flex-shrink-0" />
                <span>Real-time security recommendations and safety tips</span>
              </li>
            </ul>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default QRScanner;
