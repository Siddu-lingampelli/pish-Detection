import cerebrasService from './cerebrasService.js';

class AIAssistantService {
  constructor() {
    this.systemPrompt = `You are a helpful cybersecurity assistant specializing in phishing detection and online safety. Your role is to:

1. Answer questions about phishing, scams, malware, and online security
2. Provide practical, actionable advice in simple language
3. Be concise but thorough (2-4 paragraphs max)
4. Use bullet points for lists
5. Be encouraging and supportive, not alarmist

Key topics you help with:
- Identifying phishing emails and websites
- Verifying website authenticity
- Password security best practices
- What to do if scammed/hacked
- Social engineering tactics
- Safe browsing habits
- Two-factor authentication
- Email security (SPF, DKIM, DMARC)
- Common red flags in suspicious messages

Always be helpful, clear, and focus on education over fear.`;
  }

  async chat(userMessage, conversationHistory = []) {
    try {
      if (!cerebrasService.isEnabled()) {
        return this.getFallbackResponse(userMessage);
      }

      const reply = await cerebrasService.chatWithHistory({
        system: this.systemPrompt,
        history: conversationHistory,
        user: userMessage,
        model: 'gpt-oss-120b',
        temperature: 0.7,
        maxTokens: 1000
      });

      const safe = String(reply || '').slice(0, 8000);
      console.log(`✅ AI assistant reply generated (${safe.length} chars)`);
      return safe;

    } catch (error) {
      console.error('Cerebras assistant error:', error?.response?.status || error?.message || 'unknown');
      return this.getFallbackResponse(userMessage);
    }
  }

  getFallbackResponse(userMessage) {
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes('phishing') && (lowerMessage.includes('sign') || lowerMessage.includes('spot') || lowerMessage.includes('identify'))) {
      return `**Common Phishing Signs:**

Red Flags to Watch For:
- Urgent language ("Act now!", "Account suspended!")
- Requests for passwords, SSN, credit card info
- Suspicious sender email (slight misspellings)
- Generic greetings ("Dear User" instead of your name)
- Mismatched URLs (hover to check before clicking)
- Poor grammar and spelling errors
- Unexpected attachments or links

What to Do:
- Verify sender through official channels
- Check URL carefully before entering info
- Never click links in suspicious emails
- Contact the company directly if unsure

Stay vigilant!`;
    }

    if (lowerMessage.includes('verify') || lowerMessage.includes('check') || lowerMessage.includes('website') || lowerMessage.includes('safe')) {
      return `**How to Verify a Website is Safe:**

Check These:
- HTTPS Lock Icon: Ensure URL starts with https://
- Domain Name: Look for misspellings (g00gle.com vs google.com)
- Contact Info: Legitimate sites have clear contact details
- Professional Design: Poor quality = red flag
- Trust Seals: Look for security badges (verify them too!)

Use Tools:
- Google Safe Browsing status
- WHOIS lookup for domain age
- Check reviews and reputation
- Use our phishing scanner

Pro Tip: If something feels off, trust your instincts and leave the site immediately.`;
    }

    if (lowerMessage.includes('clicked') || lowerMessage.includes('accident')) {
      return `**What to Do After Clicking a Phishing Link:**

Act Quickly:

1. Disconnect: Turn off Wi-Fi/data immediately
2. Don't Enter Info: If you haven't entered data yet, you're likely safe
3. Change Passwords: Update passwords for affected accounts
4. Scan for Malware: Run antivirus scan
5. Enable 2FA: Add two-factor authentication
6. Monitor Accounts: Watch for suspicious activity
7. Report It: Alert your bank/service provider

If You Entered Credentials:
- Change passwords IMMEDIATELY
- Contact your bank if financial info was shared
- File a report with relevant authorities

Prevention: Always hover over links before clicking to preview the URL.`;
    }

    if (lowerMessage.includes('password')) {
      return `**Password Security Best Practices:**

Strong Password Tips:
- Length: At least 12-16 characters
- Complexity: Mix uppercase, lowercase, numbers, symbols
- Unique: Different password for each account
- Avoid: Dictionary words, personal info, patterns

Password Manager Recommended:
Use tools like Bitwarden, 1Password, or LastPass to generate and store complex passwords securely.

Two-Factor Authentication (2FA):
Always enable 2FA! Even if password is stolen, hackers can't access your account without the second factor.

Never Share Passwords:
Legitimate companies will NEVER ask for your password via email, phone, or text.

Change passwords every 3-6 months for critical accounts!`;
    }

    if (lowerMessage.includes('email')) {
      return `**Email Security Tips:**

Stay Safe:
- Verify Sender: Check the actual email address, not just display name
- Hover Before Clicking: Preview links before clicking
- Beware Attachments: Don't open unexpected files
- Check for Urgency: Scammers create fake urgency
- Look for Personalization: Generic greetings are red flags

Technical Checks:
- SPF/DKIM/DMARC records (for advanced users)
- Domain reputation lookup
- Email header analysis

What NOT to Do:
- Reply to suspicious emails
- Click unsubscribe in phishing emails
- Download unknown attachments
- Share personal info via email

When in Doubt: Contact the sender through official channels.`;
    }

    return `I'm here to help with cybersecurity questions! I can assist with:

Security Topics:
- Identifying phishing emails and websites
- Verifying if a website is safe
- Password security best practices
- What to do if you've been scammed
- Safe browsing habits
- Two-factor authentication
- Email security

Ask me specific questions like:
- "What are signs of a phishing email?"
- "How do I verify a website is legitimate?"
- "I clicked a suspicious link, what should I do?"
- "How to create a strong password?"`;
  }
}

export default new AIAssistantService();
