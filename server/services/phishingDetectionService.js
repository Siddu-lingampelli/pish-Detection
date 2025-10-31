import axios from 'axios';
import { URL } from 'url';
import urlscanService from './urlscanService.js';

// Phishing keywords that commonly appear in phishing URLs
// Includes India-specific payment systems and banking keywords
const PHISHING_KEYWORDS = [
  'login', 'verify', 'account', 'update', 'secure', 'banking', 'confirm',
  'password', 'signin', 'suspend', 'restrict', 'security', 'paypal',
  'ebay', 'amazon', 'microsoft', 'apple', 'google', 'netflix', 'wallet',
  'crypto', 'bitcoin', 'blockchain', 'reward', 'prize', 'free', 'gift',
  // India-specific keywords for UPI and digital payment detection
  'upi', 'paytm', 'phonepe', 'googlepay', 'gpay', 'bhim', 'mobikwik',
  'sbi', 'icici', 'hdfc', 'axis', 'pnb', 'kotak', 'indusind',
  'aadhaar', 'aadhar', 'pan', 'kyc', 'otp', 'mpin', 'tpin',
  'netbanking', 'imps', 'neft', 'rtgs', 'ifsc'
];

// Suspicious TLDs
const SUSPICIOUS_TLDS = [
  '.tk', '.ml', '.ga', '.cf', '.gq', '.xyz', '.top', '.work', '.click',
  '.link', '.download', '.racing', '.webcam', '.date', '.stream'
];

class PhishingDetectionService {
  
  /**
   * Main detection method that combines multiple detection strategies
   */
  async detectPhishing(url) {
    const startTime = Date.now();
    
    try {
      // Validate URL format
      if (!this.isValidURL(url)) {
        return {
          result: 'Suspicious',
          confidence_score: 0.5,
          meta_data: {
            risk_factors: ['Invalid URL format'],
            has_ssl: false
          },
          scan_duration: Date.now() - startTime
        };
      }

      // Parse URL
      const parsedUrl = new URL(url);
      
      // Initialize detection results
      let detectionResults = {
        url: url,
        result: 'Legit',
        confidence_score: 0.1,
        meta_data: {
          has_ssl: parsedUrl.protocol === 'https:',
          keywords: [],
          threat_types: [],
          risk_factors: [],
          domain_length: parsedUrl.hostname.length,
          has_suspicious_chars: false
        },
        scan_duration: 0
      };

      // Run multiple detection methods
      const urlAnalysis = this.analyzeURLStructure(parsedUrl);
      const keywordAnalysis = this.detectPhishingKeywords(url);
      
      // Try Google Safe Browsing API (if API key exists)
      let safeBrowsingResult = null;
      if (process.env.GOOGLE_SAFE_BROWSING_API_KEY && 
          process.env.GOOGLE_SAFE_BROWSING_API_KEY !== 'your_api_key_here') {
        safeBrowsingResult = await this.checkGoogleSafeBrowsing(url);
      }

      // Try VirusTotal API (if API key exists)
      let virusTotalResult = null;
      if (process.env.VIRUSTOTAL_API_KEY && 
          process.env.VIRUSTOTAL_API_KEY !== 'your_api_key_here') {
        virusTotalResult = await this.checkVirusTotal(url);
      }

      // Try URLScan.io API (if API key exists) - Quick scan, don't wait
      let urlscanResult = null;
      if (process.env.URLSCAN_API_KEY && 
          process.env.URLSCAN_API_KEY !== 'your_api_key_here') {
        urlscanResult = await this.checkURLScan(url);
      }

      // Combine all detection results
      detectionResults = this.combineDetectionResults(
        detectionResults,
        urlAnalysis,
        keywordAnalysis,
        safeBrowsingResult,
        virusTotalResult,
        urlscanResult
      );

      detectionResults.scan_duration = Date.now() - startTime;
      
      return detectionResults;
      
    } catch (error) {
      console.error('Detection error:', error.message);
      return {
        result: 'Suspicious',
        confidence_score: 0.5,
        meta_data: {
          risk_factors: ['Analysis error: ' + error.message],
          has_ssl: false
        },
        scan_duration: Date.now() - startTime
      };
    }
  }

  /**
   * Validate URL format
   */
  isValidURL(string) {
    try {
      const url = new URL(string);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
      return false;
    }
  }

