import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaShieldAlt, FaLink, FaHistory, FaChartBar, FaQrcode } from 'react-icons/fa';

const Navbar = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-[#0a0a0a] border-b border-gray-800 sticky top-0 z-50 backdrop-blur-sm bg-opacity-90">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center">
              <FaShieldAlt className="text-lg text-black" />
            </div>
            <div>
              <div className="text-base font-semibold text-white">PhishGuard</div>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="flex gap-2">
            <Link to="/scanner">
              <button
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive('/scanner')
                    ? 'bg-white text-black'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                URL Scanner
              </button>
            </Link>

            <Link to="/qr-scanner">
              <button
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive('/qr-scanner')
                    ? 'bg-white text-black'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                QR Scanner
              </button>
            </Link>

            <Link to="/history">
              <button
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive('/history')
                    ? 'bg-white text-black'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                History
              </button>
            </Link>

            <Link to="/analytics">
              <button
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive('/analytics')
                    ? 'bg-white text-black'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Analytics
              </button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
