# SMS Phishing Detection Test Suite
# Tests common SMS scam patterns targeting Indian payment systems

Write-Host "`n" -NoNewline
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   🚨 SMS PHISHING DETECTION TEST SUITE 🚨" -ForegroundColor Cyan
Write-Host "   Testing India-Specific Payment Scam Links" -ForegroundColor White
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "`n"

# Test cases - Common SMS phishing patterns
$testCases = @(
    @{
        name = "Fake Paytm KYC Update"
        url = "http://paytm-kyc-update.tk/verify"
        smsText = "Your Paytm KYC is incomplete. Update now to avoid account suspension"
    },
    @{
        name = "Fake UPI Payment Link"
        url = "http://upi-payment-receive.ml/accept"
        smsText = "You received ₹5000 via UPI. Click to accept payment"
    },
    @{
        name = "Fake SBI NetBanking"
        url = "http://sbi-netbanking-secure.tk/login"
        smsText = "Alert! Your SBI account will be blocked. Verify immediately"
    },
    @{
        name = "Fake PhonePe Reward"
        url = "http://phonepe-cashback-winner.ga/claim"
        smsText = "Congratulations! You won ₹50,000 PhonePe cashback"
    },
    @{
        name = "IP-Based Phishing (Very Suspicious)"
        url = "http://192.168.1.1/paytm/verify"
        smsText = "Complete your Paytm verification"
    },
    @{
        name = "Fake HDFC OTP Request"
        url = "http://hdfc-otp-verify.tk/confirm"
        smsText = "Your HDFC OTP verification is pending. Confirm now"
    },
    @{
        name = "Fake Aadhaar Link UPI"
        url = "http://aadhaar-link-upi.tk/update"
        smsText = "Link your Aadhaar with UPI to continue using services"
    },
    @{
        name = "Control - Legitimate Site (Google)"
        url = "https://www.google.com"
        smsText = "N/A - Testing legitimate URL for comparison"
    }
)

$totalTests = $testCases.Count
$passedTests = 0
$failedTests = 0

foreach ($test in $testCases) {
    Write-Host "┌─────────────────────────────────────────────────────────────┐" -ForegroundColor Gray
    Write-Host "│ Test: " -NoNewline -ForegroundColor Gray
    Write-Host $test.name -ForegroundColor Yellow
    Write-Host "│ SMS: " -NoNewline -ForegroundColor Gray
    Write-Host $test.smsText -ForegroundColor White
    Write-Host "│ URL: " -NoNewline -ForegroundColor Gray
    Write-Host $test.url -ForegroundColor White
    Write-Host "└─────────────────────────────────────────────────────────────┘" -ForegroundColor Gray
    
    try {
        $body = @{ url = $test.url } | ConvertTo-Json
        $result = Invoke-RestMethod -Uri "http://localhost:5000/api/scan" `
            -Method Post `
            -ContentType "application/json" `
            -Body $body `
            -TimeoutSec 10
        
        if ($result.success) {
            $data = $result.data
            
            # Determine color based on result
            $resultColor = switch ($data.result) {
                "Legit" { "Green" }
                "Suspicious" { "Yellow" }
                "Phishing" { "Red" }
                default { "White" }
            }
            
            # Display results
            Write-Host ""
            Write-Host "  🎯 SCAN RESULT:" -ForegroundColor Cyan
            Write-Host "     Status: " -NoNewline
            Write-Host $data.result -ForegroundColor $resultColor -NoNewline
            $confidencePercent = [math]::Round($data.confidence_score * 100, 1)
            Write-Host " ($confidencePercent% confidence)" -ForegroundColor $resultColor
            
            Write-Host "     SSL/HTTPS: " -NoNewline
            if ($data.meta_data.has_ssl) {
                Write-Host "✓ Secured" -ForegroundColor Green
            } else {
                Write-Host "✗ Not Secured" -ForegroundColor Red
            }
            
            # Show risk factors
            if ($data.meta_data.risk_factors -and $data.meta_data.risk_factors.Count -gt 0) {
                Write-Host ""
                Write-Host "  ⚠️  RISK FACTORS DETECTED:" -ForegroundColor Red
                foreach ($factor in $data.meta_data.risk_factors) {
                    Write-Host "     • $factor" -ForegroundColor Red
                }
            }
            
            # Show keywords found
            if ($data.meta_data.keywords -and $data.meta_data.keywords.Count -gt 0) {
                Write-Host ""
                Write-Host "  🔍 PHISHING KEYWORDS FOUND:" -ForegroundColor Yellow
                Write-Host "     " -NoNewline
                Write-Host ($data.meta_data.keywords -join ", ") -ForegroundColor Yellow
            }
            
            # Show threat types
            if ($data.meta_data.threat_types -and $data.meta_data.threat_types.Count -gt 0) {
                Write-Host ""
                Write-Host "  🚨 THREAT TYPES:" -ForegroundColor Red
                Write-Host "     " -NoNewline
                Write-Host ($data.meta_data.threat_types -join ", ") -ForegroundColor Red
            }
            
            # Show AI explanation (first 150 chars)
            if ($data.ai_explanation -and $data.ai_explanation.text) {
                Write-Host ""
                Write-Host "  🤖 AI ANALYSIS:" -ForegroundColor Cyan
                $explanation = $data.ai_explanation.text
                if ($explanation.Length -gt 150) {
                    $explanation = $explanation.Substring(0, 150) + "..."
                }
                Write-Host "     $explanation" -ForegroundColor White
                Write-Host "     Generated by: $($data.ai_explanation.generated_by)" -ForegroundColor Gray
            }
            
            $passedTests++
            Write-Host ""
            Write-Host "  ✅ Test Completed Successfully" -ForegroundColor Green
        }
        else {
            Write-Host "  ❌ Error: $($result.message)" -ForegroundColor Red
            $failedTests++
        }
    }
    catch {
        Write-Host "  ❌ Test Failed: $_" -ForegroundColor Red
        $failedTests++
    }
    
    Write-Host ""
    Write-Host "─────────────────────────────────────────────────────────────" -ForegroundColor DarkGray
    Write-Host ""
    
    # Small delay between tests
    Start-Sleep -Milliseconds 500
}

# Summary
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   📊 TEST SUMMARY" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Total Tests:    $totalTests" -ForegroundColor White
Write-Host "  Passed:         " -NoNewline
Write-Host $passedTests -ForegroundColor Green
Write-Host "  Failed:         " -NoNewline
Write-Host $failedTests -ForegroundColor $(if($failedTests -eq 0){"Green"}else{"Red"})
Write-Host ""

if ($passedTests -eq $totalTests) {
    Write-Host "  🎉 ALL TESTS PASSED!" -ForegroundColor Green
    Write-Host "  Your phishing detection system is working perfectly!" -ForegroundColor Green
} elseif ($passedTests -gt 0) {
    Write-Host "  ⚠️  SOME TESTS FAILED" -ForegroundColor Yellow
    Write-Host "  Check the errors above and ensure backend is running" -ForegroundColor Yellow
} else {
    Write-Host "  ❌ ALL TESTS FAILED" -ForegroundColor Red
    Write-Host "  Is your backend server running on port 5000?" -ForegroundColor Red
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
