# Quick Start Guide

## 🚀 Fast Setup (3 Steps)

### Step 1: Install Dependencies
```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### Step 2: Start MongoDB
```bash
# Windows (Run as Administrator)
net start MongoDB

# Or start manually
mongod
```

### Step 3: Run the Application
```bash
# Terminal 1 - Start Backend
cd server
npm run dev

# Terminal 2 - Start Frontend
cd client
npm run dev
```

🎉 **Done!** Visit http://localhost:3000

---

## 📝 Common Commands

### Backend (server/)
```bash
npm install          # Install dependencies
npm run dev         # Start development server (with nodemon)
npm start           # Start production server
```

### Frontend (client/)
```bash
npm install          # Install dependencies
npm run dev         # Start development server (Vite)
npm run build       # Build for production
npm run preview     # Preview production build
```

---

## ⚙️ Configuration Checklist

- [ ] MongoDB installed and running
- [ ] Node.js v18+ installed
- [ ] Server dependencies installed (`server/npm install`)
- [ ] Client dependencies installed (`client/npm install`)
- [ ] Environment variables configured (`.env` files)
- [ ] Port 5000 available for backend
- [ ] Port 3000 available for frontend

---

## 🐛 Troubleshooting

### MongoDB Connection Error
```bash
# Check if MongoDB is running
mongosh

# If not, start it:
mongod
```

### Port Already in Use
```bash
# Change ports in:
# - server/.env (PORT=5001)
# - client/vite.config.js (port: 3001)
```

### Module Not Found
```bash
# Re-install dependencies
rm -rf node_modules package-lock.json
npm install
```

---

## 📊 Test URLs

**Safe:**
- https://www.google.com
- https://www.github.com

**Suspicious:**
- http://secure-paypal-verify.tk
- http://192.168.1.1/login

---

**Need help?** Check the main [README.md](README.md) for detailed documentation.
