import sharp from 'sharp';
import Tesseract from 'tesseract.js';
import Jimp from 'jimp';
import axios from 'axios';
import visionAnalysisService from './visionAnalysisService.js';

// Suspicious keywords that appear in phishing login pages
const PHISHING_LOGIN_KEYWORDS = [
  'verify', 'confirm', 'update', 'suspended', 'locked', 'urgent', 'immediate',
  'security alert', 'unusual activity', 'verify identity', 'confirm identity',
  'account suspended', 'account locked', 'verify account', 'update payment',
  'payment failed', 'billing problem', 'expiring', 'expired', 'limited time',
  'click here', 'act now', 'verify now', 'update now', 'confirm now',
  'sign in to continue', 'verify to continue', 'unusual sign-in',
  // India-specific
  'kyc update', 'pan verification', 'aadhaar verification', 'upi verification',
  'enter otp', 'enter mpin', 'cvv', 'card number', 'atm pin'
];

// Legitimate brand names to check for impersonation
const LEGITIMATE_BRANDS = [
  'google', 'facebook', 'microsoft', 'apple', 'amazon', 'netflix', 'paypal',
  'instagram', 'twitter', 'linkedin', 'dropbox', 'adobe', 'whatsapp', 'gmail',
  'outlook', 'icloud', 'ebay', 'coinbase', 'binance', 'metamask',
  // Banks
  'chase', 'wells fargo', 'bank of america', 'citibank', 'hsbc',
  // Indian banks and services
  'sbi', 'hdfc', 'icici', 'axis', 'kotak', 'paytm', 'phonepe', 'googlepay',
  'bhim', 'aadhaar', 'irctc', 'csc', 'passport seva'
];

class ScreenshotAnalysisService {

  /**
   * Main analysis method for screenshots
   */
  async analyzeScreenshot(imageBuffer) {
    const startTime = Date.now();

    try {
      // Initialize results
      const analysisResults = {
        hasLoginForm: false,
        suspiciousElements: [],
        brandImpersonation: null,
        extractedText: '',
        textAnalysis: {
          suspiciousKeywords: [],
          urgencyIndicators: [],
          brandMentions: []
        },
        visualAnalysis: {
          hasInputFields: false,
          hasPasswordField: false,
          hasSubmitButton: false,
          colorScheme: [],
          suspiciousColors: false
        },
        riskScore: 0,
        riskLevel: 'LOW',
        confidence: 0,
        recommendations: []
      };

      // Step 1: Try GPT-4o Vision first (much better accuracy)
      console.log('🤖 Attempting GPT-4o Vision analysis...');
      const visionResult = await visionAnalysisService.analyzeScreenshotWithVision(imageBuffer);

      if (visionResult) {
        // Use GPT-4o Vision results (superior accuracy)
        console.log('✅ Using GPT-4o Vision analysis');
        analysisResults.extractedText = visionResult.extractedText || '';
        analysisResults.textAnalysis = this.analyzeText(visionResult.extractedText || '');
        analysisResults.textAnalysis.extractedText = visionResult.extractedText || '';
        
        // Enhance with Vision-specific insights
        if (visionResult.detectedBrands) {
          analysisResults.textAnalysis.brandMentions = visionResult.detectedBrands;
        }
        if (visionResult.inputFields) {
          analysisResults.textAnalysis.hasSSN = visionResult.inputFields.some(f => 
            /ssn|social security/i.test(f)
          );
          analysisResults.textAnalysis.hasCreditCard = visionResult.inputFields.some(f => 
            /credit card|cvv|card number/i.test(f)
          );
        }
        if (visionResult.suspiciousElements) {
          analysisResults.textAnalysis.suspiciousKeywords.push(...visionResult.suspiciousElements);
        }

        // Visual analysis
        analysisResults.visualAnalysis = await this.analyzeVisualElements(imageBuffer);
        analysisResults.visualAnalysis.hasLoginForm = visionResult.hasLoginForm;
        analysisResults.visualAnalysis.visionRiskScore = visionResult.riskScore;
        analysisResults.visualAnalysis.visionReasoning = visionResult.reasoning;

      } else {
        // Fallback to Tesseract OCR
        console.log('⚠️  Falling back to Tesseract OCR...');
        
        // Step 1: Image preprocessing
        console.log('📸 Preprocessing screenshot...');
        const processedImage = await this.preprocessImage(imageBuffer);

        // Step 2: OCR - Extract text from screenshot
        console.log('🔍 Performing OCR text extraction...');
        const ocrResult = await this.performOCR(processedImage);
        analysisResults.extractedText = ocrResult.text;

        // Step 3: Analyze extracted text
        console.log('📝 Analyzing extracted text...');
        analysisResults.textAnalysis = this.analyzeText(ocrResult.text);
        analysisResults.textAnalysis.extractedText = ocrResult.text;

        // Step 4: Visual analysis
        console.log('🎨 Performing visual analysis...');
        analysisResults.visualAnalysis = await this.analyzeVisualElements(imageBuffer);
      }

      // Step 5: Detect login forms
      analysisResults.hasLoginForm = this.detectLoginForm(
        analysisResults.textAnalysis,
        analysisResults.visualAnalysis
      );

      // Step 6: Check for brand impersonation
      analysisResults.brandImpersonation = this.detectBrandImpersonation(
        analysisResults.textAnalysis.brandMentions
      );

      // Step 7: Calculate risk score
      const riskCalculation = this.calculateRiskScore(analysisResults);
      analysisResults.riskScore = riskCalculation.score;
      analysisResults.riskLevel = riskCalculation.level;
      analysisResults.confidence = riskCalculation.confidence;

      // Step 8: Generate recommendations
      analysisResults.recommendations = this.generateRecommendations(analysisResults);

      // Step 9: Add suspicious elements list
      analysisResults.suspiciousElements = this.collectSuspiciousElements(analysisResults);

      const duration = Date.now() - startTime;
      console.log(`✅ Screenshot analysis completed in ${duration}ms`);

      return {
        success: true,
        analysis: analysisResults,
        duration
      };

    } catch (error) {
      console.error('❌ Screenshot analysis error:', error);
      return {
        success: false,
        error: error.message,
        duration: Date.now() - startTime
      };
    }
  }

