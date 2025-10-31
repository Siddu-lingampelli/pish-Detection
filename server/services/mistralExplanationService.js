import { Mistral } from '@mistralai/mistralai';

class MistralExplanationService {
  constructor() {
    this.client = null;
    this.isEnabled = false;
    
    // Initialize Mistral client if API key exists
    if (process.env.MISTRAL_API_KEY && process.env.MISTRAL_API_KEY !== 'your_mistral_api_key_here') {
      try {
        this.client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });
        this.isEnabled = true;
        console.log('✅ Mistral AI enabled for explanations');
      } catch (error) {
        console.error('❌ Mistral AI initialization failed:', error.message);
        this.isEnabled = false;
      }
    } else {
      console.log('⚠️ Mistral AI not configured (explanations disabled)');
    }
  }

  /**
   * Generate AI explanation for phishing detection result
   */
  async generateExplanation(url, detectionResult) {
    // If Mistral is not enabled, return a basic explanation
    if (!this.isEnabled) {
      return this.generateBasicExplanation(url, detectionResult);
    }

    try {
      const prompt = this.buildPrompt(url, detectionResult);
      
      const response = await this.client.chat.complete({
        model: 'mistral-tiny', // Using the smallest/cheapest model
        messages: [
          {
            role: 'system',
            content: 'You are a cybersecurity expert explaining phishing detection results to non-technical users. Be clear, concise, and educational. Keep responses under 150 words.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3, // Lower temperature for more focused responses
        max_tokens: 250
      });

      const explanation = response.choices[0]?.message?.content || this.generateBasicExplanation(url, detectionResult);
      
      return {
        explanation: explanation,
        generated_by: 'Mistral AI',
        model: 'mistral-tiny'
      };

    } catch (error) {
      console.error('Mistral API error:', error.message);
      // Fallback to basic explanation
      return {
        explanation: this.generateBasicExplanation(url, detectionResult),
        generated_by: 'Fallback',
        error: 'AI explanation temporarily unavailable'
      };
    }
  }

  /**
   * Build prompt for Mistral AI
   */
  buildPrompt(url, detectionResult) {
    const { result, confidence_score, meta_data } = detectionResult;
    
    let prompt = `Analyze this URL for phishing:\n\n`;
    prompt += `URL: ${url}\n`;
    prompt += `Detection Result: ${result}\n`;
    prompt += `Confidence Score: ${(confidence_score * 100).toFixed(1)}%\n\n`;

    if (meta_data.risk_factors && meta_data.risk_factors.length > 0) {
      prompt += `Risk Factors Detected:\n`;
      meta_data.risk_factors.forEach(factor => {
        prompt += `- ${factor}\n`;
      });
      prompt += `\n`;
    }

    if (meta_data.keywords && meta_data.keywords.length > 0) {
      prompt += `Phishing Keywords Found: ${meta_data.keywords.join(', ')}\n\n`;
    }

    if (meta_data.threat_types && meta_data.threat_types.length > 0) {
      prompt += `Threat Types: ${meta_data.threat_types.join(', ')}\n\n`;
    }

    prompt += `Explain in simple terms:\n`;
    prompt += `1. Why this URL is classified as "${result}"\n`;
    prompt += `2. What tactics the attackers might be using\n`;
    prompt += `3. What users should do to stay safe\n`;

    return prompt;
  }

  /**
   * Generate basic explanation without AI (fallback)
   */
  generateBasicExplanation(url, detectionResult) {
    const { result, meta_data } = detectionResult;
    
    let explanation = '';

    switch (result) {
      case 'Phishing':
        explanation = `🚨 This URL is highly likely to be a phishing attempt. `;
        
        if (meta_data.threat_types && meta_data.threat_types.length > 0) {
          explanation += `It has been identified as containing ${meta_data.threat_types.join(' and ')} threats. `;
        }
        
        if (meta_data.keywords && meta_data.keywords.length > 0) {
          explanation += `The URL contains suspicious keywords like "${meta_data.keywords.slice(0, 3).join('", "')}" which are commonly used in phishing attacks. `;
        }
        
        explanation += `DO NOT visit this site or enter any personal information. `;
        explanation += `Legitimate companies never ask you to verify account details through suspicious links.`;
        break;

      case 'Suspicious':
        explanation = `⚠️ This URL shows several suspicious characteristics. `;
        
        if (!meta_data.has_ssl) {
          explanation += `It lacks HTTPS encryption, meaning your data would be transmitted insecurely. `;
        }
        
        if (meta_data.risk_factors && meta_data.risk_factors.length > 0) {
          const mainRisk = meta_data.risk_factors[0];
          explanation += `Key concern: ${mainRisk}. `;
        }
        
        explanation += `Exercise caution before visiting this site. `;
        explanation += `Verify the URL matches the official website of the service you're trying to access. `;
        explanation += `When in doubt, navigate to the site directly rather than clicking links.`;
        break;

      case 'Legit':
        explanation = `✅ This URL appears to be legitimate and safe to visit. `;
        
        if (meta_data.has_ssl) {
          explanation += `It uses HTTPS encryption to protect your data. `;
        }
        
        explanation += `However, always practice safe browsing: verify you typed the URL correctly, `;
        explanation += `look for the padlock icon in your browser, and never share sensitive information `;
        explanation += `unless you're absolutely certain of the website's authenticity.`;
        break;

      default:
        explanation = `This URL has been analyzed for potential security threats. `;
        explanation += `Always be cautious when clicking links from unknown sources.`;
    }

    return explanation;
  }

  /**
   * Generate safety tips based on result
   */
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

export default new MistralExplanationService();
