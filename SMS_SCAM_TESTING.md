# Testing Payment Scam Links (SMS Phishing)

## 🚨 Common SMS Phishing Patterns in India

### Real-World SMS Scam Examples:

---

## 📱 **How to Test Your System:**

### **Method 1: Use the Web UI** (Recommended)
1. Open: http://localhost:3000
2. Enter suspicious URLs
3. Click "Scan URL"
4. View detailed analysis

### **Method 2: Use PowerShell API**
```powershell
# Test a suspicious URL
Invoke-RestMethod -Uri "http://localhost:5000/api/scan" `
  -Method Post `
  -ContentType "application/json" `
  -Body '{"url":"http://paytm-kyc-update.tk/verify"}'
```

---

## 🧪 **Test Cases - SMS Phishing Scenarios:**

### **1. Fake UPI Payment Request**
```
SMS: "You have received ₹5000 via UPI. Click to accept: http://upi-verify-payment.tk/accept"
```

**Test URLs:**
```
http://upi-verify-payment.tk/accept
http://googlepay-receive.ml/payment
http://phonepe-verify.ga/confirm
http://bhim-upi-payment.cf/accept
```

**What System Will Detect:**
- ✅ Suspicious TLD (.tk, .ml, .ga)
- ✅ Keywords: upi, verify, payment
- ✅ No HTTPS encryption
- ✅ Risk: HIGH

---

### **2. Fake KYC Update**
```
SMS: "Your Paytm KYC is incomplete. Complete now to avoid account suspension: http://paytm-kyc-verify.tk"
```

**Test URLs:**
```
http://paytm-kyc-update.tk/verify
http://phonepe-kyc-complete.ml/update
http://sbi-kyc-pending.xyz/complete
http://aadhaar-link-upi.tk/verify
```

**What System Will Detect:**
- ✅ Keywords: paytm, kyc, verify, aadhaar
- ✅ Suspicious domains
- ✅ No SSL certificate
- ✅ Risk: HIGH

---

### **3. Fake Banking Alert**
```
SMS: "Alert! Your SBI account will be blocked. Verify immediately: http://sbi-secure-login.tk"
```

**Test URLs:**
```
http://sbi-netbanking-verify.tk/login
http://hdfc-security-update.ml/verify
http://icici-account-verify.ga/login
http://axis-net-banking.tk/secure
```

**What System Will Detect:**
- ✅ Bank names: sbi, hdfc, icici, axis
- ✅ Keywords: secure, login, verify, banking
- ✅ Suspicious TLDs
- ✅ Risk: HIGH

---

### **4. Fake Prize/Reward**
```
SMS: "Congratulations! You won ₹50,000 Paytm cashback. Claim here: http://paytm-reward-2024.tk"
```

**Test URLs:**
```
http://paytm-reward-claim.tk/prize
http://phonepe-cashback-50k.ml/claim
http://googlepay-offer-win.ga/reward
http://free-upi-money.tk/claim
```

**What System Will Detect:**
- ✅ Keywords: reward, prize, free, claim
- ✅ Payment app names
- ✅ Too-good-to-be-true patterns
- ✅ Risk: HIGH

---

### **5. Fake OTP Request**
```
SMS: "Your HDFC OTP is 123456. If you didn't request, block your card: http://hdfc-block-card.tk"
```

**Test URLs:**
```
http://hdfc-otp-verify.tk/confirm
http://sbi-mpin-reset.ml/verify
http://icici-tpin-change.ga/update
http://paytm-otp-confirm.tk/verify
```

**What System Will Detect:**
- ✅ Keywords: otp, mpin, tpin, verify
- ✅ Banking/payment app names
- ✅ Urgency tactics
- ✅ Risk: HIGH

---

### **6. Fake Delivery/COD Scam**
```
SMS: "Your package is pending. Pay ₹50 delivery charge: http://delivery-cod-payment.tk"
```

**Test URLs:**
```
http://amazon-delivery-cod.tk/pay
http://flipkart-cod-payment.ml/confirm
http://courier-delivery-pay.ga/cod
```

**What System Will Detect:**
- ✅ E-commerce keywords
- ✅ Payment-related terms
- ✅ Suspicious domains
- ✅ Risk: MEDIUM to HIGH

---

### **7. IP-Based URLs (Very Suspicious)**
```
SMS: "Complete your payment: http://192.168.1.100/paytm/verify"
```

**Test URLs:**
```
http://192.168.1.1/upi/verify
http://103.25.45.12/paytm/login
http://172.16.0.1/banking/secure
```

**What System Will Detect:**
- ✅ IP address instead of domain
- ✅ High risk indicator
- ✅ Risk: VERY HIGH

---

## 🧪 **PowerShell Test Script:**

Save this script to test multiple URLs at once:

```powershell
# SMS Phishing Test Suite
Write-Host "`n🧪 SMS PHISHING DETECTION TEST SUITE`n" -ForegroundColor Cyan

