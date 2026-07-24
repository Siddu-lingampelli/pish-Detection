import cerebrasService from './cerebrasService.js';

class VisionAnalysisService {
  isConfigured() {
    return cerebrasService.isEnabled();
  }

  async analyzeScreenshotWithVision(imageBuffer) {
    if (!this.isConfigured()) {
      console.log('⚠️  Cerebras API key not configured, falling back to basic analysis');
      return null;
    }

    try {
      console.log('🔍 Analyzing screenshot with gemma-4-31b (Cerebras)...');

      const base64Image = imageBuffer.toString('base64');
      const mimeType = 'image/jpeg';

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

      const raw = await cerebrasService.analyzeVision({
        prompt,
        base64Image,
        mimeType,
        maxTokens: 1500
      });

      const analysis = {
        extractedText: String(raw.extractedText || ''),
        hasLoginForm: Boolean(raw.hasLoginForm),
        detectedBrands: Array.isArray(raw.detectedBrands) ? raw.detectedBrands : [],
        inputFields: Array.isArray(raw.inputFields) ? raw.inputFields : [],
        suspiciousElements: Array.isArray(raw.suspiciousElements) ? raw.suspiciousElements : [],
        riskScore: Math.max(0, Math.min(100, Number(raw.riskScore) || 0)),
        reasoning: String(raw.reasoning || '')
      };

      console.log(`✅ Vision analysis complete - Risk: ${analysis.riskScore}/100`);
      console.log(`📝 Extracted text length: ${analysis.detectedBrands?.length || 0} brands`);
      console.log(`🏢 Brands detected: ${analysis.detectedBrands?.join(', ') || 'None'}`);

      return analysis;
    } catch (error) {
      console.error('❌ Cerebras vision error:', error?.response?.status || error?.message || 'unknown');
      return null;
    }
  }
}

export default new VisionAnalysisService();
