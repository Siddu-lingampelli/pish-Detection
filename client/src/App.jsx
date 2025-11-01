import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import History from './pages/History';
import Analytics from './pages/Analytics';
import QRScanner from './components/QRScanner';
import ScreenshotAnalysis from './pages/ScreenshotAnalysis';
import EmailScanner from './components/EmailScanner';
import AIAssistant from './components/AIAssistant';
import './index.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#0a0a0a]">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* URL Scanner - Public (no login required) */}
          <Route path="/scanner" element={<><Navbar /><div className="container mx-auto px-6 py-12"><Home /></div></>} />
          
          {/* Protected Routes - Login Required */}
          <Route path="/qr-scanner" element={
            <ProtectedRoute>
              <Navbar /><div className="py-12"><QRScanner /></div>
            </ProtectedRoute>
          } />
          <Route path="/screenshot-analyzer" element={
            <ProtectedRoute>
              <Navbar /><div className="py-12"><ScreenshotAnalysis /></div>
            </ProtectedRoute>
          } />
          <Route path="/email-scanner" element={
            <ProtectedRoute>
              <Navbar /><EmailScanner />
            </ProtectedRoute>
          } />
          <Route path="/history" element={
            <ProtectedRoute>
              <Navbar /><div className="container mx-auto px-6 py-12"><History /></div>
            </ProtectedRoute>
          } />
          <Route path="/analytics" element={
            <ProtectedRoute>
              <Navbar /><div className="container mx-auto px-6 py-12"><Analytics /></div>
            </ProtectedRoute>
          } />
        </Routes>
        
        {/* Global AI Assistant - Available on all pages */}
        <AIAssistant />
      </div>
    </Router>
  );
}

export default App;
