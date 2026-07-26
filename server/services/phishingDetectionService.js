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

// Legitimate brand domains for typosquatting detection
const LEGITIMATE_BRANDS = [
  'google', 'facebook', 'microsoft', 'apple', 'amazon', 'netflix', 'paypal',
  'instagram', 'twitter', 'linkedin', 'ebay', 'yahoo', 'adobe', 'spotify',
  'dropbox', 'github', 'whatsapp', 'zoom', 'slack', 'reddit', 'wikipedia',
  // Banking
  'chase', 'wellsfargo', 'bankofamerica', 'citibank', 'hsbc', 'barclays',
  // Indian banks and payment
  'paytm', 'phonepe', 'googlepay', 'bhim', 'sbi', 'icici', 'hdfc', 'axis', 'kotak'
];

/**
 * Calculate Levenshtein distance between two strings (memory-efficient)
 */
function levenshteinDistance(str1, str2) {
  const len1 = str1.length;
  const len2 = str2.length;
  if (len1 === 0) return len2;
  if (len2 === 0) return len1;

  let prev = new Array(len2 + 1);
  let curr = new Array(len2 + 1);
  for (let j = 0; j <= len2; j++) prev[j] = j;

  for (let i = 1; i <= len1; i++) {
    curr[0] = i;
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
    }
    [prev, curr] = [curr, prev];
  }
  return prev[len2];
}

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
      if (process.env.GOOGLE_SAFE_BROWSING_API_KEY) {
        safeBrowsingResult = await this.checkGoogleSafeBrowsing(url);
      }

      // Try VirusTotal API (if API key exists)
      let virusTotalResult = null;
      if (process.env.VIRUSTOTAL_API_KEY) {
        virusTotalResult = await this.checkVirusTotal(url);
      }

      // Try URLScan.io API (if API key exists) - Scan and wait for results
      let urlscanResult = null;
      if (process.env.URLSCAN_API_KEY) {
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
      console.error('Detection error:', error?.message || 'unknown');
      return {
        result: 'Suspicious',
        confidence_score: 0.5,
        meta_data: {
          risk_factors: ['Analysis error'],
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

    // Extract domain name without TLD for typosquatting check
    const domainParts = hostname.split('.');
    const mainDomain = domainParts.length >= 2 ? domainParts[domainParts.length - 2] : hostname;

    // Check for typosquatting (misspelled brand names)
    const typosquattingCheck = this.checkTyposquatting(mainDomain);
    if (typosquattingCheck.isTyposquatting) {
      riskFactors.push(`Potential typosquatting: Similar to "${typosquattingCheck.similarTo}"`);
      riskScore += 0.6; // High risk for typosquatting
    }

    // Check for IP address in URL
    if (/^(?:\d{1,3}\.){3}\d{1,3}$/.test(hostname)) {
      riskFactors.push('Uses IP address instead of domain name');
      riskScore += 0.3;
    }

    // Check for suspicious TLDs (free/abuse-prone domains)
    const hasSuspiciousTLD = SUSPICIOUS_TLDS.some(tld => hostname.endsWith(tld));
    if (hasSuspiciousTLD) {
      riskFactors.push('Suspicious top-level domain');
      riskScore += 0.35;
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
    // Detect non-ASCII characters (Cyrillic, Greek, etc. used to spoof Latin)
    const hasNonAscii = /[^\x00-\x7F]/.test(hostname);
    if (hasNonAscii) {
      riskFactors.push('Contains non-ASCII characters (potential homograph attack)');
      riskScore += 0.4;
    }

    // Check for HTTPS
    if (parsedUrl.protocol !== 'https:') {
      riskFactors.push('No HTTPS/SSL encryption');
      riskScore += 0.25;
    }

    return {
      riskFactors,
      riskScore: Math.min(riskScore, 1),
      has_suspicious_chars: suspiciousChars
    };
  }

  /**
   * Check for typosquatting attempts (misspelled brand domains)
   */
  checkTyposquatting(domain) {
    if (!domain || domain.length < 3) {
      return { isTyposquatting: false, similarTo: null, distance: 0 };
    }
    let cleanDomain = domain.replace(/^(www|m|mobile|secure|login|account|verify)[-.]?/, '');
    cleanDomain = cleanDomain.replace(/[-_]?(login|secure|verify|account|portal|online|bank|pay)$/, '');
    if (!cleanDomain || cleanDomain.length < 3) {
      return { isTyposquatting: false, similarTo: null, distance: 0 };
    }

    for (const brand of LEGITIMATE_BRANDS) {
      if (cleanDomain === brand) continue;

      const distance = levenshteinDistance(cleanDomain, brand);
      const maxLength = Math.max(cleanDomain.length, brand.length);

      // Close match (1-2 char difference) — catches transpositions, single substitution
      if (distance <= 2 && distance > 0 && maxLength >= 4) {
        return { isTyposquatting: true, similarTo: brand, distance };
      }

      // For short brands (3-4 chars), require distance=1 and length match
      if (maxLength < 4 && distance === 1 && Math.abs(cleanDomain.length - brand.length) <= 1) {
        return { isTyposquatting: true, similarTo: brand, distance };
      }

      // Substring inclusion: domain contains brand but has extra leading/trailing chars
      if (cleanDomain.length > brand.length && cleanDomain.includes(brand) && cleanDomain.length - brand.length <= 3) {
        return { isTyposquatting: true, similarTo: brand, distance: cleanDomain.length - brand.length };
      }

      // Brand with common prefix/suffix (e.g. "support-appleid", "applelogin")
      if (cleanDomain.includes(brand) && cleanDomain.length - brand.length <= 12) {
        const brandIdx = cleanDomain.indexOf(brand);
        const prefix = cleanDomain.slice(0, brandIdx).replace(/[-_.]/g, '');
        const suffix = cleanDomain.slice(brandIdx + brand.length).replace(/[-_.]/g, '');
        const isPrefixed = prefix.length > 0 && /^(help|support|login|sign|account|verify|secure|my|app|online|portal|service|info|official|home|id|manage|update|confirm|reset|chat|mail|web|shop|buy|pay|payment|track|order|check|bill|invoice)$/i.test(prefix);
        const isSuffixed = suffix.length > 0 && /^(help|support|login|sign|account|verify|secure|app|online|portal|service|info|id|manage|update|confirm|reset|chat|mail|pay|payment|track|order|check|bill|invoice)$/i.test(suffix);
        if (isPrefixed || isSuffixed) {
          return { isTyposquatting: true, similarTo: brand, distance: cleanDomain.length - brand.length };
        }
      }

      // Reverse: brand contains domain — only flag if exactly 1 char missing
      if (brand.length > cleanDomain.length && brand.includes(cleanDomain) && brand.length - cleanDomain.length === 1) {
        return { isTyposquatting: true, similarTo: brand, distance: 1 };
      }
    }

    return { isTyposquatting: false, similarTo: null, distance: 0 };
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
      keywordScore += 0.3;
    }

    return {
      keywords: foundKeywords,
      keywordScore: Math.min(keywordScore, 0.6)
    };
  }

  /**
   * Check URL against Google Safe Browsing API
   */
  async checkGoogleSafeBrowsing(url) {
    try {
      const apiKey = process.env.GOOGLE_SAFE_BROWSING_API_KEY;
      const apiUrl = 'https://safebrowsing.googleapis.com/v4/threatMatches:find';

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
        params: { key: apiKey },
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
      console.error('Google Safe Browsing API error:', error?.response?.status || error?.message || 'unknown');
      return null;
    }
  }

  /**
   * Check URL against VirusTotal API
   */
  async checkVirusTotal(url) {
    try {
      const apiKey = process.env.VIRUSTOTAL_API_KEY;
      
      const urlId = Buffer.from(url).toString('base64url').replace(/=+$/, '');
      const apiUrl = `https://www.virustotal.com/api/v3/urls/${urlId}`;

      const response = await axios.get(apiUrl, {
        headers: {
          'x-apikey': apiKey
        },
        timeout: 5000
      });

      const data = response.data?.data;
      const stats = data?.attributes?.last_analysis_stats;
      if (!stats) {
        return { isThreat: false, threatTypes: [], score: 0, source: 'VirusTotal' };
      }
      const totalEngines = (stats.malicious || 0) + (stats.suspicious || 0) + (stats.harmless || 0) + (stats.undetected || 0);
      const maliciousCount = (stats.malicious || 0) + (stats.suspicious || 0);
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
        console.error('VirusTotal API error:', error?.response?.status || error?.message || 'unknown');
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

      // Try to scan and wait briefly (max 2 retries = ~10s wait)
      const result = await urlscanService.scanAndWait(url, 2, 5000);

      if (!result.success) {
        if (result.timeout) {
          console.log('⏳ URLScan.io scan still processing, returning deferral');
          return {
            submitted: true,
            scanId: result.scanId,
            resultUrl: `https://urlscan.io/result/${result.scanId}/`,
            apiUrl: result.submission?.apiUrl,
            message: 'Scan submitted. Results available at URLScan.io.',
            source: 'URLScan.io'
          };
        }
        console.log('⚠️ URLScan.io submission failed:', result.error);
        return null;
      }

      // Results ready — use structured analysis from getResults
      const isMalicious = result.malicious || result.indicators?.some(i => i.severity === 'high');
      const isSuspicious = result.indicators?.some(i => i.severity === 'medium');

      console.log(`✅ URLScan.io analysis complete: ${result.indicators?.length || 0} indicators, malicious=${isMalicious}`);

      return {
        submitted: true,
        isThreat: isMalicious,
        score: isMalicious ? 0.5 : isSuspicious ? 0.2 : 0,
        scanId: result.scanId,
        resultUrl: result.reportUrl || `https://urlscan.io/result/${result.scanId}/`,
        indicators: result.indicators || [],
        source: 'URLScan.io'
      };

    } catch (error) {
      console.error('URLScan.io error:', error?.response?.status || error?.message || 'unknown');
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
      console.error('VirusTotal submission error:', error?.response?.status || error?.message || 'unknown');
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
    if (urlscanResult) {
      if (urlscanResult.isThreat) {
        totalScore += urlscanResult.score;
        base.meta_data.threat_types = [...(base.meta_data.threat_types || []), ...(urlscanResult.indicators?.map(i => i.type.toUpperCase()) || ['MALICIOUS'])];
        allRiskFactors.push(`Flagged malicious by URLScan.io (${urlscanResult.indicators?.length || 0} indicators)`);
      }
      base.meta_data.urlscan = {
        scanId: urlscanResult.scanId,
        resultUrl: urlscanResult.resultUrl,
        message: urlscanResult.scanId ? 'Full scan report available at URLScan.io' : urlscanResult.message
      };
      if (!urlscanResult.isThreat) {
        allRiskFactors.push('Checked with URLScan.io');
      }
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
