import axios from 'axios';

class EmailAnalysisService {
  constructor() {
    this.openRouterApiKey = process.env.OPENROUTER_API_KEY;
    this.openRouterUrl = 'https://openrouter.ai/api/v1/chat/completions';
    this.model = 'openai/gpt-4o';
  }

  /**
   * Analyze email for phishing indicators
   */
  async analyzeEmail(emailContent, senderEmail = '', subject = '') {
    try {
      const analysisResults = {
        riskScore: 0,
        riskLevel: 'LOW',
        threats: [],
        suspiciousKeywords: [],
        linksFound: [],
        recommendations: [],
        aiAnalysis: ''
      };

      // Step 1: Extract links
      analysisResults.linksFound = this.extractLinks(emailContent);

      // Step 2: Detect suspicious keywords
      analysisResults.suspiciousKeywords = this.detectSuspiciousKeywords(emailContent, subject);

      // Step 3: Analyze sender email
      const senderRisk = this.analyzeSender(senderEmail);
      if (senderRisk.isSuspicious) {
        analysisResults.threats.push(...senderRisk.reasons);
      }

      // Step 4: Use GPT-4o for advanced analysis
      if (this.openRouterApiKey) {
        const aiResult = await this.analyzeWithAI(emailContent, senderEmail, subject);
        if (aiResult) {
          analysisResults.aiAnalysis = aiResult.analysis;
          analysisResults.riskScore = Math.max(analysisResults.riskScore, aiResult.riskScore);
          analysisResults.threats.push(...aiResult.threats);
        }
      }

      // Step 5: Calculate base risk score
      let baseScore = 0;
      baseScore += analysisResults.suspiciousKeywords.length * 5;
      baseScore += analysisResults.linksFound.length > 3 ? 15 : 0;
      baseScore += senderRisk.isSuspicious ? 25 : 0;

      analysisResults.riskScore = Math.min(Math.max(analysisResults.riskScore, baseScore), 100);

      // Determine risk level
      if (analysisResults.riskScore >= 70) {
        analysisResults.riskLevel = 'HIGH';
      } else if (analysisResults.riskScore >= 40) {
        analysisResults.riskLevel = 'MEDIUM';
      } else {
        analysisResults.riskLevel = 'LOW';
      }

      // Generate recommendations
      analysisResults.recommendations = this.generateRecommendations(analysisResults);

      return analysisResults;

    } catch (error) {
      console.error('Email analysis error:', error);
      throw error;
    }
  }

  /**
   * Extract URLs from email content
   */
  extractLinks(text) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const matches = text.match(urlRegex) || [];
    return [...new Set(matches)]; // Remove duplicates
  }

  /**
   * Detect suspicious phishing keywords
   */
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

    suspiciousPatterns.forEach(pattern => {
      if (fullText.includes(pattern)) {
        found.push(pattern);
      }
    });

    return found;
  }

  /**
   * Analyze sender email address
   */
  analyzeSender(senderEmail) {
    const result = {
      isSuspicious: false,
      reasons: []
    };

    if (!senderEmail) return result;

    const email = senderEmail.toLowerCase();

    // Check for suspicious patterns
    if (email.includes('noreply') && email.includes('paypal')) {
      result.isSuspicious = true;
      result.reasons.push('Suspicious sender: Mimics PayPal noreply address');
    }

    if (/\d{4,}/.test(email)) {
      result.isSuspicious = true;
      result.reasons.push('Sender email contains excessive numbers');
    }

    if (email.split('@')[0]?.length > 25) {
      result.isSuspicious = true;
      result.reasons.push('Unusually long email address');
    }

    // Check for free email providers pretending to be businesses
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

  /**
   * Analyze email using GPT-4o
   */
  async analyzeWithAI(emailContent, senderEmail, subject) {
    try {
      if (!this.openRouterApiKey) {
        return null;
      }

      const prompt = `You are a cybersecurity expert analyzing an email for phishing indicators.

Sender: ${senderEmail || 'Unknown'}
Subject: ${subject || 'No subject'}
Email Content:
${emailContent}

Analyze this email and provide:
1. Risk score (0-100)
2. List of specific threats found
3. Brief analysis (2-3 sentences)

Respond in JSON format:
{
  "riskScore": 75,
  "threats": ["Urgency tactics", "Requests personal info"],
  "analysis": "This email shows typical phishing characteristics..."
}`;

      const response = await axios.post(
        this.openRouterUrl,
        {
          model: this.model,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 800,
          temperature: 0.3
        },
        {
          headers: {
            'Authorization': `Bearer ${this.openRouterApiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'http://localhost:3000',
            'X-Title': 'Phishing Detection Platform'
          },
          timeout: 20000
        }
      );

      const content = response.data.choices[0].message.content;

      // Parse JSON response
      let result;
      try {
        const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
        if (jsonMatch) {
          result = JSON.parse(jsonMatch[1]);
        } else {
          result = JSON.parse(content);
        }
      } catch {
        return null;
      }

      return result;

    } catch (error) {
      console.error('AI email analysis error:', error.response?.data || error.message);
      return null;
    }
  }

  /**
   * Generate security recommendations
   */
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
