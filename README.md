# 🛡️ AI-Powered Real-Time Phishing Detection System

A comprehensive MERN stack application that uses AI and machine learning to detect phishing websites in real-time, providing instant threat analysis and detailed security reports.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?logo=mongodb&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?logo=express&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white)

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [AI Detection Logic](#ai-detection-logic)
- [Future Enhancements](#future-enhancements)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### 🧠 Core Features
- **Real-time AI Detection**: Instant phishing detection using multiple ML algorithms
- **AI-Powered Explanations**: Natural language analysis of detection results (via Mistral AI)
- **Confidence Scoring**: Shows probability percentage for each detection
- **Multi-layered Analysis**: URL structure, keywords, SSL/HTTPS, domain analysis
- **Google Safe Browsing Integration**: Optional API integration for enhanced detection
- **Local MongoDB Storage**: All scans stored locally for privacy and analytics

### 📊 Dashboard Features
- **URL Scanner**: Clean interface to test any URL
- **AI Explanations**: Human-readable analysis of why a URL is safe or dangerous
- **Safety Tips**: Personalized security recommendations for each scan
- **Scan History**: View all previous scans with filtering options
- **Analytics Dashboard**: Visual charts and statistics
- **Risk Factor Analysis**: Detailed breakdown of detection reasons
- **Threat Intelligence**: Identifies specific threat types

### 🎨 UI/UX Features
- **Modern Design**: Beautiful gradient backgrounds with TailwindCSS
- **Responsive Layout**: Works on desktop, tablet, and mobile
- **Color-coded Results**: Green (Safe), Yellow (Suspicious), Red (Phishing)
- **Real-time Feedback**: Loading states and instant results
- **Interactive Charts**: Pie charts and bar graphs for analytics

## 🛠️ Tech Stack

### Backend
- **Node.js** (v18+) - Runtime environment
- **Express.js** (v4.18+) - Web framework
- **MongoDB** (v6+) - NoSQL database
- **Mongoose** (v8+) - MongoDB ODM
- **Axios** - HTTP client for API calls

### Frontend
- **React** (v18.2+) - UI library
- **Vite** (v5+) - Build tool
- **TailwindCSS** (v3.3+) - Utility-first CSS
- **React Router** (v6.20+) - Navigation
- **React Icons** - Icon library
- **Recharts** (v2.10+) - Chart library

### AI/ML Layer
- **Custom ML Logic** - Pattern recognition & keyword analysis
- **Google Safe Browsing API** (Optional) - Threat intelligence
- **Mistral AI** (Optional) - Natural language explanations
- **URL Analysis Engine** - Multi-factor risk assessment

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v6.0 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **npm** or **yarn** - Comes with Node.js
- **Git** - [Download](https://git-scm.com/)

### Check Installation
```bash
node --version  # Should be v18+
npm --version   # Should be v9+
mongod --version  # Should be v6+
```

## 🚀 Installation

### 1. Clone the Repository
```bash
cd "a:\DT project\CC-25 31-10\project"
cd phishing-detection
```

### 2. Install Backend Dependencies
```bash
cd server
npm install
```

### 3. Install Frontend Dependencies
```bash
cd ../client
npm install
```

## ⚙️ Configuration

### Backend Configuration

1. **MongoDB Setup**
   - Ensure MongoDB is running locally:
   ```bash
   mongod
   ```
   - Default connection: `mongodb://localhost:27017/phishingDetection`

2. **Environment Variables**
   - Edit `server/.env`:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/phishingDetection
   CLIENT_URL=http://localhost:3000
   
   # Optional: Get API keys for enhanced detection
   GOOGLE_SAFE_BROWSING_API_KEY=your_api_key_here
   MISTRAL_API_KEY=your_mistral_api_key_here
   VIRUSTOTAL_API_KEY=your_api_key_here
   ```

3. **Get API Keys (Optional but Recommended)**
   - **Google Safe Browsing API**: 
     - Visit: https://developers.google.com/safe-browsing/v4/get-started
     - Create a project in Google Cloud Console
     - Enable Safe Browsing API
     - Create credentials (API Key)
   
   - **Mistral AI API** (For Natural Language Explanations):
     - Visit: https://console.mistral.ai/
     - Sign up and create an API key
     - See `MISTRAL_SETUP.md` for detailed instructions
   
   - **VirusTotal API** (Future Use):
     - Visit: https://www.virustotal.com/gui/my-apikey
     - Sign up and get your API key

### Frontend Configuration

1. **Environment Variables**
   - Edit `client/.env`:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

## 🎯 Running the Application

### Option 1: Run Both Services Separately

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```
Server will start at: `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```
Client will start at: `http://localhost:3000`

### Option 2: Production Build

**Build Frontend:**
```bash
cd client
npm run build
```

**Serve with Backend:**
```bash
cd ../server
npm start
```

### Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

## 📡 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Endpoints

#### 1. Scan URL
```http
POST /api/scan
Content-Type: application/json

{
  "url": "https://example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "URL scanned successfully",
  "data": {
    "_id": "...",
    "url": "https://example.com",
    "result": "Legit",
    "confidence_score": 0.95,
    "meta_data": {
      "has_ssl": true,
      "keywords": [],
      "risk_factors": [],
      "domain_length": 15
    },
    "scan_duration": 234,
    "created_at": "2025-10-31T18:00:00Z"
  }
}
```

#### 2. Get Scan History
```http
GET /api/history?limit=50&page=1&result=Phishing
```

**Query Parameters:**
- `limit` (optional): Number of results per page (default: 50)
- `page` (optional): Page number (default: 1)
- `result` (optional): Filter by result type (Legit/Suspicious/Phishing)

#### 3. Get Statistics
```http
GET /api/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalScans": 150,
    "counts": {
      "legit": 100,
      "suspicious": 30,
      "phishing": 20
    },
    "percentages": {
      "legit": "66.67",
      "suspicious": "20.00",
      "phishing": "13.33"
    }
  }
}
```

#### 4. Delete Scan
```http
DELETE /api/history/:id
```

#### 5. Clear All History
```http
DELETE /api/history
```

## 📁 Project Structure

```
phishing-detection/
├── server/                      # Backend (Node.js + Express)
│   ├── config/
│   │   └── db.js               # MongoDB connection
│   ├── models/
│   │   └── URLScan.js          # Mongoose schema
│   ├── routes/
│   │   └── scanRoutes.js       # API routes
│   ├── services/
│   │   └── phishingDetectionService.js  # AI detection logic
│   ├── .env                    # Environment variables
│   ├── server.js               # Entry point
│   └── package.json
│
├── client/                     # Frontend (React + Vite)
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx     # Navigation bar
│   │   │   ├── URLScanner.jsx # URL input form
│   │   │   └── ScanResult.jsx # Result display
│   │   ├── pages/
│   │   │   ├── Home.jsx       # Main scanner page
│   │   │   ├── History.jsx    # Scan history
│   │   │   └── Analytics.jsx  # Analytics dashboard
│   │   ├── services/
│   │   │   └── api.js         # API client
│   │   ├── App.jsx            # Main app component
│   │   ├── main.jsx           # Entry point
│   │   └── index.css          # Global styles
│   ├── .env                   # Environment variables
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
└── README.md
```

## 🧠 AI Detection Logic

The system uses a **multi-layered detection approach**:

### 1. URL Structure Analysis
- ✓ IP address detection (suspicious)
- ✓ Suspicious TLDs (.tk, .ml, .ga, .cf, etc.)
- ✓ @ symbol detection
- ✓ Excessive subdomains
- ✓ Unusual domain length
- ✓ Homograph attacks (look-alike characters)

### 2. Keyword Analysis
Scans for common phishing keywords:
- login, verify, account, update, secure
- banking, confirm, password, signin
- paypal, amazon, microsoft, google, etc.

### 3. SSL/HTTPS Verification
- Checks for HTTPS protocol
- Identifies unencrypted connections

### 4. Google Safe Browsing (Optional)
- Real-time threat intelligence
- Checks against known phishing databases
- Identifies: MALWARE, SOCIAL_ENGINEERING, etc.

### Detection Scoring
```javascript
Score >= 0.7  → Phishing
Score >= 0.3  → Suspicious
Score <  0.3  → Legit
```

## 🔮 Future Enhancements

- [ ] **Chrome Extension** - Browser plugin for real-time protection
- [ ] **Email Integration** - Scan links in emails
- [ ] **Advanced ML Model** - Train on PhishStorm/UCI datasets
- [ ] **User Authentication** - JWT-based login system
- [ ] **API Rate Limiting** - Prevent abuse
- [ ] **Dark Mode** - Toggle UI theme
- [ ] **Export Reports** - PDF/CSV export
- [ ] **Webhooks** - Alert notifications
- [ ] **Multi-language Support** - i18n integration
- [ ] **Docker Support** - Containerization

## 🧪 Testing

### Test with Sample URLs

**Legit URLs:**
- https://www.google.com
- https://www.github.com
- https://www.microsoft.com

**Suspicious URLs:**
- http://secure-paypal-verify-login.tk
- http://192.168.1.1/login
- http://www-paypal-secure-login.com

**Known Phishing (Use with Caution):**
- Check PhishTank.org for real examples

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**Lingampelli Siddhartha**

- Project: AI-Powered Real-Time Phishing Detection System
- Version: 1.0.0
- Date: October 31, 2025

## 🙏 Acknowledgments

- Google Safe Browsing API for threat detection
- Mistral AI for natural language explanations
- PhishTank for threat intelligence
- TailwindCSS for beautiful UI
- React community for excellent libraries

## 📚 Additional Documentation

- **Quick Start Guide**: See `QUICKSTART.md` for a fast setup walkthrough
- **API Examples**: See `API_EXAMPLES.md` for detailed API usage
- **Mistral AI Setup**: See `MISTRAL_SETUP.md` for AI explanations configuration
- **Deployment Guide**: See `DEPLOYMENT.md` for production deployment

## 📞 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Contact: [Your Email]

## 🎉 Getting Started

1. **Install dependencies** (see [Installation](#installation))
2. **Configure environment** (see [Configuration](#configuration))
3. **Start MongoDB** (`mongod`)
4. **Run backend** (`cd server && npm run dev`)
5. **Run frontend** (`cd client && npm run dev`)
6. **Visit** http://localhost:3000
7. **Start scanning URLs!** 🚀

---

Made with ❤️ using MERN Stack

**Stay Safe. Stay Protected. Use PhishGuard.** 🛡️
