import axios from 'axios';

const CEREBRAS_BASE = 'https://api.cerebras.ai/v1';
const DEFAULT_MODEL = 'gpt-oss-120b';
const VISION_MODEL = 'gemma-4-31b';

class CerebrasService {
  constructor() {
    this.apiKey = process.env.CEREBRAS_API_KEY;
    this.enabled = !!this.apiKey;
    if (this.enabled) {
      console.log('✅ Cerebras AI enabled (gpt-oss-120b + gemma-4-31b)');
    } else {
      console.log('⚠️ Cerebras AI not configured (CEREBRAS_API_KEY missing)');
    }
  }

  isEnabled() {
    return this.enabled;
  }

  async chat({ system, user, model = DEFAULT_MODEL, temperature = 0.3, maxTokens = 800 }) {
    if (!this.enabled) throw new Error('Cerebras not configured');
    const messages = [];
    if (system) messages.push({ role: 'system', content: system });
    if (user) messages.push({ role: 'user', content: user });

    const response = await axios.post(
      `${CEREBRAS_BASE}/chat/completions`,
      { model, messages, temperature, max_tokens: maxTokens },
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );
    const text = response.data?.choices?.[0]?.message?.content;
    if (!text) throw new Error('Empty Cerebras response');
    return text;
  }

  async chatWithHistory({ system, history = [], user, model = DEFAULT_MODEL, temperature = 0.5, maxTokens = 1000 }) {
    if (!this.enabled) throw new Error('Cerebras not configured');
    const validRoles = new Set(['user', 'assistant', 'system']);
    const messages = [];
    if (system) messages.push({ role: 'system', content: system });
    for (const m of history.slice(-6)) {
      if (m && validRoles.has(m.role) && typeof m.content === 'string') {
        messages.push({ role: m.role, content: m.content.slice(0, 4000) });
      }
    }
    if (user) messages.push({ role: 'user', content: String(user).slice(0, 4000) });

    const response = await axios.post(
      `${CEREBRAS_BASE}/chat/completions`,
      { model, messages, temperature, max_tokens: maxTokens },
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );
    return response.data?.choices?.[0]?.message?.content || '';
  }

  async completeJson({ system, user, model = DEFAULT_MODEL, temperature = 0.2, maxTokens = 1500 }) {
    const text = await this.chat({ system, user, model, temperature, maxTokens });
    const match = text.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/) || text.match(/(\{[\s\S]*\})/);
    const jsonStr = match ? match[1] : text;
    try {
      return JSON.parse(jsonStr);
    } catch {
      return null;
    }
  }

  async analyzeVision({ prompt, base64Image, mimeType = 'image/jpeg', maxTokens = 1500 }) {
    if (!this.enabled) throw new Error('Cerebras not configured');
    const messages = [
      {
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64Image}` } }
        ]
      }
    ];
    const response = await axios.post(
      `${CEREBRAS_BASE}/chat/completions`,
      { model: VISION_MODEL, messages, temperature: 0.3, max_tokens: maxTokens },
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 60000
      }
    );
    const content = response.data?.choices?.[0]?.message?.content || '';
    const match = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/) || content.match(/(\{[\s\S]*\})/);
    const jsonStr = match ? match[1] : content;
    try {
      return JSON.parse(jsonStr);
    } catch {
      return {
        extractedText: content,
        hasLoginForm: /login|form/i.test(content),
        detectedBrands: [],
        inputFields: [],
        suspiciousElements: [],
        riskScore: 50,
        reasoning: 'Unable to parse structured response'
      };
    }
  }

  getModels() {
    return { primary: DEFAULT_MODEL, vision: VISION_MODEL };
  }
}

export default new CerebrasService();