  /**
   * Preprocess image for better OCR results
   */
  async preprocessImage(imageBuffer) {
    try {
      // First, get image metadata
      const metadata = await sharp(imageBuffer).metadata();
      console.log(`📏 Original image: ${metadata.width}x${metadata.height}`);

      // Multi-pass preprocessing for better text extraction
      const processedBuffer = await sharp(imageBuffer)
        .resize(2000, null, { // Upscale for better OCR
          fit: 'inside',
          withoutEnlargement: false,
          kernel: sharp.kernel.lanczos3
        })
        .greyscale()
        .normalize() // Auto-adjust contrast
        .linear(1.5, -(128 * 1.5) + 128) // Increase contrast
        .sharpen({ sigma: 1.5 })
        .toBuffer();

      return processedBuffer;
    } catch (error) {
      console.error('Image preprocessing error:', error);
      throw error;
    }
  }

  /**
   * Perform OCR using Tesseract.js
   */
  async performOCR(imageBuffer) {
    try {
      const { data } = await Tesseract.recognize(
        imageBuffer,
        'eng',
        {
          logger: m => {
            // Only log progress, not every status update
            if (m.status === 'recognizing text') {
              console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
            }
          },
          tessedit_pageseg_mode: Tesseract.PSM.AUTO,
          preserve_interword_spaces: '1',
        }
      );

      console.log(`📄 Extracted text (${data.text.length} characters):`, data.text.substring(0, 200));

      return {
        text: data.text,
        confidence: data.confidence
      };
    } catch (error) {
      console.error('OCR error:', error);
      return { text: '', confidence: 0 };
    }
  }

  /**
   * Analyze extracted text for phishing indicators
   */
  analyzeText(text) {
    const lowerText = text.toLowerCase();
    const suspiciousKeywords = [];
    const urgencyIndicators = [];
    const brandMentions = [];

    // Check for suspicious keywords
    PHISHING_LOGIN_KEYWORDS.forEach(keyword => {
      if (lowerText.includes(keyword.toLowerCase())) {
        suspiciousKeywords.push(keyword);
        
        // Check if it's an urgency indicator
        if (['urgent', 'immediate', 'now', 'expire', 'limited', 'act now'].some(u => keyword.includes(u))) {
          urgencyIndicators.push(keyword);
        }
      }
    });

    // Check for brand mentions
    LEGITIMATE_BRANDS.forEach(brand => {
      if (lowerText.includes(brand.toLowerCase())) {
        brandMentions.push(brand);
      }
    });

    // Check for common form fields (even with limited OCR)
    const hasEmailField = /email|e-?mail|username|user\s*id|login/i.test(text);
    const hasPasswordField = /password|passwd|pwd|pin|otp|pass\s*word/i.test(text);
    const hasSubmitButton = /sign\s*in|log\s*in|login|submit|continue|verify|confirm|restore|next/i.test(text);
    
    // Check for high-risk personal data fields (SSN, etc.)
    const hasSSN = /social\s*security|ssn|security\s*number/i.test(text);
    const hasCreditCard = /card\s*number|cvv|credit\s*card|debit\s*card/i.test(text);
    const hasBankInfo = /account\s*number|routing\s*number|bank\s*account/i.test(text);

    console.log(`🔍 Text analysis: ${suspiciousKeywords.length} keywords, ${brandMentions.length} brands, SSN: ${hasSSN}, CC: ${hasCreditCard}`);

    return {
      suspiciousKeywords,
      urgencyIndicators,
      brandMentions,
      hasEmailField,
      hasPasswordField,
      hasSubmitButton,
      hasSSN,
      hasCreditCard,
      hasBankInfo
    };
  }