$testUrls = @(
    @{url="http://paytm-kyc-update.tk/verify"; type="KYC Scam"},
    @{url="http://upi-payment-receive.tk/accept"; type="UPI Scam"},
    @{url="http://sbi-netbanking.tk/login"; type="Banking Scam"},
    @{url="http://192.168.1.1/paytm/verify"; type="IP-Based Scam"},
    @{url="http://phonepe-reward-50k.ml/claim"; type="Reward Scam"},
    @{url="https://www.google.com"; type="Legitimate (Control)"}
)

foreach ($test in $testUrls) {
    Write-Host "`n--- Testing: $($test.type) ---" -ForegroundColor Yellow
    Write-Host "URL: $($test.url)" -ForegroundColor White
    
    try {
        $result = Invoke-RestMethod -Uri "http://localhost:5000/api/scan" `
            -Method Post `
            -ContentType "application/json" `
            -Body "{`"url`":`"$($test.url)`"}"
        
        $color = switch ($result.data.result) {
            "Legit" { "Green" }
            "Suspicious" { "Yellow" }
            "Phishing" { "Red" }
            default { "White" }
        }
        
        Write-Host "Result: $($result.data.result)" -ForegroundColor $color
        Write-Host "Confidence: $([math]::Round($result.data.confidence_score * 100, 1))%" -ForegroundColor $color
        
        if ($result.data.meta_data.risk_factors.Count -gt 0) {
            Write-Host "Risk Factors:" -ForegroundColor Red
            $result.data.meta_data.risk_factors | ForEach-Object {
                Write-Host "  • $_" -ForegroundColor Red
            }
        }
        
        if ($result.data.meta_data.keywords.Count -gt 0) {
            Write-Host "Keywords Found: $($result.data.meta_data.keywords -join ', ')" -ForegroundColor Yellow
        }
    }
    catch {
        Write-Host "Error testing URL: $_" -ForegroundColor Red
    }
}

Write-Host "`n✅ Test Suite Complete`n" -ForegroundColor Green
```

**Save as:** `test-sms-phishing.ps1`

**Run:**
```powershell
cd "a:\DT project\CC-25 31-10\project\phishing-detection"
.\test-sms-phishing.ps1
```

---

## 🎯 **Real SMS Scam Indicators Your System Detects:**

### **1. Suspicious Domains**
- ✅ Free TLDs: .tk, .ml, .ga, .cf, .gq
- ✅ Misspelled brands: "paytm-verify" instead of "paytm.com"
- ✅ Multiple hyphens: "sbi-net-banking-secure"

### **2. Phishing Keywords**
India-specific detection:
```javascript
// Your system now detects these
'upi', 'paytm', 'phonepe', 'googlepay', 'gpay', 'bhim'
'sbi', 'icici', 'hdfc', 'axis', 'pnb', 'kotak'
'kyc', 'aadhaar', 'pan', 'otp', 'mpin', 'tpin'
'netbanking', 'verify', 'secure', 'login', 'update'
```

### **3. Security Issues**
- ✅ No HTTPS (http:// instead of https://)
- ✅ IP addresses instead of domain names
- ✅ Suspicious character patterns

### **4. Common Tactics**
- ✅ Urgency: "immediately", "expire", "suspend"
- ✅ Rewards: "win", "prize", "cashback", "free"
- ✅ Authority: "verify", "update", "confirm"

---

## 📊 **Expected Results for SMS Scams:**

### **Legitimate Payment Link:**
```
URL: https://paytm.com/payment
Result: ✅ Legit (90-95%)
SSL: ✓ Secured
Risk Factors: None
```

### **SMS Phishing Link:**
```
URL: http://paytm-kyc-update.tk/verify
Result: 🚨 Phishing (95-100%)
SSL: ✗ Not Secured
Risk Factors:
  • Suspicious top-level domain
  • Contains 3 phishing keyword(s)
  • No HTTPS/SSL encryption
