import cerebrasService from './cerebrasService.js';

class AIExplanationService {
  constructor() {
    this.fallback = null;
  }

  async generateExplanation(url, detectionResult) {
    if (!cerebrasService.isEnabled()) {
      return this.basicExplanation(url, detectionResult);
    }

    try {
      const prompt = this.buildPrompt(url, detectionResult);
      const explanation = await cerebrasService.chat({
        system: 'You are a cybersecurity expert explaining phishing detection results to non-technical users. Be clear, concise, and educational. Keep responses under 150 words.',
        user: prompt,
        model: 'gpt-oss-120b',
        temperature: 0.3,
        maxTokens: 350
      });
      return {
        explanation: String(explanation || '').slice(0, 4000),
        generated_by: 'Cerebras AI',
        model: 'gpt-oss-120b'
      };
    } catch (error) {
      console.error('Cerebras explanation error:', error?.message || 'unknown');
      return {
        explanation: this.basicExplanation(url, detectionResult),
        generated_by: 'Fallback',
        error: 'AI explanation temporarily unavailable'
      };
    }
  }

  buildPrompt(url, detectionResult) {
    const { result, confidence_score, meta_data } = detectionResult;
    let prompt = `Analyze this URL for phishing:\n\n`;
    prompt += `URL: ${url}\n`;
    prompt += `Detection Result: ${result}\n`;
    prompt += `Confidence Score: ${(confidence_score * 100).toFixed(1)}%\n\n`;

    if (meta_data?.risk_factors?.length) {
      prompt += `Risk Factors Detected:\n`;
      meta_data.risk_factors.forEach(f => { prompt += `- ${f}\n`; });
      prompt += `\n`;
    }
    if (meta_data?.keywords?.length) {
      prompt += `Phishing Keywords Found: ${meta_data.keywords.join(', ')}\n\n`;
    }
    if (meta_data?.threat_types?.length) {
      prompt += `Threat Types: ${meta_data.threat_types.join(', ')}\n\n`;
    }
    prompt += `Explain in simple terms:\n`;
    prompt += `1. Why this URL is classified as "${result}"\n`;
    prompt += `2. What tactics the attackers might be using\n`;
    prompt += `3. What users should do to stay safe\n`;
    return prompt;
  }

  basicExplanation(url, detectionResult) {
    const { result, meta_data = {} } = detectionResult;
    let explanation = '';

    switch (result) {
      case 'Phishing':
        explanation = `🚨 This URL is highly likely to be a phishing attempt. `;
        if (meta_data.threat_types?.length) {
          explanation += `It has been identified as containing ${meta_data.threat_types.join(' and ')} threats. `;
        }
        if (meta_data.keywords?.length) {
          explanation += `The URL contains suspicious keywords like "${meta_data.keywords.slice(0, 3).join('", "')}" which are commonly used in phishing attacks. `;
        }
        explanation += `DO NOT visit this site or enter any personal information. Legitimate companies never ask you to verify account details through suspicious links.`;
        break;

      case 'Suspicious':
        explanation = `⚠️ This URL shows several suspicious characteristics. `;
        if (!meta_data.has_ssl) {
          explanation += `It lacks HTTPS encryption, meaning your data would be transmitted insecurely. `;
        }
        if (meta_data.risk_factors?.length) {
          explanation += `Key concern: ${meta_data.risk_factors[0]}. `;
        }
        explanation += `Exercise caution before visiting this site. Verify the URL matches the official website of the service you're trying to access. When in doubt, navigate to the site directly rather than clicking links.`;
        break;

      case 'Legit':
        explanation = `✅ This URL appears to be legitimate and safe to visit. `;
        if (meta_data.has_ssl) {
          explanation += `It uses HTTPS encryption to protect your data. `;
        }
        explanation += `However, always practice safe browsing: verify you typed the URL correctly, look for the padlock icon in your browser, and never share sensitive information unless you're absolutely certain of the website's authenticity.`;
        break;

      default:
        explanation = `This URL has been analyzed for potential security threats. Always be cautious when clicking links from unknown sources.`;
    }

    return explanation;
  }

  generateSafetyTips(result) {
    const tips = {
      Phishing: [
        '❌ Do NOT click on this link',
        '❌ Do NOT enter any credentials',
        '❌ Do NOT download any files',
        '✅ Report this URL to authorities',
        '✅ Delete any emails containing this link',
        '✅ Warn others who may have received it'
      ],
      Suspicious: [
        '⚠️ Verify the URL carefully before visiting',
        '⚠️ Check if it matches the official website',
        '⚠️ Look for HTTPS and padlock icon',
        '✅ Type URLs directly instead of clicking links',
        '✅ Use a password manager to detect fake sites',
        '✅ Contact the company directly if unsure'
      ],
      Legit: [
        '✅ URL appears safe, but stay vigilant',
        '✅ Verify the padlock icon (HTTPS)',
        '✅ Check the full URL matches expectations',
        '✅ Use strong, unique passwords',
        '✅ Enable two-factor authentication',
        '✅ Keep your browser updated'
      ]
    };
    return tips[result] || tips.Suspicious;
  }
}

export default new AIExplanationService();
