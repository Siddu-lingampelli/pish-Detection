import axios from 'axios';
import fs from 'fs/promises';

class VisionAnalysisService {
  constructor() {
    this.openRouterApiKey = process.env.OPENROUTER_API_KEY;
    this.openRouterUrl = 'https://openrouter.ai/api/v1/chat/completions';
    this.model = 'openai/gpt-4o'; // GPT-4o with vision
  }

  /**
   * Analyze screenshot using GPT-4o Vision
   */
  async analyzeScreenshotWithVision(imageBuffer) {
    try {
      if (!this.openRouterApiKey) {
        console.log('⚠️  OpenRouter API key not configured, falling back to basic analysis');
        return null;
      }

      console.log('🔍 Analyzing screenshot with GPT-4o Vision...');

      // Convert buffer to base64
      const base64Image = imageBuffer.toString('base64');
      const mimeType = 'image/jpeg'; // Adjust if needed

      const prompt = `You are a cybersecurity expert analyzing a screenshot for phishing detection. Analyze this image and provide:

1. **Extracted Text**: All visible text in the image (word-for-word)
2. **Visual Elements**: Describe login forms, input fields, buttons, logos, colors
3. **Brand Detection**: Identify any company/brand logos or names (PayPal, Google, Bank names, etc)
4. **Suspicious Indicators**: 
   - Urgency language ("act now", "suspended", "verify immediately")
   - Requests for sensitive data (SSN, credit card, password, CVV, PIN)
   - Typosquatting in URLs or domains
   - Poor design quality
   - Mismatched branding
5. **Risk Assessment**: Rate 0-100 (0=safe, 100=definite phishing)

Respond in this JSON format:
{
  "extractedText": "full text here",
  "hasLoginForm": true/false,
  "detectedBrands": ["Brand1", "Brand2"],
  "inputFields": ["email", "password", "ssn", "credit card"],
  "suspiciousElements": ["urgent language", "requests SSN"],
  "riskScore": 85,
  "reasoning": "explanation here"
}`;

      const response = await axios.post(
        this.openRouterUrl,
        {
          model: this.model,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: prompt
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:${mimeType};base64,${base64Image}`
                  }
                }
              ]
            }
          ],
          max_tokens: 1500,
          temperature: 0.3
        },
        {
          headers: {
            'Authorization': `Bearer ${this.openRouterApiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'http://localhost:3000',
            'X-Title': 'Phishing Detection Platform'
          },
          timeout: 30000
        }
      );

      const content = response.data.choices[0].message.content;
      console.log('📄 GPT-4o Vision response received');

      // Try to parse JSON response
      let analysis;
      try {
        // Extract JSON from markdown code blocks if present
        const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
        if (jsonMatch) {
          analysis = JSON.parse(jsonMatch[1]);
        } else {
          analysis = JSON.parse(content);
        }
      } catch (parseError) {
        console.warn('⚠️  Failed to parse JSON, using text response');
        analysis = {
          extractedText: content,
          hasLoginForm: content.toLowerCase().includes('login') || content.toLowerCase().includes('form'),
          detectedBrands: [],
          inputFields: [],
          suspiciousElements: [],
          riskScore: 50,
          reasoning: 'Unable to parse structured response'
        };
      }

      console.log(`✅ Vision analysis complete - Risk: ${analysis.riskScore}/100`);
      console.log(`📝 Extracted text: ${analysis.extractedText?.substring(0, 100)}...`);
      console.log(`🏢 Brands detected: ${analysis.detectedBrands?.join(', ') || 'None'}`);

      return analysis;

    } catch (error) {
      console.error('❌ GPT-4o Vision error:', error.response?.data || error.message);
      return null;
    }
  }

  /**
   * Check if Vision API is configured
   */
  isConfigured() {
    return !!this.openRouterApiKey;
  }
}

export default new VisionAnalysisService();
