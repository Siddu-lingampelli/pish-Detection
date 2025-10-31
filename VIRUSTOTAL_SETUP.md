# VirusTotal API Integration Guide

## Overview
VirusTotal is integrated to provide multi-engine malware and phishing detection. It scans URLs against 90+ security vendors and website scanners to give comprehensive threat intelligence.

## Features
- **Multi-Engine Detection**: Uses 90+ antivirus engines and URL scanners
- **Real-time Analysis**: Checks URLs against VirusTotal's database
- **Automatic Submission**: Submits new URLs for scanning if not in database
- **Threat Scoring**: Calculates risk score based on detection count
- **Enhanced Accuracy**: Adds additional layer to detection system

## Getting Your VirusTotal API Key

### Step 1: Create VirusTotal Account
1. Visit [https://www.virustotal.com/](https://www.virustotal.com/)
2. Click "Sign Up" (top right)
3. Choose to sign up with:
   - Google account
   - Email address
4. Verify your email if using email signup

### Step 2: Get API Key
1. Log into your VirusTotal account
2. Click on your username (top right)
3. Select "API Key" from dropdown menu
4. Your API key will be displayed
5. Copy the API key (it's a long alphanumeric string)

**Alternative URL**: Visit [https://www.virustotal.com/gui/my-apikey](https://www.virustotal.com/gui/my-apikey) directly

### Step 3: Add API Key to Project
1. Open `server/.env` file
2. Find the line: `VIRUSTOTAL_API_KEY=your_api_key_here`
3. Replace with your actual API key
4. Save the file

Example:
```env
VIRUSTOTAL_API_KEY=9486466762f38b9984169d8e4f0266eb0fe774c6a0fd282dd0dcf31d6f4c3567
```

### Step 4: Restart Backend Server
```bash
cd server
npm start
```

## How It Works

### Detection Flow
```
User scans URL
    ↓
System checks VirusTotal database
    ↓
If URL found:
    → Get analysis results from 90+ engines
    → Count malicious detections
    → Calculate threat score
If URL not found:
    → Submit URL to VirusTotal for scanning
    → Continue with other detection methods
    ↓
Combine with other detection results
    ↓
Return final verdict
```

### API Response Structure
The VirusTotal integration adds detection information:

```json
{
  "result": "Phishing",
  "confidence_score": 1.0,
  "meta_data": {
    "risk_factors": [
      "Detected by 9/98 engines (VirusTotal)"
    ],
    "threat_types": ["MALICIOUS"]
  }
}
```

## Rate Limits

### Free Tier (Public API)
- **Request Rate**: 4 requests per minute
- **Daily Quota**: 500 requests per day
- **Monthly Quota**: 15,500 requests per month

### Premium Tier
- Higher rate limits available
- Visit [VirusTotal Pricing](https://www.virustotal.com/gui/pricing)

### Rate Limit Handling
The system includes automatic error handling:
- If rate limit exceeded, detection continues without VirusTotal
- No impact on user experience
- Other detection methods still work

## Testing the Integration

### Test Without API Key
System works normally using other detection methods:
- Pattern analysis
- Keyword detection
- SSL/HTTPS checks
- Google Safe Browsing (if configured)

### Test With API Key
Enhanced detection with VirusTotal:

**Test 1 - Legitimate URL:**
```bash
POST http://localhost:5000/api/scan
{
  "url": "https://www.google.com"
}
```
Expected: Clean result (0 detections)

**Test 2 - Known Phishing URL:**
```bash
POST http://localhost:5000/api/scan
{
  "url": "http://testsafebrowsing.appspot.com/s/phishing.html"
}
```
Expected: Multiple detections, marked as Phishing

## Understanding Results

### Detection Count Format
"Detected by X/Y engines (VirusTotal)"
- **X**: Number of engines that flagged the URL as malicious
- **Y**: Total number of engines that scanned the URL
- Higher X means more dangerous

### Threat Score Calculation
```javascript
maliciousCount = stats.malicious + stats.suspicious
threatScore = (maliciousCount / totalEngines) * 2
```
- Score amplified by 2x for sensitivity
- Capped at 1.0 maximum

### Example Results

**Clean URL:**
```
Detected by 0/95 engines (VirusTotal)
Threat Score: 0.0
```

**Suspicious URL:**
```
Detected by 3/92 engines (VirusTotal)
Threat Score: 0.065
Result: Suspicious
```

**Malicious URL:**
```
Detected by 45/90 engines (VirusTotal)
Threat Score: 1.0
Result: Phishing
```

## API Version Used

This integration uses **VirusTotal API v3**:
- Endpoint: `https://www.virustotal.com/api/v3/`
- Authentication: Header-based (`x-apikey`)
- Format: JSON responses

## Features Implemented

### 1. URL Scanning
- Checks if URL exists in VirusTotal database
- Retrieves analysis from all security vendors
- Calculates aggregate threat score

### 2. Automatic Submission
- If URL not found, automatically submits it
- VirusTotal scans the URL in background
- Future scans will have results available

### 3. Error Handling
- 404 errors trigger automatic submission
- Network errors don't break the scan
- Graceful fallback to other methods

### 4. Result Integration
- Combines with other detection methods
- Contributes to overall confidence score
- Adds detection count to risk factors

## Troubleshooting

### Common Issues

#### 1. "VirusTotal API error" in logs
**Problem**: Invalid API key or network issue
**Solution**:
- Verify API key is correct (64 character hex string)
- Check internet connection
- Visit VirusTotal website to confirm key is active

#### 2. Rate limit exceeded
**Problem**: Too many requests
**Solution**:
- Wait 1 minute before next request (free tier)
- Consider upgrading to premium tier
- System continues working with other methods

#### 3. URL not found (404)
**Normal Behavior**: URL automatically submitted for scanning
**Solution**: Wait a few minutes and scan again

#### 4. No detection count in results
**Problem**: VirusTotal integration not working
**Solution**:
- Check API key is added to `.env`
- Restart backend server
- Check console logs for specific errors

## Security & Privacy

### Data Submitted to VirusTotal
When you scan a URL:
- The URL is sent to VirusTotal
- VirusTotal analyzes the URL
- Results are publicly accessible on VirusTotal website
- Consider this when scanning private/internal URLs

### Best Practices
1. **Don't scan private URLs**: Internal company URLs will be public
2. **Review VirusTotal Terms**: Understand data usage
3. **Use for public URLs**: Best for external threat detection
4. **Consider privacy implications**: Scanned URLs are searchable

## Advanced Configuration

### Timeout Settings
Default timeout is 5 seconds. Adjust in `phishingDetectionService.js`:

```javascript
const response = await axios.get(apiUrl, {
  headers: { 'x-apikey': apiKey },
  timeout: 10000  // 10 seconds
});
```

### Threat Score Multiplier
Adjust sensitivity in `phishingDetectionService.js`:

```javascript
const threatScore = totalEngines > 0 
  ? (maliciousCount / totalEngines) * 2  // Change multiplier (1-3)
  : 0;
```

### Disable Auto-Submission
Comment out submission in catch block:

```javascript
if (error.response && error.response.status === 404) {
  // await this.submitToVirusTotal(url);  // Disable submission
}
```

## Monitoring Usage

### Check API Usage
1. Log into VirusTotal
2. Go to "API Key" section
3. View usage statistics:
   - Requests today
   - Requests this month
   - Rate limit status

### Log Messages
Monitor console for VirusTotal activity:
```
✅ URL submitted to VirusTotal for analysis
❌ VirusTotal API error: Rate limit exceeded
```

## Combining with Other APIs

### Detection Priority
The system combines multiple APIs:

1. **Google Safe Browsing**: High priority (instant threat DB)
2. **VirusTotal**: High priority (multi-engine)
3. **Pattern Analysis**: Medium priority
4. **Keyword Detection**: Medium priority
5. **SSL/HTTPS Check**: Low priority

### Score Aggregation
```javascript
totalScore = urlAnalysisScore 
           + keywordScore 
           + safeBrowsingScore 
           + virusTotalScore
```

Final verdict based on combined score:
- **≥ 0.7**: Phishing
- **0.3 - 0.7**: Suspicious
- **< 0.3**: Legit

## Cost Considerations

### Free Tier
- **Cost**: $0
- **Limits**: 4 req/min, 500 req/day
- **Best For**: Testing, low-volume apps

### Premium Tiers
- **Premium**: $240/year
  - 240,000 req/month
  - 500 req/minute
  
- **Enterprise**: Custom pricing
  - Unlimited requests
  - Dedicated support

**Calculate Your Needs:**
- Average scans per day × 30 = monthly scans
- Choose tier that fits your volume

## Additional Resources

### VirusTotal Documentation
- API Docs: [https://docs.virustotal.com/reference/overview](https://docs.virustotal.com/reference/overview)
- API v3 Guide: [https://docs.virustotal.com/docs/getting-started](https://docs.virustotal.com/docs/getting-started)
- Terms of Service: [https://www.virustotal.com/gui/tos](https://www.virustotal.com/gui/tos)

### Support
- Community Forum: [https://community.virustotal.com/](https://community.virustotal.com/)
- Help Center: [https://support.virustotal.com/](https://support.virustotal.com/)
- Status Page: [https://status.virustotal.com/](https://status.virustotal.com/)

## FAQ

**Q: Is VirusTotal API required?**
A: No, the system works perfectly without it. It's an optional enhancement.

**Q: Will my scans be private?**
A: No, URLs scanned by VirusTotal become publicly searchable. Don't scan confidential URLs.

**Q: What happens if I exceed rate limit?**
A: The scan continues using other detection methods. No errors shown to users.

**Q: Can I use multiple API keys to increase limits?**
A: No, VirusTotal tracks by IP address, not just API key.

**Q: How accurate is VirusTotal?**
A: Very high accuracy with 90+ engines. However, false positives can occur.

**Q: Does it slow down my scans?**
A: Minimal impact (~1-2 seconds). Timeout set to 5 seconds max.

**Q: Can I disable it temporarily?**
A: Yes, remove or comment out `VIRUSTOTAL_API_KEY` in `.env` and restart server.

---

**Integration Status**: ✅ Complete and Working

VirusTotal integration adds powerful multi-engine detection to your phishing detection system!
