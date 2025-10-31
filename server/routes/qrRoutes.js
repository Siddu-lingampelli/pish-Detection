import express from 'express';
import multer from 'multer';
import qrCodeService from '../services/qrCodeService.js';
import phishingDetectionService from '../services/phishingDetectionService.js';
import mistralExplanationService from '../services/mistralExplanationService.js';

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max file size
    },
    fileFilter: (req, file, cb) => {
        // Accept images only
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
    }
});

/**
 * @route   POST /api/qr/scan
 * @desc    Scan QR code from uploaded image and check for phishing
 * @access  Public
 */
router.post('/scan', upload.single('qrImage'), async (req, res) => {
    try {
        // Check if file was uploaded
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No image file uploaded'
            });
        }

        console.log('📸 QR Code scan request received');
        console.log('   File size:', req.file.size, 'bytes');
        console.log('   File type:', req.file.mimetype);

        // Step 1: Decode QR code from image
        const qrResult = await qrCodeService.decodeQRCode(req.file.buffer);
        console.log('✅ QR Code decoded:', qrResult.type);
        console.log('   Data:', qrResult.data);

        // Step 2: Detect suspicious patterns in QR data
        const suspicionAnalysis = qrCodeService.detectSuspiciousPatterns(qrResult.data);
        console.log('🔍 Suspicion analysis:', suspicionAnalysis.recommendation);

        // Step 3: Extract URL if present
        const extractedURL = qrCodeService.extractURL(qrResult.data);
        
        let phishingResult = null;
        let aiExplanation = null;

        // Step 4: If URL found, run full phishing detection
        if (extractedURL) {
            console.log('🌐 URL extracted, running phishing detection...');
            phishingResult = await phishingDetectionService.detectPhishing(extractedURL);
            
            // Generate AI explanation if Mistral is enabled
            if (process.env.MISTRAL_API_KEY) {
                try {
                    aiExplanation = await mistralExplanationService.generateExplanation(extractedURL, phishingResult);
                    console.log('🤖 AI explanation generated');
                } catch (aiError) {
                    console.error('⚠️ AI explanation failed:', aiError.message);
                }
            }
        }

        // Step 5: Parse UPI data if present
        let upiData = null;
        if (qrResult.data.startsWith('upi://')) {
            upiData = qrCodeService.parseUPI(qrResult.data);
            console.log('💳 UPI payment detected');
        }

        // Step 6: Combine all results
        const response = {
            success: true,
            qrCode: {
                decoded: true,
                type: qrResult.type,
                data: qrResult.data,
                metadata: qrResult.metadata
            },
            security: {
                suspicionAnalysis,
                phishingDetection: phishingResult,
                aiAnalysis: aiExplanation
            },
            extractedURL,
            upiPayment: upiData,
            overallRisk: calculateOverallRisk(suspicionAnalysis, phishingResult),
            scannedAt: new Date().toISOString()
        };

        console.log('✅ QR scan complete. Overall risk:', response.overallRisk.level);

        res.json(response);

    } catch (error) {
        console.error('❌ QR scan error:', error.message);
        console.error('   Stack:', error.stack);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to process QR code'
        });
    }
});

/**
 * Calculate overall risk level from multiple analyses
 */
function calculateOverallRisk(suspicionAnalysis, phishingResult) {
    let totalScore = 0;
    let factors = [];

    // Add suspicion score
    if (suspicionAnalysis) {
        totalScore += suspicionAnalysis.riskScore * 0.4; // 40% weight
        if (suspicionAnalysis.indicators && suspicionAnalysis.indicators.length > 0) {
            factors.push(...suspicionAnalysis.indicators);
        }
    }

    // Add phishing detection score
    if (phishingResult) {
        totalScore += phishingResult.confidence_score * 100 * 0.6; // 60% weight
        if (phishingResult.meta_data && phishingResult.meta_data.threat_types && phishingResult.meta_data.threat_types.length > 0) {
            factors.push(...phishingResult.meta_data.threat_types);
        }
        // Add risk factors
        if (phishingResult.meta_data && phishingResult.meta_data.risk_factors && phishingResult.meta_data.risk_factors.length > 0) {
            factors.push(...phishingResult.meta_data.risk_factors);
        }
    }

    // Determine risk level
    let level = 'LOW';
    let color = 'green';
    let action = 'Safe to proceed';

    if (totalScore > 70) {
        level = 'HIGH';
        color = 'red';
        action = '🚨 DO NOT PROCEED - This is likely a scam';
    } else if (totalScore > 40) {
        level = 'MEDIUM';
        color = 'yellow';
        action = '⚠️ CAUTION - Verify before proceeding';
    } else if (totalScore > 20) {
        level = 'LOW-MEDIUM';
        color = 'orange';
        action = 'Exercise caution';
    }

    return {
        score: Math.round(totalScore),
        level,
        color,
        action,
        factors: [...new Set(factors)] // Remove duplicates
    };
}

export default router;
