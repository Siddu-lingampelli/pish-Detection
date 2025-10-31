import React from 'react';
import { Link } from 'react-router-dom';
import { FaShieldAlt, FaLink, FaQrcode, FaChartLine, FaBolt, FaCheckCircle, FaExclamationTriangle, FaRocket, FaGlobe, FaRobot } from 'react-icons/fa';

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          {/* Logo and Title */}
          <div className="flex items-center justify-center mb-6">
            <FaShieldAlt className="text-6xl text-blue-600 animate-pulse" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            PhishGuard
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-4">
            AI-Powered Real-Time Phishing Detection System
          </p>
          <p className="text-lg text-gray-500 mb-8">
            Protect yourself from phishing attacks with advanced 7-layer detection technology
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              to="/"
              className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold rounded-lg shadow-lg transition-all transform hover:scale-105"
            >
              <FaLink className="mr-2" />
              Scan URL Now
            </Link>
            <Link
              to="/qr-scanner"
              className="inline-flex items-center justify-center px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white text-lg font-semibold rounded-lg shadow-lg transition-all transform hover:scale-105"
            >
              <FaQrcode className="mr-2" />
              Scan QR Code
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mb-16">
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="text-3xl font-bold text-blue-600">7</div>
              <div className="text-sm text-gray-600">Detection Layers</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="text-3xl font-bold text-purple-600">42</div>
              <div className="text-sm text-gray-600">India Keywords</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="text-3xl font-bold text-green-600">4</div>
              <div className="text-sm text-gray-600">External APIs</div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="max-w-6xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose PhishGuard?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4 mx-auto">
                <FaBolt className="text-3xl text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">
                Real-Time Detection
              </h3>
              <p className="text-gray-600 text-center">
                Get instant results in under 2 seconds with our advanced multi-layer scanning technology
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4 mx-auto">
                <FaRobot className="text-3xl text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">
                AI-Powered Analysis
              </h3>
              <p className="text-gray-600 text-center">
                Mistral AI generates natural language explanations and personalized safety tips
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4 mx-auto">
                <FaQrcode className="text-3xl text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">
                QR Code Scanner
              </h3>
              <p className="text-gray-600 text-center">
                Upload and scan QR codes from SMS, payments, and advertisements for hidden threats
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4 mx-auto">
                <FaGlobe className="text-3xl text-yellow-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">
                India-Specific Protection
              </h3>
              <p className="text-gray-600 text-center">
                42 keywords targeting UPI, Paytm, PhonePe, banking, and Aadhaar-related scams
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4 mx-auto">
                <FaChartLine className="text-3xl text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">
                Analytics Dashboard
              </h3>
              <p className="text-gray-600 text-center">
                Track scanning history, view trends, and analyze threat patterns over time
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4 mx-auto">
                <FaRocket className="text-3xl text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">
                Multi-Engine Scanning
              </h3>
              <p className="text-gray-600 text-center">
                Powered by Google Safe Browsing, VirusTotal (90+ engines), and URLScan.io
              </p>
            </div>
          </div>
        </div>

        {/* Detection Layers */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            7-Layer Detection System
          </h2>
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="space-y-4">
              <div className="flex items-start">
                <FaCheckCircle className="text-green-500 mt-1 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900">Layer 1: URL Pattern Analysis</h4>
                  <p className="text-gray-600 text-sm">Analyzes URL structure, suspicious TLDs, and IP addresses</p>
                </div>
              </div>
              <div className="flex items-start">
                <FaCheckCircle className="text-green-500 mt-1 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900">Layer 2: Keyword Detection</h4>
                  <p className="text-gray-600 text-sm">Scans for 42 phishing keywords including India-specific terms</p>
                </div>
              </div>
              <div className="flex items-start">
                <FaCheckCircle className="text-green-500 mt-1 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900">Layer 3: SSL/HTTPS Validation</h4>
                  <p className="text-gray-600 text-sm">Checks for secure connections and valid certificates</p>
                </div>
              </div>
              <div className="flex items-start">
                <FaCheckCircle className="text-green-500 mt-1 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900">Layer 4: Google Safe Browsing</h4>
                  <p className="text-gray-600 text-sm">Checks against Google's threat database</p>
                </div>
              </div>
              <div className="flex items-start">
                <FaCheckCircle className="text-green-500 mt-1 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900">Layer 5: VirusTotal Multi-Engine</h4>
                  <p className="text-gray-600 text-sm">Scans with 90+ antivirus engines for comprehensive coverage</p>
                </div>
              </div>
              <div className="flex items-start">
                <FaCheckCircle className="text-green-500 mt-1 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900">Layer 6: URLScan.io Analysis</h4>
                  <p className="text-gray-600 text-sm">Website screenshots, SSL validation, and network analysis</p>
                </div>
              </div>
              <div className="flex items-start">
                <FaCheckCircle className="text-green-500 mt-1 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900">Layer 7: Mistral AI Explanation</h4>
                  <p className="text-gray-600 text-sm">Natural language explanations and personalized safety tips</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Use Cases */}
        <div className="max-w-6xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Perfect For
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 text-center">
              <div className="text-4xl mb-3">📱</div>
              <h4 className="font-bold text-gray-900 mb-2">SMS Phishing</h4>
              <p className="text-sm text-gray-600">Check suspicious links from text messages</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 text-center">
              <div className="text-4xl mb-3">💳</div>
              <h4 className="font-bold text-gray-900 mb-2">UPI Payments</h4>
              <p className="text-sm text-gray-600">Verify payment QR codes before scanning</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 text-center">
              <div className="text-4xl mb-3">📧</div>
              <h4 className="font-bold text-gray-900 mb-2">Email Links</h4>
              <p className="text-sm text-gray-600">Validate links from suspicious emails</p>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-6 text-center">
              <div className="text-4xl mb-3">🎁</div>
              <h4 className="font-bold text-gray-900 mb-2">Prize Scams</h4>
              <p className="text-sm text-gray-600">Check reward and prize claim links</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-4xl mx-auto text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-2xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">
            Stay Safe Online Today
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands protecting themselves from phishing attacks
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              <FaLink className="mr-2" />
              Start Scanning
            </Link>
            <Link
              to="/analytics"
              className="inline-flex items-center justify-center px-8 py-4 bg-transparent border-2 border-white text-white text-lg font-semibold rounded-lg hover:bg-white hover:text-blue-600 transition-all transform hover:scale-105"
            >
              <FaChartLine className="mr-2" />
              View Analytics
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-900 text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-4">
            <FaShieldAlt className="text-3xl text-blue-400 mr-2" />
            <span className="text-xl font-bold">PhishGuard</span>
          </div>
          <p className="text-gray-400 mb-4">
            AI-Powered Real-Time Phishing Detection System
          </p>
          <div className="flex justify-center gap-6 text-sm text-gray-500">
            <span>7-Layer Detection</span>
            <span>•</span>
            <span>42 India-Specific Keywords</span>
            <span>•</span>
            <span>4 External APIs</span>
          </div>
          <p className="text-gray-600 text-sm mt-4">
            © 2025 PhishGuard. Protecting India from phishing attacks.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Landing;