  /**
   * Analyze visual elements of the screenshot
   */
  async analyzeVisualElements(imageBuffer) {
    try {
      const image = await Jimp.read(imageBuffer);
      const width = image.bitmap.width;
      const height = image.bitmap.height;

      console.log(`🖼️  Image dimensions: ${width}x${height}px`);

      // Analyze color distribution
      const colorCounts = {
        blue: 0,
        red: 0,
        green: 0,
        white: 0,
        black: 0,
        yellow: 0
      };

      let highContrastRegions = 0;

      // Sample every 10th pixel for performance
      for (let y = 0; y < height; y += 10) {
        for (let x = 0; x < width; x += 10) {
          const hex = image.getPixelColor(x, y);
          const rgba = Jimp.intToRGBA(hex);
          
          // Check for prominent colors
          if (rgba.r < 50 && rgba.g < 50 && rgba.b > 150) colorCounts.blue++;
          if (rgba.r > 150 && rgba.g < 50 && rgba.b < 50) colorCounts.red++;
          if (rgba.r < 50 && rgba.g > 150 && rgba.b < 50) colorCounts.green++;
          if (rgba.r > 200 && rgba.g > 200 && rgba.b > 200) colorCounts.white++;
          if (rgba.r < 50 && rgba.g < 50 && rgba.b < 50) colorCounts.black++;
          if (rgba.r > 200 && rgba.g > 200 && rgba.b < 100) colorCounts.yellow++;

          // Detect high contrast regions (potential buttons/fields)
          const brightness = (rgba.r + rgba.g + rgba.b) / 3;
          if (Math.abs(brightness - 128) > 100) {
            highContrastRegions++;
          }
        }
      }

      // Detect horizontal lines (potential input fields/buttons)
      const horizontalLines = [];
      for (let y = 0; y < height; y += 5) {
        let lineStart = null;
        let prevColor = null;
        
        for (let x = 0; x < width; x += 5) {
          const hex = image.getPixelColor(x, y);
          
          if (prevColor === null) {
            prevColor = hex;
            lineStart = x;
          } else if (Math.abs(hex - prevColor) > 1000) {
            if (x - lineStart > 100) {
              horizontalLines.push({ y, start: lineStart, end: x });
            }
            lineStart = x;
            prevColor = hex;
          }
        }
      }

      const inputFieldCount = Math.min(Math.floor(horizontalLines.length / 3), 10);
      const buttonLikeRegions = Math.floor(highContrastRegions / 1000);

      console.log(`🎨 Colors - Blue: ${colorCounts.blue}, Red: ${colorCounts.red}, White: ${colorCounts.white}`);
      console.log(`📦 Structures - Fields: ${inputFieldCount}, Buttons: ${buttonLikeRegions}, HiContrast: ${highContrastRegions}`);

      const totalPixels = (width * height) / 100;
      const hasInputFields = inputFieldCount >= 2 || buttonLikeRegions >= 3;
      const hasSuspiciousColors = (colorCounts.red + colorCounts.yellow) / totalPixels > 0.02;
      const hasFormLayout = inputFieldCount >= 3 && buttonLikeRegions >= 1;

      // Calculate visual-only phishing score (OCR-independent)
      let visualScore = 0;
      if (inputFieldCount >= 3) visualScore += 35;
      if (buttonLikeRegions >= 2) visualScore += 25;
      if (hasFormLayout) visualScore += 20;
      
      const redRatio = colorCounts.red / totalPixels;
      const yellowRatio = colorCounts.yellow / totalPixels;
      const blueRatio = colorCounts.blue / totalPixels;
      
      if (redRatio > 0.03 || yellowRatio > 0.03) visualScore += 15;
      if (blueRatio > 0.15) visualScore += 10;
      if (highContrastRegions > 500) visualScore += 10;

      console.log(`👁️  Visual-only phishing score: ${visualScore}/100`);

      return {
        width,
        height,
        colorCounts,
        hasInputFields,
        hasSuspiciousColors,
        hasFormLayout,
        inputFieldCount,
        buttonLikeRegions,
        highContrastRegions,
        visualPhishingScore: Math.min(visualScore, 85),
        hasPasswordField: false,
        hasSubmitButton: false
      };

    } catch (error) {
      console.error('Visual analysis error:', error);
      return {
        width: 0,
        height: 0,
        colorCounts: {},
        hasInputFields: false,
        hasSuspiciousColors: false,
        hasFormLayout: false,
        inputFieldCount: 0,
        buttonLikeRegions: 0,
        highContrastRegions: 0,
        visualPhishingScore: 0,
        hasPasswordField: false,
        hasSubmitButton: false
      };
    }
  }

