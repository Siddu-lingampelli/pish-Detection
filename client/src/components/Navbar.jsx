import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaShieldAlt, FaLink, FaHistory, FaChartBar, FaQrcode } from 'react-icons/fa';
import { FiLogOut, FiUser } from 'react-icons/fi';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const isAuthenticated = !!localStorage.getItem('token');

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
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
            <Link to="/">
              <button
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive('/')
                    ? 'bg-white text-black'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Home
              </button>
            </Link>

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

            <Link to="/screenshot-analyzer">
              <button
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive('/screenshot-analyzer')
                    ? 'bg-white text-black'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                AI Screenshot
              </button>
            </Link>

            <Link to="/email-scanner">
              <button
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive('/email-scanner')
                    ? 'bg-white text-black'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Email Scanner
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

          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-2 px-3 py-2 bg-[#111111] border border-gray-800 rounded-md">
                  <FiUser className="text-gray-400" />
                  <span className="text-sm text-white">{user?.name || 'User'}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-400 hover:text-white rounded-md transition-colors"
                >
                  <FiLogOut />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <button className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white rounded-md transition-colors">
                    Login
                  </button>
                </Link>
                <Link to="/register">
                  <button className="px-4 py-2 text-sm font-medium bg-white text-black rounded-md hover:bg-gray-200 transition-colors">
                    Sign Up
                  </button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
