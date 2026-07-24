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
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/scanner" element={<><Navbar /><Home /></>} />

        <Route path="/qr-scanner" element={
          <ProtectedRoute><><Navbar /><QRScanner /></></ProtectedRoute>
        } />
        <Route path="/screenshot-analyzer" element={
          <ProtectedRoute><><Navbar /><ScreenshotAnalysis /></></ProtectedRoute>
        } />
        <Route path="/email-scanner" element={
          <ProtectedRoute><><Navbar /><EmailScanner /></></ProtectedRoute>
        } />
        <Route path="/history" element={
          <ProtectedRoute><><Navbar /><History /></></ProtectedRoute>
        } />
        <Route path="/analytics" element={
          <ProtectedRoute><><Navbar /><Analytics /></></ProtectedRoute>
        } />
      </Routes>
      <AIAssistant />
    </Router>
  );
}

export default App;
