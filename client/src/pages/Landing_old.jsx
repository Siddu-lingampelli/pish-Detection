import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaShieldAlt, FaLink, FaQrcode, FaChartLine, FaBolt, FaCheckCircle, FaRocket, FaGlobe, FaBrain, FaLock, FaEye, FaNetworkWired } from 'react-icons/fa';

const Landing = () => {
  return (
    <div className="min-h-screen bg-[#0a0a0a] relative overflow-hidden">
      {/* Subtle grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1a1a1a_1px,transparent_1px),linear-gradient(to_bottom,#1a1a1a_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
      
      {/* Hero Section */}
      <div className="relative z-10 container mx-auto px-6 py-24">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-6xl mx-auto"
        >
          {/* Logo */}
          <div className="flex items-center gap-4 mb-12">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
              <FaShieldAlt className="text-2xl text-black" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-white tracking-tight">PhishGuard</h1>
              <p className="text-sm text-gray-500">Security Intelligence Platform</p>
            </div>
          </div>

          {/* Main heading */}
          <h2 className="text-6xl md:text-7xl font-bold text-white mb-6 tracking-tight leading-[1.1]">
            Enterprise-grade<br />threat detection
          </h2>
          
          <p className="text-xl text-gray-400 mb-12 max-w-2xl leading-relaxed">
            Seven-layer security architecture powered by advanced threat intelligence. 
            Real-time analysis of URLs and QR codes with institutional-grade accuracy.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4 mb-20">
            <Link to="/scanner">
              <motion.button
                whileHover={{ backgroundColor: '#ffffff' }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 bg-white text-black text-base font-medium rounded-lg transition-colors"
              >
                Start analysis
              </motion.button>
            </Link>
            
            <Link to="/qr-scanner">
              <motion.button
                whileHover={{ borderColor: '#ffffff' }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 bg-transparent border-2 border-gray-700 text-white text-base font-medium rounded-lg transition-colors"
              >
                Scan QR code
              </motion.button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl border-t border-gray-800 pt-8">
            <div>
              <div className="text-4xl font-bold text-white mb-1">7</div>
              <div className="text-sm text-gray-500 uppercase tracking-wider">Security layers</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-1">42</div>
              <div className="text-sm text-gray-500 uppercase tracking-wider">Threat indicators</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-1">4</div>
              <div className="text-sm text-gray-500 uppercase tracking-wider">API integrations</div>
            </div>
          </div>
        </motion.div>


        {/* Features Section */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="relative z-10 container mx-auto px-6 py-32"
        >
          <div className="max-w-6xl mx-auto">
            <h3 className="text-sm uppercase tracking-wider text-gray-500 mb-4">Capabilities</h3>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-20 tracking-tight">
              Advanced security architecture
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: "Real-time analysis",
                  desc: "Sub-second threat detection with comprehensive security scoring and instant verdict delivery."
                },
                {
                  title: "Neural intelligence",
                  desc: "Advanced AI providing natural language threat explanations and actionable security insights."
                },
                {
                  title: "QR code intelligence",
                  desc: "Deep analysis of embedded QR codes from payment requests and digital advertisements."
                },
                {
                  title: "Regional protection",
                  desc: "Specialized algorithms targeting region-specific phishing campaigns and attack vectors."
                },
                {
                  title: "Multi-engine scanning",
                  desc: "Integrated threat intelligence from Google Safe Browsing, VirusTotal, and URLScan.io."
                },
                {
                  title: "Intelligence dashboard",
                  desc: "Advanced analytics with threat pattern visualization and historical trend analysis."
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  viewport={{ once: true }}
                  className="border-t border-gray-800 pt-6"
                >
                  <h4 className="text-xl font-semibold text-white mb-3">{feature.title}</h4>
                  <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>


        {/* Security Layers */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="relative z-10 container mx-auto px-6 py-32 border-t border-gray-800"
        >
          <div className="max-w-4xl mx-auto">
            <h3 className="text-sm uppercase tracking-wider text-gray-500 mb-4">Security protocol</h3>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-16 tracking-tight">
              Seven-layer detection system
            </h2>

            <div className="space-y-12">
              {[
                { num: "01", title: "URL pattern analysis", desc: "Heuristic analysis of URL structure, suspicious TLDs, and IP-based addresses" },
                { num: "02", title: "Keyword intelligence", desc: "Deep scan for phishing indicators including regional payment systems" },
                { num: "03", title: "SSL validation", desc: "Cryptographic certificate verification and secure connection analysis" },
                { num: "04", title: "Google Safe Browsing", desc: "Real-time lookup against Google's global threat intelligence database" },
                { num: "05", title: "VirusTotal scanning", desc: "Aggregate scanning across 90+ antivirus engines" },
                { num: "06", title: "URLScan.io analysis", desc: "Visual rendering, network traffic inspection, and SSL validation" },
                { num: "07", title: "AI assessment", desc: "Natural language processing for threat explanation and recommendations" }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.5 }}
                  viewport={{ once: true }}
                  className="grid md:grid-cols-12 gap-6 items-start"
                >
                  <div className="md:col-span-2">
                    <span className="text-4xl font-bold text-gray-800">{item.num}</span>
                  </div>
                  <div className="md:col-span-10 border-t border-gray-800 pt-4">
                    <h4 className="text-xl font-semibold text-white mb-2">{item.title}</h4>
                    <p className="text-gray-400">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>



        {/* CTA Section */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="relative z-10 container mx-auto px-6 py-32 border-t border-gray-800"
        >
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
              Deploy enterprise security
            </h2>
            <p className="text-xl text-gray-400 mb-12">
              Start protecting your organization with advanced threat intelligence
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/scanner">
                <motion.button
                  whileHover={{ backgroundColor: '#ffffff' }}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 py-4 bg-white text-black text-base font-medium rounded-lg transition-colors"
                >
                  Start analysis
                </motion.button>
              </Link>
              <Link to="/analytics">
                <motion.button
                  whileHover={{ borderColor: '#ffffff' }}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 py-4 bg-transparent border-2 border-gray-700 text-white text-base font-medium rounded-lg transition-colors"
                >
                  View dashboard
                </motion.button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="relative z-10 border-t border-gray-800 py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center">
                <FaShieldAlt className="text-lg text-black" />
              </div>
              <div>
                <div className="text-base font-semibold text-white">PhishGuard</div>
                <div className="text-xs text-gray-500">© 2025 All rights reserved</div>
              </div>
            </div>
            <div className="flex items-center gap-8 text-sm text-gray-500">
              <span>7-layer protection</span>
              <span>Real-time intelligence</span>
              <span>AI-powered</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
        {/* CTA Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="relative z-10 max-w-5xl mx-auto px-4 py-24"
        >
          <div className="relative bg-gradient-to-br from-blue-600 via-cyan-500 to-blue-700 rounded-[3rem] shadow-2xl overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtNi42MjcgMC0xMiA1LjM3My0xMiAxMnM1LjM3MyAxMiAxMiAxMiAxMi01LjM3MyAxMi0xMi01LjM3My0xMi0xMi0xMnoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIuNSIgb3BhY2l0eT0iLjEiLz48L2c+PC9zdmc+')] opacity-30"></div>
            <div className="relative px-8 py-16 md:px-16 text-center">
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                viewport={{ once: true }}
                className="text-4xl md:text-5xl font-bold text-white mb-6"
              >
                Deploy Enterprise Security
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                viewport={{ once: true }}
                className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed"
              >
                Start protecting your organization with advanced threat intelligence
              </motion.p>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                viewport={{ once: true }}
                className="flex flex-col sm:flex-row gap-6 justify-center"
              >
                <Link to="/scanner">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-10 py-5 bg-white text-blue-600 text-lg font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all"
                  >
                    <div className="flex items-center space-x-3">
                      <FaRocket className="text-xl" />
                      <span>Start Analysis</span>
                    </div>
                  </motion.button>
                </Link>
                <Link to="/analytics">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-10 py-5 bg-transparent border-2 border-white text-white text-lg font-bold rounded-2xl hover:bg-white/10 transition-all"
                  >
                    <div className="flex items-center space-x-3">
                      <FaChartLine className="text-xl" />
                      <span>View Dashboard</span>
                    </div>
                  </motion.button>
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="relative z-10 bg-black/30 backdrop-blur-md border-t border-white/10 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-6 md:mb-0">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-400 p-3 rounded-xl">
                <FaShieldAlt className="text-2xl text-white" />
              </div>
              <div>
                <div className="text-xl font-bold text-white">PhishGuard</div>
                <div className="text-sm text-blue-200">Enterprise Security Platform</div>
              </div>
            </div>
            <div className="flex items-center space-x-8 text-sm text-blue-200">
              <div className="flex items-center space-x-2">
                <FaLock className="text-cyan-400" />
                <span>7-Layer Protection</span>
              </div>
              <div className="flex items-center space-x-2">
                <FaEye className="text-cyan-400" />
                <span>Real-Time Intelligence</span>
              </div>
              <div className="flex items-center space-x-2">
                <FaBrain className="text-cyan-400" />
                <span>AI-Powered</span>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-white/10 text-center text-sm text-blue-300">
            <p>© 2025 PhishGuard. Advanced Threat Detection Platform.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