  /**
   * Detect suspicious color schemes
   */
  detectSuspiciousColors(colors) {
    // Phishing pages often use bright, alarming colors or try to mimic brands poorly
    const suspiciousPatterns = [
      /rgb\(25[0-5],\s*0,\s*0\)/,      // Bright red (alarm)
      /rgb\(25[0-5],\s*255,\s*0\)/,    // Bright yellow/lime (warning)
      /rgb\(25[0-5],\s*165,\s*0\)/     // Orange (caution)
    ];

    return colors.some(color => 
      suspiciousPatterns.some(pattern => pattern.test(color))
    );
  }

  /**
   * Estimate if image contains input fields
   */
  estimateInputFields(image) {
    // Simple heuristic: look for rectangular white/light regions
    // In a production system, you'd use computer vision models
    const width = image.bitmap.width;
    const height = image.bitmap.height;
    
    // Count white/light pixels that might indicate input fields
    let lightPixelCount = 0;
    const sampleRate = 20;
    
    for (let y = 0; y < height; y += sampleRate) {
      for (let x = 0; x < width; x += sampleRate) {
        const color = image.getPixelColor(x, y);
        const { r, g, b } = Jimp.intToRGBA(color);
        
        // Light pixels (potential input fields)
        if (r > 200 && g > 200 && b > 200) {
          lightPixelCount++;
        }
      }
    }

    const totalSamples = (width / sampleRate) * (height / sampleRate);
    const lightRatio = lightPixelCount / totalSamples;

    // If 10-40% of pixels are light, likely has input fields
    return lightRatio > 0.1 && lightRatio < 0.4;
  }

  /**
   * Detect if screenshot contains a login form
   */
  detectLoginForm(textAnalysis, visualAnalysis) {
    let indicators = 0;

    // Check for typical login form elements
    if (textAnalysis.hasEmailField) indicators++;
    if (textAnalysis.hasPasswordField) indicators++;
    if (textAnalysis.hasSubmitButton) indicators++;
    if (visualAnalysis.hasInputFields) indicators++;

    // Need at least 2 indicators to consider it a login form
    return indicators >= 2;
  }

  /**
   * Detect brand impersonation
   */
  detectBrandImpersonation(brandMentions) {
    if (brandMentions.length === 0) return null;

    // Multiple brand mentions might indicate impersonation
    if (brandMentions.length > 1) {
      return {
        detected: true,
        brands: brandMentions,
        reason: 'Multiple brand names detected - potential impersonation'
      };
    }

    // Single brand mention - could be legitimate or phishing
    return {
      detected: false,
      brands: brandMentions,
      reason: 'Single brand detected - verify domain matches brand'
    };
  }

