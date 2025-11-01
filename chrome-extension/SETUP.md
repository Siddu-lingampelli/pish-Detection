# 🚀 Chrome Extension Setup - Quick Start

## Prerequisites
✅ Backend server running on `http://localhost:5000`  
✅ Chrome browser installed

---

## Step 1: Create Icon Files (2 minutes)

### Option A: Use Online Tool (Recommended)
1. Go to: **https://favicon.io/favicon-generator/**
2. Enter text: `🛡️` or `PS`
3. Background: `#000000` (black)
4. Font: Bold, size 110
5. Click **Download**
6. Extract ZIP
7. Copy these files to `chrome-extension/icons/`:
   - `favicon-16x16.png` → Rename to `icon16.png`
   - `favicon-32x32.png` → Resize to 48x48 → Rename to `icon48.png`
   - `android-chrome-192x192.png` → Resize to 128x128 → Rename to `icon128.png`

### Option B: Use Paint (Quick & Dirty)
1. Open Paint
2. Create 16x16 white square → Save as `icon16.png`
3. Create 48x48 white square → Save as `icon48.png`
4. Create 128x128 white square → Save as `icon128.png`
5. Place all in `chrome-extension/icons/` folder

---

## Step 2: Load Extension in Chrome (1 minute)

1. **Open Chrome** and navigate to:
   ```
   chrome://extensions/
   ```

2. **Enable Developer Mode** (toggle switch in top-right)

3. **Click "Load unpacked"** button

4. **Navigate to and select**:
   ```
   A:\DT project\CC-25 31-10\project\phishing-detection\chrome-extension
   ```

5. **Click "Select Folder"**

6. ✅ **Extension installed!** You should see:
   - "Phishing Shield" card in extensions list
   - Shield icon in Chrome toolbar (top-right)

---

## Step 3: Test the Extension

### Test 1: Open Popup
1. Click the shield icon in toolbar
2. Should see "Analyzing current page..."
3. Then shows risk report with:
   - Risk score (0-100)
   - Risk level (LOW/MEDIUM/HIGH)
   - HTTPS status
   - Current URL

### Test 2: Scan a Known Phishing Site
1. Visit a test phishing site (or paste known bad URL in address bar)
2. Extension badge should turn **red (⚠)**
3. Should see desktop notification
4. Full-screen warning overlay appears

### Test 3: Safe Website
1. Visit `https://google.com`
2. Extension badge shows **green (✓)**
3. Popup shows "Safe Website"
4. Risk score: 0-20/100

---

## Step 4: Verify Backend Connection

### Check Console Logs
1. Right-click extension icon → **Inspect popup**
2. Open **Console** tab
3. Should see API calls like:
   ```
   POST http://localhost:5000/api/scan
   ```

### If Errors:
- **"Failed to fetch"**: Backend not running → Start with `npm start`
- **CORS error**: Add extension to CORS whitelist
- **404 error**: Check API_URL in `popup.js` and `background.js`

---

## Features You Can Test

### 🔍 Auto-Scan
- Navigate to any website
- Extension scans automatically on page load
- Check badge color for instant status

### 🚨 High-Risk Warning
- Visit suspicious site
- Full-screen warning appears automatically
- Options: "Go Back" or "Proceed Anyway"

### 📊 View Full Report
- Click extension icon
- Click "View Full Report" button
- Opens web app at `localhost:3000/scanner`

### 📝 Scan History
- Stored locally in Chrome
- Access via `chrome.storage.local`
- Keeps last 100 scans

---

## Troubleshooting

### Extension Not Loading?
```bash
# Check for syntax errors in manifest.json
# Open chrome://extensions/ → Click "Details" → Check errors
```

### Badge Not Updating?
```bash
# Reload extension:
# chrome://extensions/ → Click refresh icon on "Phishing Shield"
```

### Popup Shows Error?
```bash
# Verify backend is running:
curl http://localhost:5000/health

# Should return:
# {"status":"OK","message":"Phishing Detection API is running"}
```

### No Warnings on Phishing Sites?
- Check notification permissions in Chrome settings
- Ensure site risk score is ≥70
- Check browser console for errors

---

## Development Tips

### Make Changes
1. Edit files in `chrome-extension/` folder
2. Go to `chrome://extensions/`
3. Click **refresh icon** on extension
4. Test changes immediately

### Debug Popup
- Right-click extension icon → **Inspect popup**
- Use Console for logs
- Use Network tab for API calls

### Debug Background Script
- `chrome://extensions/` → Click "service worker" link
- Opens DevTools for background.js
- Check for errors and logs

### Debug Content Script
- Open any website
- Right-click → **Inspect**
- Console shows content.js logs

---

## Configuration

### Change API URL
Edit both files:

**popup.js** (line 2):
```javascript
const API_URL = 'http://localhost:5000/api';
```

**background.js** (line 2):
```javascript
const API_URL = 'http://localhost:5000/api';
```

### Disable Auto-Scan
**background.js** - Comment out:
```javascript
// chrome.tabs.onUpdated.addListener(...)
```

---

## Next Steps

### Publish to Chrome Web Store
1. Create developer account ($5 one-time)
2. Zip the `chrome-extension` folder
3. Upload to Chrome Web Store dashboard
4. Wait for review (1-3 days)

### Add More Features
- Settings page (`options.html`)
- Right-click context menu
- Screenshot analysis integration
- Export scan reports

---

## Success Checklist

- ✅ Icons created and placed in `/icons/` folder
- ✅ Extension loaded in Chrome (`chrome://extensions/`)
- ✅ Backend server running on port 5000
- ✅ Popup opens when clicking icon
- ✅ Badge shows risk level (✓, !, ⚠)
- ✅ Auto-scan works on page navigation
- ✅ Warnings appear for high-risk sites
- ✅ "View Full Report" opens web app

---

**You now have a fully functional phishing detection Chrome extension!** 🎉

For support, check browser console for errors and ensure backend is running.
