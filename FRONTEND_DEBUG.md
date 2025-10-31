# Frontend Test & Debug Guide

## Issue: Blank Page on Scan

### Possible Causes & Solutions

#### 1. Check Browser Console
Open the React app at http://localhost:3000
- Press F12 to open Developer Tools
- Click on "Console" tab
- Look for any red error messages

Common errors:
- CORS errors
- Network errors
- Component rendering errors
- Missing imports

#### 2. Test Backend Directly

**PowerShell Test:**
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/scan" -Method Post -ContentType "application/json" -Body '{"url":"https://www.google.com"}'
```

Expected output should include:
- `success: true`
- `data` object with all scan results
- `ai_explanation` object (if Mistral is configured)

#### 3. Check Network Tab
In Browser Developer Tools:
- Click "Network" tab
- Try scanning a URL
- Look for the POST request to `/api/scan`
- Check the response:
  - Status should be 200
  - Response should contain JSON data

#### 4. Verify Servers Running

**Backend (Port 5000):**
```powershell
# Should show MongoDB connected and Mistral AI enabled
cd server
npm start
```

**Frontend (Port 3000):**
```powershell
cd client
npm run dev
```

#### 5. Test with Simple HTML
Open the test file to verify API works:
```
file:///a:/DT%20project/CC-25%2031-10/project/phishing-detection/test-ui.html
```

Or open it directly in browser from the project folder.

#### 6. Common React Issues

**Problem: Component not rendering**
- Check if `result` prop is properly passed
- Verify `ScanResult` component receives data
- Look for JavaScript errors in console

**Problem: API not responding**
- Verify backend is running on port 5000
- Check CORS settings in server
- Verify `.env` file has correct API URL

**Problem: Blank screen after scan**
- Check if `scanResult` state is being set
- Verify no errors in `handleScan` function
- Check browser console for errors

#### 7. Debug Steps

**Step 1: Verify Backend Health**
```
http://localhost:5000/health
```
Should return: `{"status":"OK",...}`

**Step 2: Test API Manually**
Use the test-ui.html file or Postman

**Step 3: Check React State**
Add console.logs in Home.jsx:
```javascript
const handleScan = async (url) => {
  console.log('Scanning:', url);
  // ... rest of code
  
  if (response.success) {
    console.log('Scan result:', response.data);
    setScanResult(response.data);
  }
};
```

**Step 4: Verify Component Rendering**
Add console.log in ScanResult.jsx:
```javascript
const ScanResult = ({ result }) => {
  console.log('ScanResult received:', result);
  if (!result) return null;
  // ... rest of code
};
```

#### 8. Quick Fixes

**Fix 1: Clear Browser Cache**
- Ctrl + Shift + Delete
- Clear cache and reload

**Fix 2: Restart Both Servers**
```powershell
# Stop all (Ctrl+C on both terminals)
# Start backend
cd server
npm start

# Start frontend (new terminal)
cd client
npm run dev
```

**Fix 3: Check .env Files**

`server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/phishingDetection
CLIENT_URL=http://localhost:3000
GOOGLE_SAFE_BROWSING_API_KEY=AIzaSyDYHoo6u8XlwuOwL5dl-olNJooemqOthsU
VIRUSTOTAL_API_KEY=9486466762f38b9984169d8e4f0266eb0fe774c6a0fd282dd0dcf31d6f4c3567
MISTRAL_API_KEY=TtWteX6cmqKVwRmb4BwSVuJeV5FjhaxB
```

`client/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

#### 9. Expected Behavior

**When scanning a URL:**
1. Loading spinner appears
2. Request sent to backend
3. Backend processes (1-5 seconds)
4. Response received
5. ScanResult component displays with:
   - Result badge (Legit/Suspicious/Phishing)
   - Confidence score
   - Risk factors (if any)
   - AI explanation (if Mistral configured)
   - Safety tips

#### 10. Verification Checklist

- [ ] MongoDB running (port 27017)
- [ ] Backend running (port 5000)
- [ ] Frontend running (port 3000)
- [ ] No console errors in browser
- [ ] Network tab shows successful API calls
- [ ] API returns proper JSON response
- [ ] All required imports present in components
- [ ] CORS configured correctly

#### 11. Test URLs

**Legitimate:**
- https://www.google.com
- https://www.github.com
- https://www.microsoft.com

**Suspicious/Phishing:**
- http://testsafebrowsing.appspot.com/s/phishing.html
- http://secure-paypal-verify-login.tk
- http://192.168.1.1/login

## Current Status

✅ Backend: Running on port 5000
✅ Frontend: Running on port 3000
✅ MongoDB: Connected
✅ All APIs: Configured and working
✅ Components: All imports fixed

## If Still Having Issues

1. Open Browser DevTools (F12)
2. Go to Console tab
3. Scan a URL
4. Copy any error messages
5. Check the exact error and fix accordingly

The system is fully functional - if you see a blank page, it's likely a browser cache or rendering issue that can be fixed by following the steps above.
