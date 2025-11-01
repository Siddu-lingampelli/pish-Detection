# 🚀 PhishGuard Chrome Extension - Installation Guide

## ✅ Quick Start (5 Minutes)

### Step 1: Ensure Backend is Running

Open a terminal and run:
```powershell
cd "a:\DT project\CC-25 31-10\project\phishing-detection\server"
npm run dev
```

**Expected output:**
```
🚀 Server is running on port 5000
✅ MongoDB Connected
```

**Important:** Keep this terminal running! The extension needs the backend API.

---

### Step 2: Load Extension in Chrome

1. **Open Chrome** and navigate to:
   ```
   chrome://extensions/
   ```

2. **Enable Developer Mode**
   - Look for toggle switch in the **top-right corner**
   - Turn it ON (should be blue)

3. **Click "Load unpacked"** button (top-left area)

4. **Navigate to the extension folder:**
   ```
   A:\DT project\CC-25 31-10\project\phishing-detection\chrome-extension
   ```

5. **Click "Select Folder"**

6. ✅ **Success!** You should see:
   - **"PhishGuard"** card in your extensions list
   - **Shield icon** in Chrome toolbar (top-right, next to address bar)
   - Status: **Enabled** with toggle ON

---

### Step 3: Test the Extension

#### Test 1: Open Popup
1. Click the **shield icon** in Chrome toolbar
2. You should see a popup window showing:
   - **Current URL** being analyzed
   - **Risk Score** (0-100)
   - **Risk Level** (Safe/Suspicious/Dangerous)
   - **HTTPS Status**
   - **View Full Report** button

#### Test 2: Scan Google (Safe Site)
1. Navigate to `https://google.com`
2. Click extension icon
3. **Expected Result:**
   - ✅ Risk Score: **0-20/100** (GREEN)
   - Status: **"Safe Website"**
   - Badge shows green checkmark

#### Test 3: Test with Known Phishing URL
1. In the extension popup, click **"View Full Report"**
2. This opens your web app at `http://localhost:3000/scanner`
3. Enter a suspicious URL to test (or use the scanner directly)

---

## 🎯 Features Overview

### 🔄 Auto-Scan on Page Load
- Extension automatically scans every page you visit
- Runs in background without interrupting browsing
- Updates badge icon with risk level

### 🚨 Real-Time Warnings
- High-risk sites (score ≥70) trigger warnings
- Desktop notifications alert you
- Full-screen warning overlay (for dangerous sites)

### 📊 Detailed Analysis
- Click **"View Full Report"** to open web app
- Access all 7 security layers
- See AI explanations and recommendations

### 🎨 Visual Indicators
- **Green Badge (✓)**: Safe website (0-30)
- **Yellow Badge (!)**: Suspicious (31-60)
- **Red Badge (⚠)**: Dangerous (61-100)

---

## 🔧 Configuration

### Change Backend API URL

If your backend is on a different port, update these files:

**popup.js** (line 2):
```javascript
const API_URL = 'http://localhost:5000/api';
```

**background.js** (line 2):
```javascript
const API_URL = 'http://localhost:5000/api';
```

Then reload the extension:
1. Go to `chrome://extensions/`
2. Click the **refresh icon** on PhishGuard card

---

## 🐛 Troubleshooting

### Issue: Extension Icon Not Appearing
**Solution:**
1. Go to `chrome://extensions/`
2. Verify "PhishGuard" is **Enabled**
3. Click the **puzzle icon** in toolbar
4. Find PhishGuard → Click **pin icon** to pin to toolbar

---

### Issue: Popup Shows "Failed to Analyze"
**Solution:**
1. Check if backend is running:
   ```powershell
   curl http://localhost:5000/health
   ```
   Should return: `{"status":"OK"}`

2. If not running, start backend:
   ```powershell
   cd "a:\DT project\CC-25 31-10\project\phishing-detection\server"
   npm run dev
   ```

---

### Issue: "Extension Manifest Not Valid"
**Solution:**
1. Check for JSON syntax errors in `manifest.json`
2. Ensure all icon files exist in `icons/` folder
3. Go to `chrome://extensions/` → Click **Details** → Check error message

---

### Issue: CORS Error in Console
**Solution:**
The backend already has CORS enabled. If you still see errors:

Edit `server/server.js`:
```javascript
app.use(cors({
  origin: ['http://localhost:3000', 'chrome-extension://*'],
  credentials: true
}));
```

---

## 🎨 Customize Icons (Optional)

