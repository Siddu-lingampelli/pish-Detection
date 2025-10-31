# 📸 QR Code Scanner Feature

## ✨ Overview

The QR Code Scanner is a powerful feature that allows users to upload QR code images and automatically detect phishing threats in the decoded content. This is especially useful for India's digital payment ecosystem where UPI payment QR codes are widely used.

## 🎯 Use Cases

### 1. **UPI Payment Scams**
- Scan UPI payment QR codes before making payments
- Detect suspicious amounts or payee information
- Identify redirect URLs hidden in UPI parameters

### 2. **SMS Phishing**
- Upload screenshots of QR codes received via SMS
- Check for malicious URLs before visiting

### 3. **Advertisement Scams**
- Scan QR codes from advertisements or flyers
- Verify cashback/reward offers

### 4. **Public Wi-Fi**
- Check Wi-Fi QR codes for suspicious parameters
- Verify legitimate restaurant/café Wi-Fi codes

## 🔥 Features

### Multi-Layer Detection
1. **QR Decoding** - Reads QR codes from uploaded images
2. **Data Type Detection** - Identifies URLs, UPI payments, phone numbers, etc.
3. **Pattern Analysis** - Detects suspicious keywords and structures
4. **URL Phishing Detection** - Full 6-layer phishing analysis if URL found
5. **UPI Analysis** - Parses and validates UPI payment details
6. **AI Explanation** - Natural language explanation of risks

### Supported QR Types
- ✅ **HTTP/HTTPS URLs** - Regular web links
- ✅ **UPI Payments** - `upi://pay?pa=...&am=...`
- ✅ **Shortened URLs** - bit.ly, tinyurl, etc.
- ✅ **IP-based URLs** - Direct IP addresses
- ✅ **Phone Numbers** - `tel:+91...`
- ✅ **Email** - `mailto:...`
- ✅ **Plain Text** - Any text content

## 🚀 How to Use

### Via Web Interface

1. **Open the app**: Navigate to `http://localhost:3000`
2. **Click "QR Scanner"** in the navigation bar
3. **Upload QR image**: 
   - Click the upload area
   - Select a QR code image (JPG, PNG, GIF)
   - Max file size: 10MB
4. **Click "Scan QR Code"**
5. **View results**: See risk assessment, decoded data, and AI analysis

### Via API (cURL)

```bash
curl -X POST http://localhost:5000/api/qr/scan \
  -F "qrImage=@path/to/qrcode.png"
```

### Via API (PowerShell)

```powershell
$file = "C:\path\to\qrcode.png"
$uri = "http://localhost:5000/api/qr/scan"

$form = @{
    qrImage = Get-Item $file
}

Invoke-RestMethod -Uri $uri -Method POST -Form $form
```

## 📊 Response Format

```json
{
  "success": true,
  "qrCode": {
    "decoded": true,
    "type": "URL",
    "data": "http://example.com",
    "metadata": {
      "imageWidth": 512,
      "imageHeight": 512,
      "decodedAt": "2025-10-31T..."
    }
  },
  "security": {
    "suspicionAnalysis": {
      "isSuspicious": true,
      "riskScore": 65,
      "indicators": ["Suspicious domain extension: .tk"],
      "recommendation": "MEDIUM RISK - Verify before proceeding"
    },
    "phishingDetection": { ... },
    "aiAnalysis": { ... }
  },
  "extractedURL": "http://example.com",
  "upiPayment": null,
  "overallRisk": {
    "score": 72,
    "level": "HIGH",
    "color": "red",
    "action": "🚨 DO NOT PROCEED - This is likely a scam",
    "factors": ["Suspicious domain", "No SSL/HTTPS"]
  }
}
```

## 🛡️ Detection Capabilities

### Suspicious Patterns Detected

1. **High Amount UPI Payments** - Amount > ₹10,000
2. **URL Shorteners** - bit.ly, tinyurl, goo.gl, etc.
3. **Suspicious TLDs** - .tk, .ml, .ga, .cf, .gq
4. **IP Addresses** - Direct IP instead of domain
5. **Redirect URLs in UPI** - Hidden `url` parameter
6. **Suspicious Keywords** - kyc, verify, reward, prize, won, urgent

### India-Specific Keywords (42 total)

Payment apps: `paytm`, `phonepe`, `gpay`, `bhim`, `mobikwik`
Banks: `sbi`, `icici`, `hdfc`, `axis`, `pnb`, `kotak`
Identity: `aadhaar`, `pan`, `kyc`, `otp`, `mpin`
Transactions: `netbanking`, `imps`, `neft`, `rtgs`

