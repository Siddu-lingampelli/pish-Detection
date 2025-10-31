import Jimp from 'jimp';
import QrCode from 'qrcode-reader';

/**
 * QR Code Scanner Service
 * Decodes QR codes from uploaded images and extracts URLs
 */
class QRCodeService {
    /**
     * Decode QR code from image buffer
     * @param {Buffer} imageBuffer - Image file buffer
     * @returns {Promise<Object>} - Decoded data and metadata
     */
    async decodeQRCode(imageBuffer) {
        try {
            // Read image with Jimp
            const image = await Jimp.read(imageBuffer);
            
            // Create QR code reader instance
            const qr = new QrCode();
            
            // Store reference to this for use in callback
            const self = this;
            
            // Decode QR code
            return new Promise((resolve, reject) => {
                qr.callback = (err, value) => {
                    if (err) {
                        reject(new Error('Failed to decode QR code. Please ensure the image contains a valid QR code.'));
                        return;
                    }
                    
                    if (!value || !value.result) {
                        reject(new Error('No QR code found in the image.'));
                        return;
                    }
                    
                    resolve({
                        success: true,
                        data: value.result,
                        type: self.detectDataType(value.result),
                        metadata: {
                            imageWidth: image.bitmap.width,
                            imageHeight: image.bitmap.height,
                            decodedAt: new Date().toISOString()
                        }
                    });
                };
                
                // Decode the QR code
                qr.decode(image.bitmap);
            });
            
        } catch (error) {
            throw new Error(`QR code processing error: ${error.message}`);
        }
    }
    
    /**
     * Detect the type of data in QR code
     * @param {string} data - Decoded QR data
     * @returns {string} - Data type
     */
    detectDataType(data) {
        // Validate data
        if (!data || typeof data !== 'string') {
            console.error('❌ Invalid data for detectDataType:', data);
            return 'TEXT';
        }

        // Check if it's a URL
        if (this.isURL(data)) {
            return 'URL';
        }
        
        // Check if it's UPI payment
        if (data.startsWith('upi://')) {
            return 'UPI_PAYMENT';
        }
        
        // Check if it's a phone number
        if (/^tel:/.test(data)) {
            return 'PHONE';
        }
        
        // Check if it's an email
        if (/^mailto:/.test(data)) {
            return 'EMAIL';
        }
        
        // Check if it's WiFi credentials
        if (data.startsWith('WIFI:')) {
            return 'WIFI';
        }
        
        // Default to text
        return 'TEXT';
    }
    
    /**
     * Check if string is a valid URL
     * @param {string} string - String to check
     * @returns {boolean}
     */
    isURL(string) {
        try {
            const url = new URL(string);
            return url.protocol === 'http:' || url.protocol === 'https:';
        } catch (_) {
            return false;
        }
    }
    
    /**
     * Extract URL from QR data
     * @param {string} data - QR code data
     * @returns {string|null} - Extracted URL or null
     */
    extractURL(data) {
        // Direct URL
        if (this.isURL(data)) {
            return data;
        }
        
        // UPI payment URL
        if (data.startsWith('upi://')) {
            // UPI URLs can contain phishing links in parameters
            try {
                const upiUrl = new URL(data);
                return data; // Return UPI URL for analysis
            } catch (_) {
                return null;
            }
        }
        
        // Try to find URL in text
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const matches = data.match(urlRegex);
        if (matches && matches.length > 0) {
            return matches[0];
        }
        
        return null;
    }
    
    /**
     * Analyze UPI payment details
     * @param {string} upiString - UPI payment string
     * @returns {Object} - Parsed UPI details
     */
    parseUPI(upiString) {
        if (!upiString.startsWith('upi://')) {
            return null;
        }
        
        try {
            const params = {};
            const queryString = upiString.split('?')[1];
            
            if (queryString) {
                queryString.split('&').forEach(param => {
                    const [key, value] = param.split('=');
                    params[key] = decodeURIComponent(value);
                });
            }
            
            return {
                type: 'UPI_PAYMENT',
                payee: params.pa || params.pn || 'Unknown',
                amount: params.am || 'Not specified',
                note: params.tn || params.tr || '',
                currency: params.cu || 'INR',
                merchantCode: params.mc || '',
                transactionId: params.tid || '',
                url: params.url || null, // Suspicious URL parameter
                rawParams: params
            };
        } catch (error) {
            return {
                type: 'UPI_PAYMENT',
                error: 'Failed to parse UPI data',
                raw: upiString
            };
        }
    }
    
    /**
     * Detect suspicious patterns in QR code data
     * @param {string} data - QR code data
     * @returns {Object} - Suspicion analysis
     */
    detectSuspiciousPatterns(data) {
        const suspiciousIndicators = [];
        let riskScore = 0;
        
        // Check for UPI scams
        if (data.startsWith('upi://')) {
            const upiData = this.parseUPI(data);
            
            // Check for suspicious amount
            if (upiData.amount && parseFloat(upiData.amount) > 10000) {
                suspiciousIndicators.push('High amount in UPI payment');
                riskScore += 30;
            }
            
            // Check for URL parameter (redirect scam)
            if (upiData.url) {
                suspiciousIndicators.push('Contains redirect URL in UPI payment');
                riskScore += 40;
            }
            
            // Check for suspicious notes
            const suspiciousKeywords = ['kyc', 'verify', 'update', 'reward', 'prize', 'won', 'claim', 'urgent'];
            if (upiData.note) {
                const lowerNote = upiData.note.toLowerCase();
                suspiciousKeywords.forEach(keyword => {
                    if (lowerNote.includes(keyword)) {
                        suspiciousIndicators.push(`Suspicious keyword in note: "${keyword}"`);
                        riskScore += 20;
                    }
                });
            }
        }
        
        // Check for shortened URLs
        const shorteners = ['bit.ly', 'tinyurl', 'goo.gl', 'ow.ly', 'cutt.ly', 't.co'];
        shorteners.forEach(shortener => {
            if (data.includes(shortener)) {
                suspiciousIndicators.push(`URL shortener detected: ${shortener}`);
                riskScore += 25;
            }
        });
        
        // Check for suspicious TLDs
        const suspiciousTLDs = ['.tk', '.ml', '.ga', '.cf', '.gq'];
        suspiciousTLDs.forEach(tld => {
            if (data.includes(tld)) {
                suspiciousIndicators.push(`Suspicious domain extension: ${tld}`);
                riskScore += 30;
            }
        });
        
        // Check for IP addresses
        if (/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(data)) {
            suspiciousIndicators.push('Contains IP address instead of domain name');
            riskScore += 35;
        }
        
        return {
            isSuspicious: riskScore > 30,
            riskScore: Math.min(riskScore, 100),
            indicators: suspiciousIndicators,
            recommendation: riskScore > 70 ? 'HIGH RISK - Do not proceed' :
                           riskScore > 30 ? 'MEDIUM RISK - Verify before proceeding' :
                           'LOW RISK - Appears safe'
        };
    }
}

export default new QRCodeService();
