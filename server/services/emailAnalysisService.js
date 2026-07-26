import cerebrasService from './cerebrasService.js';

class EmailAnalysisService {
  constructor() {}

  async analyzeEmail(emailContent, senderEmail = '', subject = '') {
    try {
      if (typeof emailContent !== 'string') {
        throw new Error('Invalid email content');
      }
      const analysisResults = {
        riskScore: 0,
        riskLevel: 'LOW',
        threats: [],
        suspiciousKeywords: [],
        linksFound: [],
        recommendations: [],
        aiAnalysis: ''
      };

      analysisResults.linksFound = this.extractLinks(emailContent);
      analysisResults.suspiciousKeywords = this.detectSuspiciousKeywords(emailContent, subject);
      const senderRisk = this.analyzeSender(senderEmail);
      if (senderRisk.isSuspicious) {
        analysisResults.threats.push(...senderRisk.reasons);
      }

      // Analyze each link for suspicious characteristics
      const linkIssues = [];
      for (const link of analysisResults.linksFound) {
        const issues = this.analyzeLink(link);
        linkIssues.push(...issues);
      }
      if (linkIssues.length > 0) {
        analysisResults.threats.push(...[...new Set(linkIssues)].slice(0, 5));
      }

      if (cerebrasService.isEnabled()) {
        const aiResult = await this.analyzeWithAI(emailContent, senderEmail, subject);
        if (aiResult) {
          analysisResults.aiAnalysis = aiResult.analysis;
          analysisResults.riskScore = Math.max(analysisResults.riskScore, aiResult.riskScore);
          analysisResults.threats.push(...aiResult.threats);
        }
      }

      let baseScore = 0;
      baseScore += analysisResults.suspiciousKeywords.length * 5;
      baseScore += analysisResults.linksFound.length > 3 ? 15 : analysisResults.linksFound.length > 0 ? 8 : 0;
      baseScore += senderRisk.isSuspicious ? 25 : 0;
      baseScore += linkIssues.length * 12;
      if (analysisResults.linksFound.some(l => l.startsWith('http://'))) baseScore += 10;

      analysisResults.riskScore = Math.min(Math.max(analysisResults.riskScore, baseScore), 100);

      if (analysisResults.riskScore >= 70) {
        analysisResults.riskLevel = 'HIGH';
      } else if (analysisResults.riskScore >= 30) {
        analysisResults.riskLevel = 'MEDIUM';
      } else {
        analysisResults.riskLevel = 'LOW';
      }

      analysisResults.recommendations = this.generateRecommendations(analysisResults);
      return analysisResults;
    } catch (error) {
      console.error('Email analysis error:', error);
      throw error;
    }
  }

