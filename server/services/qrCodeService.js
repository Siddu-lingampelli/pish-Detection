import Jimp from 'jimp';
import QrCode from 'qrcode-reader';

const SUSPICIOUS_KEYWORDS = [
  'verify', 'confirm', 'urgent', 'immediate', 'suspended', 'locked',
  'click here', 'act now', 'limited time', 'expire', 'verify now',
  'update', 'kyc', 'pan', 'aadhaar', 'otp', 'mpin', 'cvv', 'pin',
  'password', 'account', 'bank', 'refund', 'winner', 'prize', 'reward'
];

class QRCodeService {
    async decodeQRCode(imageBuffer) {
        try {
            if (!Buffer.isBuffer(imageBuffer) || imageBuffer.length === 0) {
                throw new Error('Invalid image buffer');
            }
            const image = await Jimp.read(imageBuffer);

            const qr = new QrCode();

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
                        type: this.detectDataType(value.result),
                        metadata: {
                            imageWidth: image.bitmap.width,
                            imageHeight: image.bitmap.height,
                            decodedAt: new Date().toISOString()
                        }
                    });
                };
                qr.decode(image.bitmap);
            });
        } catch (error) {
            throw new Error(`QR code processing error: ${error.message}`);
        }
    }

    detectDataType(data) {
        if (!data || typeof data !== 'string') return 'TEXT';
        if (this.isURL(data)) return 'URL';
        if (data.startsWith('upi://')) return 'UPI_PAYMENT';
        if (/^tel:/i.test(data)) return 'PHONE';
        if (/^mailto:/i.test(data)) return 'EMAIL';
        if (data.startsWith('WIFI:')) return 'WIFI';
        return 'TEXT';
    }

    isURL(string) {
        try {
            const url = new URL(string);
            return url.protocol === 'http:' || url.protocol === 'https:';
        } catch (_) {
            return false;
        }
    }

    extractURL(data) {
        if (this.isURL(data)) return data;
        if (data.startsWith('upi://')) {
            try { new URL(data); return data; } catch { return null; }
        }
        const m = data.match(/https?:\/\/[^\s<>"']+/);
        if (m) return m[0];
        return null;
    }

    parseUPI(upiString) {
        if (typeof upiString !== 'string' || !upiString.startsWith('upi://')) return null;

        try {
            const params = Object.create(null);
            const queryString = upiString.split('?')[1];

            if (queryString) {
                queryString.split('&').forEach(param => {
                    const [key, value] = param.split('=');
                    const safeKey = String(key || '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64);
                    if (!safeKey) return;
                    try {
                        params[safeKey] = value ? decodeURIComponent(value).slice(0, 1000) : '';
                    } catch {
                        params[safeKey] = (value || '').slice(0, 1000);
                    }
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
                url: params.url || null
            };
        } catch {
            return { type: 'UPI_PAYMENT', error: 'Failed to parse UPI data' };
        }
    }

    detectSuspiciousPatterns(data) {
        const suspiciousIndicators = [];
        let riskScore = 0;

        if (typeof data === 'string' && data.startsWith('upi://')) {
            const upiData = this.parseUPI(data);

            if (upiData && upiData.amount) {
                const amt = parseFloat(upiData.amount);
                if (!Number.isNaN(amt) && amt > 10000) {
                    suspiciousIndicators.push('High amount in UPI payment');
                    riskScore += 30;
                }
            }

            if (upiData && upiData.url) {
                suspiciousIndicators.push('Contains redirect URL in UPI payment');
                riskScore += 40;
            }

            if (upiData && upiData.note) {
                const lowerNote = upiData.note.toLowerCase();
                SUSPICIOUS_KEYWORDS.forEach(keyword => {
                    if (lowerNote.includes(keyword)) {
                        suspiciousIndicators.push(`Suspicious keyword in note: "${keyword}"`);
                        riskScore += 20;
                    }
                });
            }
        }

        const shorteners = ['bit.ly', 'tinyurl', 'goo.gl', 'ow.ly', 'cutt.ly', 't.co'];
        shorteners.forEach(shortener => {
            if (typeof data === 'string' && data.includes(shortener)) {
                suspiciousIndicators.push(`URL shortener detected: ${shortener}`);
                riskScore += 25;
            }
        });

        const suspiciousTLDs = ['.tk', '.ml', '.ga', '.cf', '.gq'];
        suspiciousTLDs.forEach(tld => {
            if (typeof data === 'string' && data.includes(tld)) {
                suspiciousIndicators.push(`Suspicious domain extension: ${tld}`);
                riskScore += 30;
            }
        });

        if (typeof data === 'string' && /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/.test(data)) {
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
