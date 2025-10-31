import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Home from './pages/Home';
import History from './pages/History';
import Analytics from './pages/Analytics';
import QRScanner from './components/QRScanner';
import './index.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/scanner" element={<><Navbar /><Home /></>} />
          <Route path="/qr-scanner" element={<><Navbar /><QRScanner /></>} />
          <Route path="/history" element={<><Navbar /><History /></>} />
          <Route path="/analytics" element={<><Navbar /><Analytics /></>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
