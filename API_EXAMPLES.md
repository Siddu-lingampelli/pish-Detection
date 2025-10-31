# API Examples & Testing Guide

## 🧪 Testing the API

### Using cURL

#### 1. Health Check
```bash
curl http://localhost:5000/health
```

**Response:**
```json
{
  "status": "OK",
  "message": "Phishing Detection API is running",
  "timestamp": "2025-10-31T18:00:00.000Z"
}
```

---

#### 2. Scan a URL
```bash
curl -X POST http://localhost:5000/api/scan \
  -H "Content-Type: application/json" \
  -d "{\"url\":\"https://www.google.com\"}"
```

**Response:**
```json
{
  "success": true,
  "message": "URL scanned successfully",
  "data": {
    "_id": "6540a1b2c3d4e5f6g7h8i9j0",
    "url": "https://www.google.com",
    "result": "Legit",
    "confidence_score": 0.9,
    "meta_data": {
      "has_ssl": true,
      "keywords": [],
      "risk_factors": [],
      "domain_length": 14,
      "has_suspicious_chars": false
    },
    "scan_duration": 234,
    "created_at": "2025-10-31T18:00:00.000Z"
  }
}
```

---

#### 3. Get Scan History
```bash
# Get all scans
curl http://localhost:5000/api/history

# Get only phishing results
curl "http://localhost:5000/api/history?result=Phishing"

# Pagination
curl "http://localhost:5000/api/history?limit=10&page=1"
```

---

#### 4. Get Statistics
```bash
curl http://localhost:5000/api/stats
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
    },
    "recentScans": {
      "last7Days": 45
    },
    "avgScanDuration": 245.67,
    "topRiskFactors": [
      {
        "factor": "No HTTPS/SSL encryption",
        "count": 25
      }
    ]
  }
}
```

---

#### 5. Delete a Scan
```bash
curl -X DELETE http://localhost:5000/api/history/6540a1b2c3d4e5f6g7h8i9j0
```

---

#### 6. Clear All History
```bash
curl -X DELETE http://localhost:5000/api/history
```

---

## 🔧 Using PowerShell (Windows)

#### Scan a URL
```powershell
$body = @{
    url = "https://www.google.com"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/scan" `
    -Method Post `
    -ContentType "application/json" `
    -Body $body
```

#### Get History
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/history" -Method Get
```

#### Get Stats
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/stats" -Method Get
```

---

## 🧪 Test Cases

### Test Case 1: Legitimate Website
```json
{
  "url": "https://www.github.com"
}
```
**Expected**: `Result: Legit, High confidence score`

---

### Test Case 2: Suspicious Domain
```json
{
  "url": "http://secure-bank-verify.tk"
}
```
**Expected**: `Result: Suspicious, Keywords detected, No SSL`

---

### Test Case 3: IP-based URL
```json
{
  "url": "http://192.168.1.1/login"
}
```
**Expected**: `Result: Suspicious, IP address detected`

---

### Test Case 4: Multiple Red Flags
```json
{
  "url": "http://paypal-secure-login-verify@phishing.ml"
}
```
**Expected**: `Result: Phishing, Multiple risk factors`

---

## 🔍 Risk Factor Examples

### Common Risk Factors Detected:

1. **No HTTPS/SSL encryption**
   - URLs without `https://`

2. **Uses IP address instead of domain name**
   - `http://192.168.1.1`

3. **Suspicious top-level domain**
   - `.tk`, `.ml`, `.ga`, `.cf`, `.gq`

4. **Contains @ symbol in URL**
   - `http://google.com@phishing.com`

5. **Excessive subdomains**
   - `http://login.secure.verify.banking.com`

6. **Contains suspicious character patterns**
   - Multiple hyphens: `secure--bank--login.com`

7. **Unusually long domain name**
   - Domains over 50 characters

8. **Contains phishing keyword(s)**
   - login, verify, account, secure, banking, etc.

---

## 📊 Response Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200  | OK | Request successful |
| 400  | Bad Request | Invalid input (missing URL, invalid format) |
| 404  | Not Found | Scan record not found |
| 500  | Internal Server Error | Server error |

---

## 🎯 Sample URLs for Testing

### ✅ Safe URLs
```
https://www.google.com
https://www.github.com
https://www.microsoft.com
https://www.stackoverflow.com
https://www.wikipedia.org
```

### ⚠️ Suspicious Patterns (Test Only)
```
http://secure-paypal-login.tk
http://192.168.1.1/admin
http://www-netflix-verify.ml
http://banking-secure-login.ga
http://apple-id-verify.cf
```

### ❌ Known Phishing Indicators
```
http://paypal@phishing.com
http://secure--bank--login.tk
http://аррӏе.com (Cyrillic characters)
```

---

## 🔐 Security Best Practices

1. **Never visit suspicious URLs** detected by the system
2. **Always verify** the actual domain before clicking links
3. **Check for HTTPS** before entering sensitive information
4. **Be cautious** of emails asking you to verify accounts
5. **Use the system** to scan before clicking unknown links

---

## 💡 Integration Examples

### JavaScript/Fetch
```javascript
async function scanURL(url) {
  const response = await fetch('http://localhost:5000/api/scan', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url })
  });
  
  const data = await response.json();
  return data;
}

// Usage
scanURL('https://example.com')
  .then(result => console.log(result))
  .catch(error => console.error(error));
```

### Python
```python
import requests

def scan_url(url):
    response = requests.post(
        'http://localhost:5000/api/scan',
        json={'url': url}
    )
    return response.json()

# Usage
result = scan_url('https://example.com')
print(result)
```

---

## 📝 Notes

- All timestamps are in ISO 8601 format (UTC)
- Confidence scores range from 0 to 1 (0% to 100%)
- Results are one of: `Legit`, `Suspicious`, or `Phishing`
- Scan history is stored locally in MongoDB
- API responses always include a `success` boolean field

---

**For more information, see the main [README.md](README.md)**