## 🧪 Testing Examples

### Test Case 1: Fake Paytm KYC QR Code
Create a QR code with URL: `http://paytm-kyc-update.tk/verify`
- **Expected**: HIGH RISK (suspicious TLD, phishing keywords)

### Test Case 2: Suspicious UPI Payment
Create QR with: `upi://pay?pa=scammer@ybl&am=25000&tn=KYC%20Update%20Required`
- **Expected**: HIGH RISK (high amount, suspicious note)

### Test Case 3: Legitimate Payment
Create QR with: `upi://pay?pa=merchant@paytm&am=100&tn=Order%20Payment`
- **Expected**: LOW RISK (normal payment pattern)

### Test Case 4: URL Shortener
Create QR with: `https://bit.ly/3xYz123`
- **Expected**: MEDIUM RISK (URL shortener detected)

## 🔧 Technical Details

### Backend Stack
- **Jimp** - Image processing and bitmap manipulation
- **qrcode-reader** - QR code decoding
- **Multer** - File upload handling
- **Express.js** - API routing

### Processing Flow
```
Upload Image
    ↓
Decode QR Code (Jimp + qrcode-reader)
    ↓
Detect Data Type (URL, UPI, etc.)
    ↓
Pattern Analysis (40% weight)
    ↓
Extract URL (if present)
    ↓
Phishing Detection (60% weight)
    ↓
AI Explanation (Mistral AI)
    ↓
Return Combined Results
```

### Risk Score Calculation
- **Pattern Analysis**: 40% weight
- **Phishing Detection**: 60% weight
- **Final Score**: 0-100 scale
  - 0-20: LOW
  - 21-40: LOW-MEDIUM
  - 41-70: MEDIUM
  - 71-100: HIGH

## 📱 Real-World Scenarios

### Scenario 1: Restaurant Bill Payment
**Situation**: QR code on restaurant bill
**Action**: Scan before paying
**Detection**: Verify payee name matches restaurant

### Scenario 2: SMS from "Bank"
**Situation**: "Update KYC via QR code" SMS
**Action**: Screenshot and upload QR
**Detection**: Flag suspicious keywords and domain

### Scenario 3: Social Media Prize
**Situation**: "Claim reward" post with QR code
**Action**: Scan QR before claiming
**Detection**: Identify phishing pattern

### Scenario 4: Public Advertisement
**Situation**: "Scan to get discount" poster
**Action**: Verify before scanning on phone
**Detection**: Check URL legitimacy

## 🎓 Educational Tips

### For Users:
1. **Always scan unfamiliar QR codes** before using them
2. **Verify UPI payee details** match the expected recipient
3. **Be cautious of high amounts** or urgent requests
4. **Check for HTTPS** when QR contains URLs
5. **Don't trust QR codes** from unknown sources

### For Developers:
1. Use memory storage for temporary image processing
2. Validate file types and sizes
3. Handle QR decode errors gracefully
4. Combine multiple detection methods
5. Provide clear user feedback

## 🔒 Security Considerations

### Input Validation
- File type restricted to images only
- File size limited to 10MB
- Malformed image handling

### Privacy
- Images processed in memory (not saved)
- No user data stored
- All processing done server-side

### Performance
- Async image processing
- Efficient bitmap operations
- Proper error handling

## 🚧 Known Limitations

1. **QR Quality**: Low-quality or damaged QR codes may fail to decode
2. **Multiple QRs**: Only processes first QR found in image
3. **Dynamic QRs**: Can't detect time-based or dynamic QR codes
4. **Encrypted QRs**: Can't decode encrypted QR content

## 🔮 Future Enhancements

1. **Batch Processing**: Upload multiple QR codes at once
2. **Camera Integration**: Live QR scanning via webcam
3. **QR Generation**: Create safe QR codes
4. **Database**: Store scanned QR history
5. **Mobile App**: Native Android/iOS QR scanner
6. **Offline Mode**: Local QR processing
7. **Report System**: Flag malicious QRs to community

## 📞 Support

If you encounter issues:
1. Ensure image contains a clear QR code
2. Check image file size (< 10MB)
3. Try different image formats (PNG recommended)
4. Verify backend server is running
5. Check console logs for detailed errors

## 📝 API Endpoint

**POST** `/api/qr/scan`

**Request**: Multipart form data with `qrImage` field
**Response**: JSON with complete analysis
**Rate Limit**: None (add if needed)
**Authentication**: None (public endpoint)

---

**🎉 Feature Status**: ✅ Fully Functional

**Last Updated**: October 31, 2025