Keywords: paytm, kyc, verify
```

---

## 🛡️ **How to Use in Real Life:**

### **Scenario 1: Received SMS with Link**
1. **DON'T CLICK** the link in SMS
2. Copy the URL
3. Open your app: http://localhost:3000
4. Paste URL in scanner
5. Click "Scan URL"
6. Check result before deciding

### **Scenario 2: Already Clicked SMS Link**
1. Close the browser tab immediately
2. Scan the URL in your app
3. If Phishing/Suspicious:
   - Don't enter any information
   - Report to your bank/service provider
   - Change passwords if you entered any
   - Monitor account activity

### **Scenario 3: Share with Family/Friends**
1. Teach them to check links first
2. Share your app URL
3. Demonstrate with examples
4. Show AI explanations for education

---

## 🔍 **Advanced Testing:**

### **Test with Google's Official Phishing Test URL:**
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/scan" `
  -Method Post `
  -ContentType "application/json" `
  -Body '{"url":"http://testsafebrowsing.appspot.com/s/phishing.html"}'
```

**Expected Result:**
- 🚨 Phishing (100%)
- Detected by Google Safe Browsing
- Detected by VirusTotal engines
- AI explanation generated

---

## 💡 **Pro Tips for SMS Scam Detection:**

### **Red Flags to Watch For:**

1. **Domain Issues:**
   - ❌ paytm-kyc.tk (fake TLD)
   - ❌ paytm-verify.ml (fake)
   - ✅ paytm.com (real)

2. **URL Structure:**
   - ❌ http://verify-paytm.tk
   - ❌ http://192.168.1.1/paytm
   - ✅ https://paytm.com

3. **Keywords:**
   - ❌ Multiple: "verify-kyc-update"
   - ❌ Urgency: "immediately", "expire"
   - ❌ Rewards: "win", "free", "prize"

4. **HTTPS:**
   - ❌ http:// (no encryption)
   - ✅ https:// (encrypted)

---

## 📱 **Common SMS Phishing Templates:**

Your system can detect all these patterns:

### **Template 1: Account Suspension**
```
"Dear Customer, Your [Bank/App] account will be suspended. 
Verify now: [PHISHING LINK]"
```

### **Template 2: Prize/Reward**
```
"Congratulations! You won ₹[Amount] in [App] lottery. 
Claim here: [PHISHING LINK]"
```

### **Template 3: OTP/Security**
```
"Your OTP is [Number]. If not requested, secure your account: 
[PHISHING LINK]"
```

### **Template 4: Payment Received**
```
"You received ₹[Amount] via UPI. Accept payment: 
[PHISHING LINK]"
```

### **Template 5: KYC Update**
```
"Complete your KYC to continue using [Service]: 
[PHISHING LINK]"
```

---

## ✅ **Quick Test Commands:**

### **Test 1: Fake Paytm KYC**
```powershell
$body = '{"url":"http://paytm-kyc-verify.tk/update"}'; 
Invoke-RestMethod -Uri "http://localhost:5000/api/scan" -Method Post -ContentType "application/json" -Body $body
```

### **Test 2: Fake UPI Payment**
```powershell
$body = '{"url":"http://upi-receive-payment.ml/accept"}'; 
Invoke-RestMethod -Uri "http://localhost:5000/api/scan" -Method Post -ContentType "application/json" -Body $body
```

### **Test 3: Fake Banking**
```powershell
$body = '{"url":"http://sbi-netbanking.tk/login"}'; 
Invoke-RestMethod -Uri "http://localhost:5000/api/scan" -Method Post -ContentType "application/json" -Body $body
```

### **Test 4: IP-Based (Very Suspicious)**
```powershell
$body = '{"url":"http://192.168.1.1/paytm/verify"}'; 
Invoke-RestMethod -Uri "http://localhost:5000/api/scan" -Method Post -ContentType "application/json" -Body $body
```

---

## 🎓 **Educational Use:**

### **Teach Others to Identify Scams:**
1. Show them legitimate vs fake URLs
2. Demonstrate the scanner
3. Explain risk factors
4. Share AI explanations

### **Workshop Demo:**
1. Collect common SMS scam examples
2. Scan them live
3. Show detection results
4. Discuss why they're dangerous

---

## 🚀 **Your System is Ready!**

✅ India-specific keywords configured
✅ Multi-layered detection active
✅ AI explanations enabled
✅ Real-time scanning working

**Open:** http://localhost:3000
**Start testing SMS phishing links!**

---

**Remember:** NEVER click suspicious links directly. Always scan first!