  /**
   * Analyze URL structure for suspicious patterns
   */
  analyzeURLStructure(parsedUrl) {
    const riskFactors = [];
    let riskScore = 0;

    const hostname = parsedUrl.hostname.toLowerCase();
    const fullUrl = parsedUrl.href.toLowerCase();

    // Check for IP address in URL
    if (/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(hostname)) {
      riskFactors.push('Uses IP address instead of domain name');
      riskScore += 0.3;
    }

    // Check for suspicious TLDs
    const hasSuspiciousTLD = SUSPICIOUS_TLDS.some(tld => hostname.endsWith(tld));
    if (hasSuspiciousTLD) {
      riskFactors.push('Suspicious top-level domain');
      riskScore += 0.2;
    }

    // Check for @ symbol (often used to hide real domain)
    if (fullUrl.includes('@')) {
      riskFactors.push('Contains @ symbol in URL');
      riskScore += 0.3;
    }

    // Check for excessive subdomains
    const subdomainCount = hostname.split('.').length - 2;
    if (subdomainCount > 2) {
      riskFactors.push(`Excessive subdomains (${subdomainCount})`);
      riskScore += 0.15;
    }

    // Check for suspicious characters
    const suspiciousChars = /[-_]{2,}/.test(hostname);
    if (suspiciousChars) {
      riskFactors.push('Contains suspicious character patterns');
      riskScore += 0.1;
    }

    // Check domain length
    if (hostname.length > 50) {
      riskFactors.push('Unusually long domain name');
      riskScore += 0.1;
    }

    // Check for homograph attacks (look-alike characters)
    if (/[а-яА-Я]/.test(hostname)) { // Cyrillic characters
      riskFactors.push('Contains look-alike characters (potential homograph attack)');
      riskScore += 0.4;
    }

    // Check for HTTPS
    if (parsedUrl.protocol !== 'https:') {
      riskFactors.push('No HTTPS/SSL encryption');
      riskScore += 0.15;
    }

    return {
      riskFactors,
      riskScore: Math.min(riskScore, 1),
      has_suspicious_chars: suspiciousChars
    };
  }

  /**
   * Detect phishing keywords in URL
   */
  detectPhishingKeywords(url) {
    const lowerUrl = url.toLowerCase();
    const foundKeywords = [];
    let keywordScore = 0;

    PHISHING_KEYWORDS.forEach(keyword => {
      if (lowerUrl.includes(keyword)) {
        foundKeywords.push(keyword);
        keywordScore += 0.05;
      }
    });

    // Multiple keywords increase suspicion
    if (foundKeywords.length > 2) {
      keywordScore += 0.2;
    }

    return {
      keywords: foundKeywords,
      keywordScore: Math.min(keywordScore, 0.5)
    };
  }

  /**
   * Check URL against Google Safe Browsing API
   */
  async checkGoogleSafeBrowsing(url) {
    try {
      const apiKey = process.env.GOOGLE_SAFE_BROWSING_API_KEY;
      const apiUrl = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`;

      const requestBody = {
        client: {
          clientId: "phishing-detection-system",
          clientVersion: "1.0.0"
        },
        threatInfo: {
          threatTypes: ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE", "POTENTIALLY_HARMFUL_APPLICATION"],
          platformTypes: ["ANY_PLATFORM"],
          threatEntryTypes: ["URL"],
          threatEntries: [{ url: url }]
        }
      };

      const response = await axios.post(apiUrl, requestBody, {
        timeout: 5000
      });

      if (response.data.matches && response.data.matches.length > 0) {
        return {
          isThreat: true,
          threatTypes: response.data.matches.map(match => match.threatType),
          score: 0.9,
          source: 'Google Safe Browsing'
        };
      }

      return {
        isThreat: false,
        threatTypes: [],
        score: 0,
        source: 'Google Safe Browsing'
      };

    } catch (error) {
      console.error('Google Safe Browsing API error:', error.message);
      return null;
    }
  }

  /**
   * Check URL against VirusTotal API
   */
  async checkVirusTotal(url) {
    try {
      const apiKey = process.env.VIRUSTOTAL_API_KEY;
      
      // VirusTotal v3 API - URL scan
      const urlId = Buffer.from(url).toString('base64').replace(/=/g, '');
      const apiUrl = `https://www.virustotal.com/api/v3/urls/${urlId}`;

      const response = await axios.get(apiUrl, {
        headers: {
          'x-apikey': apiKey
        },
        timeout: 5000
      });

      const data = response.data.data;
      const stats = data.attributes.last_analysis_stats;
      
      // Calculate threat score based on detections
      const totalEngines = stats.malicious + stats.suspicious + stats.harmless + stats.undetected;
      const maliciousCount = stats.malicious + stats.suspicious;
      const threatScore = totalEngines > 0 ? maliciousCount / totalEngines : 0;

      if (maliciousCount > 0) {
        return {
          isThreat: true,
          threatTypes: ['MALICIOUS'],
          score: Math.min(threatScore * 2, 1), // Amplify score
          maliciousCount,
          totalEngines,
          source: 'VirusTotal'
        };
      }

      return {
        isThreat: false,
        threatTypes: [],
        score: 0,
        maliciousCount: 0,
        totalEngines,
        source: 'VirusTotal'
      };

    } catch (error) {
      // If URL not found in VirusTotal, try to submit it
      if (error.response && error.response.status === 404) {
        console.log('URL not in VirusTotal database, submitting for analysis...');
        await this.submitToVirusTotal(url);
      } else {
        console.error('VirusTotal API error:', error.message);
      }
      return null;
    }
  }