### Option A: Use Online Generator
1. Go to: https://favicon.io/favicon-generator/
2. Design your icon:
   - Text: `🛡️` or `PG`
   - Background: `#000000`
   - Font: Bold
3. Download ZIP
4. Extract and rename:
   - `favicon-16x16.png` → `icon16.png`
   - Copy to `chrome-extension/icons/`
   - Create 48x48 and 128x128 versions

### Option B: Use Current SVG Icons
The extension already has SVG icons created. They work in Chrome!
- Located in: `chrome-extension/icons/`
- Files: `icon16.svg`, `icon48.svg`, `icon128.svg`

---

## 📱 How the Extension Works

### On Page Load:
```
User visits website
      ↓
Content script activates
      ↓
Extract current URL
      ↓
Send to background script
      ↓
Background calls API: POST /api/scan
      ↓
Receive risk score (0-100)
      ↓
Update badge icon color
      ↓
Store in chrome.storage
      ↓
Show notification (if high risk)
```

### On Popup Click:
```
User clicks extension icon
      ↓
popup.html opens
      ↓
popup.js fetches current tab URL
      ↓
Displays cached scan result
      ↓
User can click "View Full Report"
      ↓
Opens web app in new tab
```

---

## 🚀 Advanced Features

### View Extension Console Logs
1. Right-click extension icon
2. Select **"Inspect popup"**
3. Console tab shows all logs

### Debug Background Script
1. Go to `chrome://extensions/`
2. Find PhishGuard
3. Click **"service worker"** link
4. DevTools opens for background.js

### View Scan History
Open DevTools Console and run:
```javascript
chrome.storage.local.get('scanHistory', (data) => {
  console.log(data.scanHistory);
});
```

---

## 📦 Files Structure

```
chrome-extension/
├── manifest.json          # Extension configuration
├── popup.html            # Popup UI
├── popup.js              # Popup logic
├── background.js         # Background service worker
├── content.js            # Injected into web pages
├── content.css           # Styles for warnings
├── warning.html          # Full-screen warning page
├── icons/
│   ├── icon16.svg       # Toolbar icon (small)
│   ├── icon48.svg       # Extension manager icon
│   └── icon128.svg      # Chrome Web Store icon
├── create-icons.js       # Icon generator script
├── SETUP.md             # Setup instructions
└── README.md            # Documentation
```

---

## ✅ Success Checklist

Before considering the extension ready:

- [ ] Backend running on `http://localhost:5000`
- [ ] Extension loaded in `chrome://extensions/`
- [ ] Developer Mode enabled
- [ ] Extension icon visible in toolbar
- [ ] Popup opens when clicking icon
- [ ] Badge color changes based on website
- [ ] "View Full Report" opens web app
- [ ] No errors in extension console

---

## 🌐 Testing URLs

### Safe Sites (Score: 0-30)
- https://google.com
- https://github.com
- https://microsoft.com

### Test Phishing Detection
Use your web app scanner at `http://localhost:3000/scanner` to test with:
- Suspicious TLDs (.tk, .ml, .ga)
- IP-based URLs (http://192.168.1.1)
- URLs with phishing keywords

---

## 🎓 Next Steps

### 1. Test All Features
- Visit multiple websites
- Check badge colors
- Test notifications
- Use "View Full Report"

### 2. Add Authentication (Future)
- Sync scan history with user account
- Access premium features from extension
- Require login for advanced analysis

### 3. Publish to Chrome Web Store
- Create developer account ($5 one-time)
- Prepare store listing (screenshots, description)
- Submit for review
- Wait 1-3 days for approval

---

## 💡 Pro Tips

1. **Pin Extension**: Click puzzle icon → Pin PhishGuard for quick access
2. **Keyboard Shortcut**: Set in `chrome://extensions/shortcuts`
3. **Disable on Trusted Sites**: Use site exceptions
4. **Export Settings**: Use `chrome.storage.sync` for cloud sync

---

## 🆘 Need Help?

### Check Extension Status
```
chrome://extensions/
```
Look for errors under PhishGuard card

### View API Health
```powershell
curl http://localhost:5000/health
```

### Check MongoDB Connection
Backend logs should show:
```
✅ MongoDB Connected: localhost
```

---

## 🎉 You're All Set!

Your Chrome extension is now installed and ready to protect you from phishing attacks in real-time!

**Test it now:**
1. Click the shield icon in your toolbar
2. Navigate to any website
3. Watch the badge update with security status
4. Click "View Full Report" for detailed analysis

**The extension is actively scanning and protecting you! 🛡️**

---

*PhishGuard Chrome Extension v1.0.0*  
*Last Updated: November 1, 2025*