  /**
   * Calculate overall risk score
   */
  calculateRiskScore(analysis) {
    let score = 0;
    let confidence = 0.5;
    const textLength = (analysis.textAnalysis?.extractedText || '').length;

    console.log(`\n🎯 Calculating risk score (Text length: ${textLength} chars)`);

    // If GPT-4o Vision provided a risk score, use it as primary indicator
    if (analysis.visualAnalysis?.visionRiskScore !== undefined) {
      console.log(`🤖 Using GPT-4o Vision risk assessment: ${analysis.visualAnalysis.visionRiskScore}/100`);
      score = analysis.visualAnalysis.visionRiskScore;
      confidence = 0.9; // Very high confidence with AI vision
      
      console.log(`✅ AI Vision score: ${score}/100 (${analysis.visualAnalysis.visionReasoning})`);
      
    } else if (textLength < 30 && analysis.visualAnalysis?.visualPhishingScore > 0) {
      // Fallback to visual-only scoring if OCR failed
      console.log(`⚠️  Low OCR output - using visual-only detection`);
      score = analysis.visualAnalysis.visualPhishingScore;
      confidence = 0.6;
      
      if (analysis.visualAnalysis?.hasSuspiciousColors) {
        score += 10;
      }
      
      console.log(`👁️  Visual-only score: ${score}/100`);
      
    } else {
      // Normal scoring with OCR text
      
      // Login form presence (20 points)
      if (analysis.hasLoginForm) {
        score += 20;
        confidence += 0.1;
      }

      // Suspicious keywords (5 points each, max 30)
      const keywordScore = Math.min((analysis.textAnalysis?.suspiciousKeywords || []).length * 5, 30);
      score += keywordScore;
      if ((analysis.textAnalysis?.suspiciousKeywords || []).length > 0) {
        confidence += 0.15;
      }

      // Urgency indicators (10 points each, max 30)
      const urgencyScore = Math.min((analysis.textAnalysis?.urgencyIndicators || []).length * 10, 30);
      score += urgencyScore;
      if ((analysis.textAnalysis?.urgencyIndicators || []).length > 0) {
        confidence += 0.15;
      }

      // High-risk personal data fields
      if (analysis.textAnalysis?.hasSSN || analysis.textAnalysis?.hasCreditCard || analysis.textAnalysis?.hasBankInfo) {
        score += 35;
        confidence += 0.2;
        console.log(`🚨 HIGH RISK DATA FIELDS DETECTED (SSN: ${analysis.textAnalysis?.hasSSN}, CC: ${analysis.textAnalysis?.hasCreditCard}, Bank: ${analysis.textAnalysis?.hasBankInfo})`);
      }

      // Brand impersonation (40 points if detected)
      if (analysis.brandImpersonation?.detected) {
        score += 40;
        confidence += 0.2;
      } else if ((analysis.brandImpersonation?.brands || []).length > 0) {
        // Even single brand mention in a login form is suspicious
        score += 20;
        confidence += 0.1;
      }

      // Visual suspicious elements (20 points)
      if (analysis.visualAnalysis?.hasSuspiciousColors) {
        score += 20;
        confidence += 0.1;
      }

      // Visual form detection bonus (even with some text)
      if (analysis.visualAnalysis?.hasFormLayout && textLength < 100) {
        score += 25;
        confidence += 0.1;
      }

      console.log(`📊 Text-based score: ${score}/100 (Keywords: ${keywordScore}, Urgency: ${urgencyScore})`);
    }

    // Normalize score to 0-100
    score = Math.min(score, 100);
    confidence = Math.min(confidence, 1);

    // Determine risk level
    let level = 'LOW';
    if (score >= 70) level = 'HIGH';
    else if (score >= 40) level = 'MEDIUM';

    console.log(`✅ Final risk: ${level} (${score}/100, confidence: ${(confidence * 100).toFixed(0)}%)\n`);

    return { score, level, confidence };
  }

  /**
   * Collect all suspicious elements found
   */
  collectSuspiciousElements(analysis) {
    const elements = [];

    if (analysis.hasLoginForm) {
      elements.push('Login form detected');
    }

    if (analysis.textAnalysis.suspiciousKeywords.length > 0) {
      elements.push(`${analysis.textAnalysis.suspiciousKeywords.length} suspicious keywords found`);
    }

    if (analysis.textAnalysis.urgencyIndicators.length > 0) {
      elements.push(`${analysis.textAnalysis.urgencyIndicators.length} urgency indicators detected`);
    }

    if (analysis.brandImpersonation?.detected) {
      elements.push(`Possible ${analysis.brandImpersonation.brands.join(', ')} impersonation`);
    }

    if (analysis.visualAnalysis.suspiciousColors) {
      elements.push('Suspicious color scheme detected');
    }

    return elements;
  }

  /**
   * Generate safety recommendations
   */
  generateRecommendations(analysis) {
    const recommendations = [];

    if (analysis.hasLoginForm) {
      recommendations.push('Verify the domain URL matches the official website');
      recommendations.push('Check for HTTPS and valid SSL certificate');
      recommendations.push('Never enter credentials if the URL looks suspicious');
    }

    if (analysis.textAnalysis.urgencyIndicators.length > 0) {
      recommendations.push('Ignore urgency tactics - legitimate services rarely use urgent language');
      recommendations.push('Contact the company directly through official channels');
    }

    if (analysis.brandImpersonation?.detected) {
      recommendations.push(`Verify this is an official ${analysis.brandImpersonation.brands[0]} page`);
      recommendations.push('Check the URL domain carefully for typos');
    }

    if (analysis.riskScore >= 40) {
      recommendations.push('Do not enter any personal information');
      recommendations.push('Report this page to your security team');
      recommendations.push('Close the page immediately');
    }

    return recommendations;
  }
}

export default new ScreenshotAnalysisService();