  /**
   * Check URLScan.io for website analysis
   */
  async checkURLScan(url) {
    try {
      console.log('🔍 Checking URLScan.io...');

      // Submit for quick scan (don't wait for results)
      const submission = await urlscanService.quickScan(url);

      if (!submission.success) {
        console.log('⚠️ URLScan.io submission failed:', submission.error);
        return null;
      }

      // Return submission info (results can be retrieved later)
      return {
        submitted: true,
        scanId: submission.scanId,
        resultUrl: submission.resultUrl,
        apiUrl: submission.apiUrl,
        message: 'Scan submitted. Results available in 10-30 seconds.',
        source: 'URLScan.io'
      };

    } catch (error) {
      console.error('URLScan.io error:', error.message);
      return null;
    }
  }

  /**
   * Submit URL to VirusTotal for scanning
   */
  async submitToVirusTotal(url) {
    try {
      const apiKey = process.env.VIRUSTOTAL_API_KEY;
      const apiUrl = 'https://www.virustotal.com/api/v3/urls';

      const formData = new URLSearchParams();
      formData.append('url', url);

      await axios.post(apiUrl, formData, {
        headers: {
          'x-apikey': apiKey,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        timeout: 5000
      });

      console.log('✅ URL submitted to VirusTotal for analysis');
    } catch (error) {
      console.error('VirusTotal submission error:', error.message);
    }
  }

  /**
   * Combine all detection results into final verdict
   */
  combineDetectionResults(base, urlAnalysis, keywordAnalysis, safeBrowsingResult, virusTotalResult, urlscanResult) {
    let totalScore = 0;
    const allRiskFactors = [];

    // Add URL structure analysis
    totalScore += urlAnalysis.riskScore;
    allRiskFactors.push(...urlAnalysis.riskFactors);
    base.meta_data.has_suspicious_chars = urlAnalysis.has_suspicious_chars;

    // Add keyword analysis
    totalScore += keywordAnalysis.keywordScore;
    base.meta_data.keywords = keywordAnalysis.keywords;
    if (keywordAnalysis.keywords.length > 0) {
      allRiskFactors.push(`Contains ${keywordAnalysis.keywords.length} phishing keyword(s)`);
    }

    // Add Safe Browsing result (high priority)
    if (safeBrowsingResult && safeBrowsingResult.isThreat) {
      totalScore += safeBrowsingResult.score;
      base.meta_data.threat_types = [...(base.meta_data.threat_types || []), ...safeBrowsingResult.threatTypes];
      allRiskFactors.push(`Flagged by ${safeBrowsingResult.source}`);
    }

    // Add VirusTotal result (high priority)
    if (virusTotalResult && virusTotalResult.isThreat) {
      totalScore += virusTotalResult.score;
      base.meta_data.threat_types = [...(base.meta_data.threat_types || []), ...virusTotalResult.threatTypes];
      allRiskFactors.push(`Detected by ${virusTotalResult.maliciousCount}/${virusTotalResult.totalEngines} engines (${virusTotalResult.source})`);
    }

    // Add URLScan.io result
    if (urlscanResult && urlscanResult.submitted) {
      base.meta_data.urlscan = {
        scanId: urlscanResult.scanId,
        resultUrl: urlscanResult.resultUrl,
        message: urlscanResult.message
      };
      allRiskFactors.push('Submitted to URLScan.io for detailed analysis');
    }

    base.meta_data.risk_factors = allRiskFactors;

    // Determine final result based on score
    if (totalScore >= 0.7) {
      base.result = 'Phishing';
      base.confidence_score = Math.min(totalScore, 1);
    } else if (totalScore >= 0.3) {
      base.result = 'Suspicious';
      base.confidence_score = totalScore;
    } else {
      base.result = 'Legit';
      base.confidence_score = 1 - totalScore;
    }

    return base;
  }
}

export default new PhishingDetectionService();
