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
      baseScore += analysisResults.linksFound.length > 3 ? 15 : 0;
      baseScore += senderRisk.isSuspicious ? 25 : 0;

      analysisResults.riskScore = Math.min(Math.max(analysisResults.riskScore, baseScore), 100);

      if (analysisResults.riskScore >= 70) {
        analysisResults.riskLevel = 'HIGH';
      } else if (analysisResults.riskScore >= 40) {
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

  detectSuspiciousKeywords(emailContent, subject) {
    const suspiciousPatterns = [
      'verify your account', 'confirm your identity', 'suspended account',
      'unusual activity', 'security alert', 'immediate action', 'urgent',
      'click here', 'act now', 'limited time', 'expires today',
      'update payment', 'billing problem', 'refund', 'prize', 'winner',
      'congratulations', 'claim now', 'free money', 'tax refund',
      'ssn', 'social security', 'credit card', 'cvv', 'pin number',
      'wire transfer', 'bitcoin', 'cryptocurrency', 'invest now'
    ];

    const found = [];
    const fullText = `${subject} ${emailContent}`.toLowerCase();
    suspiciousPatterns.forEach(p => { if (fullText.includes(p)) found.push(p); });
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
    const freeDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
    const domain = email.split('@')[1];
    if (freeDomains.includes(domain)) {
      const username = email.split('@')[0];
      if (username.includes('support') || username.includes('service') || username.includes('admin')) {
        result.isSuspicious = true;
        result.reasons.push('Business-looking address using free email provider');
      }
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
        model: 'gpt-oss-120b',
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
      recommendations.push('Email appears relatively safe');
      recommendations.push('Still verify sender if requesting sensitive actions');
      recommendations.push('Be cautious with any links or attachments');
    }
    if (analysis.linksFound.length > 0) {
      recommendations.push('Hover over links to preview URLs before clicking');
    }
    return recommendations;
  }
}

export default new EmailAnalysisService();