  extractLinks(text) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const matches = text.match(urlRegex) || [];
    return [...new Set(matches)];
  }

  analyzeLink(url) {
    const issues = [];
    try {
      const parsed = new URL(url);
      const hostname = parsed.hostname.toLowerCase();

      if (parsed.protocol !== 'https:') issues.push('Non-HTTPS link');

      if (/^(?:\d{1,3}\.){3}\d{1,3}$/.test(hostname)) issues.push('IP address link');

      const suspiciousTLDs = ['.tk','.ml','.ga','.cf','.gq','.xyz','.top','.work','.click','.download','.review','.stream','.bid','.trade','.webcam','.science','.date','.racing','.win','.party','.loan','.men','.website','.space','.site','.live','.online','.tech'];
      const knownTLDs = ['com','org','net','edu','gov','mil','io','co','uk','de','jp','fr','au','ca','us','eu','ru','cn','in','br','it','es','nl','se','no','fi','dk','pl','be','at','ch','gr','ie','nz','sg','hk','kr','my','ph','th','vn','za','ar','cl','co','mx','pe','ae','il','sa','qa','ng','ke'];
      const parts = hostname.split('.');
      const rawTld = parts[parts.length - 1];
      const tld = '.' + rawTld;
      const domainName = parts.length >= 2 ? parts[parts.length - 2] : parts[0];

      if (suspiciousTLDs.includes(tld)) issues.push(`Suspicious TLD (${tld})`);

      const alphaNumName = domainName.replace(/[^a-z0-9]/gi, '');
      if (alphaNumName && alphaNumName.length >= 10 && /^[a-z]{10,}$/i.test(alphaNumName)) issues.push('Random-looking domain name');

      const knownBrands = ['paypal','google','microsoft','apple','amazon','netflix','facebook','instagram','linkedin','twitter','whatsapp','dropbox','adobe','samsung','alibaba','ebay','dhl','fedex','ups','icloud','steam','spotify','airbnb','uber'];
      if (domainName) {
        const cleanDomain = domainName.toLowerCase().replace(/[^a-z0-9]/g, '');
        for (const brand of knownBrands) {
          if (cleanDomain.includes(brand) && cleanDomain !== brand) {
            issues.push(`Suspicious: domain contains "${brand}"`);
            break;
          }
        }
      }

      if (parts.length > 4) issues.push('Excessive subdomains');
      if (hostname.length > 40) issues.push('Unusually long domain');
      if (/[^\x00-\x7F]/.test(hostname)) issues.push('Non-ASCII characters (homograph attack)');

      if (domainName && !knownTLDs.includes(rawTld) && !suspiciousTLDs.includes(tld) && parts.length === 2) {
        issues.push('Uncommon domain extension');
      }

    } catch { issues.push('Invalid URL format'); }
    return issues;
  }

  detectSuspiciousKeywords(emailContent, subject) {
    const suspiciousPatterns = [
      'verify your account', 'confirm your identity', 'suspended account',
      'unusual activity', 'security alert', 'immediate action', 'urgent',
      'click here', 'click the link', 'act now', 'limited time', 'expires today',
      'update payment', 'billing problem', 'refund', 'prize', 'winner',
      'congratulations', 'claim now', 'free money', 'tax refund',
      'ssn', 'social security', 'credit card', 'cvv', 'pin number',
      'wire transfer', 'bitcoin', 'cryptocurrency', 'invest now',
      'you have a', 'you won', 'selected you', 'you are the lucky',
      'exclusive offer', 'gift card', 'giveaway', 'surprise',
      'dear user', 'dear customer', 'dear valued', 'account has been',
      'temporarily locked', 'suspended', 'restricted', 'unusual sign-in',
      'unauthorized access', 'verify now', 'update your account',
      'confirm your account', 'reactivate', 'reactivate your',
      'login details', 'log in to', 'sign in to', 'your account will be',
      'click the link below', 'link below', 'copy and paste',
      'open the attachment', 'view the attachment',
      'sent from', 'shared a document', 'shared a file',
      'password reset', 'reset your password', 'change of password',
      'payment confirmation', 'invoice attached', 'purchase confirmation',
      'shipping confirmation', 'delivery notification',
      'you have a message', 'you have received', 'check this out',
      'free gift', 'free access', 'exclusive access', 'limited access'
    ];

    const found = [];
    const combined = `${subject} ${emailContent}`;
    const normalized = combined.toLowerCase().replace(/\s+/g, ' ').trim();
    suspiciousPatterns.forEach(p => { if (normalized.includes(p)) found.push(p); });

    const leetWords = ['u ', ' ur ', ' plz ', ' pwd ', ' pw ', ' btw ', ' thx '];
    const leetText = ' ' + normalized.replace(/[^a-z0-9 ]/g, '') + ' ';
    if (leetWords.some(w => leetText.includes(w))) {
      found.push('informal/abbreviated language');
    }

    const wordCount = normalized.split(/\s+/).length;
    if (found.length === 0 && wordCount < 20) {
      if (/\b(link|click|login|account|password|verify|update|confirm|secure|bank|payment|access|limited|restricted)\b/.test(normalized)) {
        found.push('suspicious context (short message with trigger words)');
      }
    }

    return found;
  }

  analyzeSender(senderEmail) {
    const result = { isSuspicious: false, reasons: [] };
    if (!senderEmail) return result;

    const email = senderEmail.toLowerCase();
    if (email.includes('noreply') && email.includes('paypal')) {
      result.isSuspicious = true;
      result.reasons.push('Suspicious sender: Mimics PayPal noreply address');
    }
    if (/\d{4,}/.test(email.split('@')[0] || '')) {
      result.isSuspicious = true;
      result.reasons.push('Sender email contains excessive numbers');
    }
    if (email.split('@')[0]?.length > 25) {
      result.isSuspicious = true;
      result.reasons.push('Unusually long email address');
    }
    const freeDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com', 'mail.com', 'protonmail.com', 'tutanota.com'];
    const domain = email.split('@')[1];
    const username = email.split('@')[0];
    if (freeDomains.includes(domain)) {
      if (username.includes('support') || username.includes('service') || username.includes('admin')) {
        result.isSuspicious = true;
        result.reasons.push('Business-looking address using free email provider');
      }
    }
    if (/^[a-z]+\d{3,}$/i.test(username)) {
      result.isSuspicious = true;
      result.reasons.push('Email has auto-generated pattern (letters + trailing digits)');
    }
    return result;
  }

  async analyzeWithAI(emailContent, senderEmail, subject) {
    try {
      const prompt = `You are a cybersecurity expert analyzing an email for phishing indicators.

Sender: ${senderEmail || 'Unknown'}
Subject: ${subject || 'No subject'}
Email Content:
${emailContent}

Analyze this email and provide:
1. Risk score (0-100)
2. List of specific threats found
3. Brief analysis (2-3 sentences)

Respond ONLY with valid JSON (no markdown):
{
  "riskScore": 75,
  "threats": ["Urgency tactics", "Requests personal info"],
  "analysis": "This email shows typical phishing characteristics..."
}`;

      const raw = await cerebrasService.completeJson({
        system: 'You are a cybersecurity analyst. Always output valid JSON.',
        user: prompt,
        temperature: 0.2,
        maxTokens: 800
      });

      if (!raw) return null;

      return {
        riskScore: Math.max(0, Math.min(100, Number(raw.riskScore) || 0)),
        threats: Array.isArray(raw.threats) ? raw.threats.map(String).slice(0, 50) : [],
        analysis: typeof raw.analysis === 'string' ? raw.analysis.slice(0, 5000) : ''
      };
    } catch (error) {
      console.error('Cerebras email analysis error:', error?.response?.status || error?.message || 'unknown');
      return null;
    }
  }

  generateRecommendations(analysis) {
    const recommendations = [];
    if (analysis.riskScore >= 70) {
      recommendations.push('DO NOT click any links or download attachments');
      recommendations.push('DO NOT reply to this email');
      recommendations.push('Delete this email immediately');
      recommendations.push('Report as phishing to your email provider');
    } else if (analysis.riskScore >= 40) {
      recommendations.push('Verify sender identity through official channels');
      recommendations.push('Do not click links - visit website directly');
      recommendations.push('Look for grammar/spelling errors');
      recommendations.push('Check if email is personalized to you');
    } else {
      if (analysis.riskScore > 15) {
        recommendations.push('Some suspicious signals detected - verify before trusting');
        recommendations.push('Do not click links unless sender is verified');
      } else {
        recommendations.push('Email appears relatively safe');
      }
      recommendations.push('Be cautious with any links or attachments');
    }
    if (analysis.linksFound.length > 0) {
      recommendations.push('Hover over links to preview URLs before clicking');
    }
    return recommendations;
  }
}

export default new EmailAnalysisService();
