# 🛡️ Phishing Shield - Chrome Extension

Real-time phishing detection and website security scanner powered by AI.

## Features

✅ **Real-time Protection** - Automatically scans every website you visit  
✅ **Visual Warnings** - Full-screen alerts for high-risk websites  
✅ **Risk Scoring** - 0-100 risk assessment with detailed analysis  
✅ **HTTPS Checking** - Verifies secure connections  
✅ **Scan History** - Keeps track of your browsing security  
✅ **Badge Indicator** - Shows risk level in browser toolbar  
✅ **Desktop Notifications** - Alerts for dangerous sites  

## Installation

### Step 1: Prepare Icons (Temporary)
Since we don't have icons yet, create a temporary folder:
```
chrome-extension/icons/
```

Download or create 3 PNG images:
- `icon16.png` (16x16)
- `icon48.png` (48x48)
- `icon128.png` (128x128)

Or use online tools like favicon.io to generate shield icons.

### Step 2: Load Extension in Chrome

1. **Open Chrome** and go to `chrome://extensions/`

2. **Enable Developer Mode** (toggle in top-right corner)

3. **Click "Load unpacked"**

4. **Select the folder**:
   ```
   A:\DT project\CC-25 31-10\project\phishing-detection\chrome-extension
   ```

5. **Done!** The extension is now active 🎉

### Step 3: Start Backend Server

The extension needs your backend running:

```bash
cd server
npm start
```

Make sure it's running on `http://localhost:5000`

## How to Use

### Automatic Scanning
- Just browse normally - every page is scanned automatically
- Check the badge icon in your toolbar:
  - **✓** (Green) = Safe
  - **!** (Yellow) = Caution
  - **⚠** (Red) = High Risk

### Manual Scan
1. Click the extension icon in toolbar
2. View detailed risk report
3. Click "View Full Report" to open web app

### High Risk Sites
- Automatic full-screen warning appears
- Options to go back or proceed (not recommended)
- Desktop notification alert

## Configuration

Currently connects to:
- **Backend API**: `http://localhost:5000`
- **Web App**: `http://localhost:3000`

To change these, edit:
- `popup.js` - Line 2: `API_URL`
- `background.js` - Line 2: `API_URL`

## Permissions Explained

- **activeTab**: Read current page URL
- **tabs**: Monitor page navigation
- **storage**: Save scan history locally
- **notifications**: Show security alerts
- **host_permissions**: Scan any website

## Troubleshooting

### Extension not working?
1. Check if backend server is running (`http://localhost:5000`)
2. Open Console in extension popup (right-click → Inspect)
3. Check for CORS errors

### Badge not updating?
- Reload the extension from `chrome://extensions/`
- Make sure auto-scan is enabled

### Warnings not showing?
- Check notification permissions in Chrome settings
- Ensure the website is fully loaded before scanning

## Development

### Files Structure
```
chrome-extension/
├── manifest.json       # Extension configuration
├── popup.html          # Extension popup UI
├── popup.js            # Popup functionality
├── background.js       # Background scanning logic
├── content.js          # Page analysis script
├── content.css         # Content styles
├── icons/              # Extension icons
└── README.md           # This file
```

### Testing
1. Make changes to files
2. Go to `chrome://extensions/`
3. Click refresh icon on your extension
4. Test on a website

## Future Enhancements

- [ ] Options page for settings
- [ ] Whitelist/blacklist management
- [ ] Export scan history as CSV
- [ ] Right-click context menu scanning
- [ ] Screenshot analysis integration
- [ ] AI chatbot in popup

## Support

For issues or questions:
- Backend Server: Ensure running on port 5000
- API Errors: Check browser console
- Not scanning: Verify permissions enabled

---

**Version**: 1.0.0  
**Powered by**: Your Phishing Detection API  
**License**: MIT
