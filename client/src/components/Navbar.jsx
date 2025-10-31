import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaShieldAlt, FaHome, FaHistory, FaChartBar, FaQrcode } from 'react-icons/fa';

const Navbar = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <FaShieldAlt className="text-3xl text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-800">PhishGuard</h1>
              <p className="text-xs text-gray-500">AI-Powered Protection</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="flex space-x-6">
            <Link
              to="/scanner"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition ${
                isActive('/scanner')
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <FaHome />
              <span className="font-medium">URL Scanner</span>
            </Link>

            <Link
              to="/qr-scanner"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition ${
                isActive('/qr-scanner')
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <FaQrcode />
              <span className="font-medium">QR Scanner</span>
            </Link>

            <Link
              to="/history"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition ${
                isActive('/history')
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <FaHistory />
              <span className="font-medium">History</span>
            </Link>

            <Link
              to="/analytics"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition ${
                isActive('/analytics')
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <FaChartBar />
              <span className="font-medium">Analytics</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
