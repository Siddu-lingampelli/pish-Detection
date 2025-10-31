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
      <div className="min-h-screen bg-[#0a0a0a]">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/scanner" element={<><Navbar /><div className="container mx-auto px-6 py-12"><Home /></div></>} />
          <Route path="/qr-scanner" element={<><Navbar /><div className="py-12"><QRScanner /></div></>} />
          <Route path="/history" element={<><Navbar /><div className="container mx-auto px-6 py-12"><History /></div></>} />
          <Route path="/analytics" element={<><Navbar /><div className="container mx-auto px-6 py-12"><Analytics /></div></>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
