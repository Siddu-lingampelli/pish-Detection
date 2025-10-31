import axios from 'axios';

/**
 * URLScan.io Service
 * Submits URLs for scanning and retrieves detailed analysis including screenshots
 */
class URLScanService {
    constructor() {
        this.apiKey = process.env.URLSCAN_API_KEY;
        this.baseUrl = 'https://urlscan.io/api/v1';
        this.enabled = !!this.apiKey;
        
        if (this.enabled) {
            console.log('✅ URLScan.io enabled for website analysis');
        } else {
            console.log('⚠️ URLScan.io disabled (no API key)');
        }
    }

    /**
     * Submit URL for scanning
     * @param {string} url - URL to scan
     * @param {string} visibility - 'public', 'unlisted', or 'private'
     * @returns {Promise<Object>} - Scan submission result
     */
    async submitScan(url, visibility = 'unlisted') {
        if (!this.enabled) {
            return {
                success: false,
                error: 'URLScan.io API key not configured'
            };
        }

        try {
            console.log('📡 Submitting URL to URLScan.io:', url);

            const response = await axios.post(
                `${this.baseUrl}/scan/`,
                {
                    url: url,
                    visibility: visibility,
                    tags: ['phishing-detection', 'automated-scan']
                },
                {
                    headers: {
                        'API-Key': this.apiKey,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('✅ URLScan.io submission successful');

            return {
                success: true,
                scanId: response.data.uuid,
                resultUrl: response.data.result,
                apiUrl: response.data.api,
                visibility: response.data.visibility,
                submittedAt: new Date().toISOString()
            };

        } catch (error) {
            console.error('❌ URLScan.io submission error:', error.message);
            
            if (error.response?.status === 429) {
                return {
                    success: false,
                    error: 'Rate limit exceeded. Please try again later.',
                    rateLimited: true
                };
            }

            return {
                success: false,
                error: error.response?.data?.message || error.message
            };
        }
    }

    /**
     * Get scan results
     * @param {string} scanId - UUID of the scan
     * @returns {Promise<Object>} - Scan results
     */
    async getResults(scanId) {
        if (!this.enabled) {
            return {
                success: false,
                error: 'URLScan.io API key not configured'
            };
        }

        try {
            const response = await axios.get(
                `${this.baseUrl}/result/${scanId}/`,
                {
                    headers: {
                        'API-Key': this.apiKey
                    }
                }
            );

            const data = response.data;

            // Extract key security indicators
            const analysis = {
                success: true,
                scanId: scanId,
                
                // Basic info
                url: data.page?.url,
                domain: data.page?.domain,
                ip: data.page?.ip,
                country: data.page?.country,
                
                // Security indicators
                malicious: data.verdicts?.overall?.malicious || false,
                score: data.verdicts?.overall?.score || 0,
                categories: data.verdicts?.overall?.categories || [],
                
                // SSL/TLS info
                certificate: {
                    valid: data.page?.tlsValidDays > 0,
                    issuer: data.page?.tlsIssuer,
                    validDays: data.page?.tlsValidDays,
                    validFrom: data.page?.tlsValidFrom,
                    validTo: data.page?.tlsValidTo
                },
                
                // Technology stack
                technologies: this.extractTechnologies(data),
                
                // Network info
                requests: {
                    total: data.data?.requests?.length || 0,
                    domains: this.getUniqueDomains(data.data?.requests || []),
                    countries: this.getUniqueCountries(data.data?.requests || [])
                },
                
                // Screenshots
                screenshots: {
                    main: data.task?.screenshotURL,
                    thumbnail: data.task?.thumbURL
                },
                
                // Reputation indicators
                indicators: this.extractIndicators(data),
                
                // Report URLs
                reportUrl: data.task?.reportURL,
                
                // Scan metadata
                scannedAt: data.task?.time
            };

            return analysis;

        } catch (error) {
            if (error.response?.status === 404) {
                return {
                    success: false,
                    error: 'Scan results not ready yet. Please wait a few seconds.',
                    pending: true
                };
            }

            console.error('❌ URLScan.io results error:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Submit and wait for results (with retry)
     * @param {string} url - URL to scan
     * @param {number} maxRetries - Maximum number of retries
     * @param {number} retryDelay - Delay between retries in ms
     * @returns {Promise<Object>} - Complete scan results
     */
    async scanAndWait(url, maxRetries = 10, retryDelay = 5000) {
        // Submit scan
        const submission = await this.submitScan(url);
        
        if (!submission.success) {
            return submission;
        }

        const scanId = submission.scanId;
        console.log(`⏳ Waiting for URLScan.io results (ID: ${scanId})...`);

        // Wait and retry to get results
        for (let i = 0; i < maxRetries; i++) {
            await this.sleep(retryDelay);
            
            const results = await this.getResults(scanId);
            
            if (results.success) {
                console.log('✅ URLScan.io results ready');
                return {
                    ...results,
                    submission
                };
            }
            
            if (!results.pending) {
                // Error that's not about pending results
                return results;
            }
            
            console.log(`⏳ Still waiting... (attempt ${i + 1}/${maxRetries})`);
        }

        return {
            success: false,
            error: 'Scan timeout - results not ready within expected time',
            timeout: true,
            scanId: scanId,
            submission
        };
    }

    /**
     * Quick scan without waiting (returns scan ID for later retrieval)
     * @param {string} url - URL to scan
     * @returns {Promise<Object>} - Submission result with scan ID
     */
    async quickScan(url) {
        const submission = await this.submitScan(url);
        
        if (submission.success) {
            console.log('✅ Quick scan submitted. Retrieve results later with scan ID:', submission.scanId);
        }
        
        return submission;
    }

    /**
     * Extract technology stack from scan data
     */
    extractTechnologies(data) {
        const tech = [];
        
        if (data.meta?.processors?.wappa?.data) {
            data.meta.processors.wappa.data.forEach(item => {
                tech.push({
                    name: item.app,
                    categories: item.categories || []
                });
            });
        }
        
        return tech;
    }

    /**
     * Get unique domains from requests
     */
    getUniqueDomains(requests) {
        const domains = new Set();
        requests.forEach(req => {
            if (req.request?.documentURL) {
                try {
                    const url = new URL(req.request.documentURL);
                    domains.add(url.hostname);
                } catch (e) {
                    // Invalid URL, skip
                }
            }
        });
        return Array.from(domains);
    }

    /**
     * Get unique countries from requests
     */
    getUniqueCountries(requests) {
        const countries = new Set();
        requests.forEach(req => {
            if (req.response?.response?.remoteIPAddress) {
                // Would need GeoIP lookup for actual country
                // For now, just return unique IPs
                countries.add(req.response.response.remoteIPAddress);
            }
        });
        return Array.from(countries);
    }

    /**
     * Extract security indicators
     */
    extractIndicators(data) {
        const indicators = [];

        // Check verdicts
        if (data.verdicts?.urlscan?.malicious) {
            indicators.push({
                type: 'malicious',
                severity: 'high',
                description: 'Flagged as malicious by URLScan.io',
                details: data.verdicts.urlscan.tags || []
            });
        }

        // Check for phishing
        if (data.verdicts?.overall?.categories?.includes('phishing')) {
            indicators.push({
                type: 'phishing',
                severity: 'high',
                description: 'Identified as phishing website'
            });
        }

        // Check for malware
        if (data.verdicts?.overall?.categories?.includes('malware')) {
            indicators.push({
                type: 'malware',
                severity: 'high',
                description: 'May contain malware'
            });
        }

        // Check SSL issues
        if (data.page?.tlsValidDays <= 0) {
            indicators.push({
                type: 'ssl',
                severity: 'medium',
                description: 'Invalid or expired SSL certificate'
            });
        }

        // Check for suspicious redirects
        if (data.data?.requests?.length > 0) {
            const redirects = data.data.requests.filter(r => 
                r.response?.response?.status >= 300 && 
                r.response?.response?.status < 400
            );
            
            if (redirects.length > 3) {
                indicators.push({
                    type: 'redirects',
                    severity: 'medium',
                    description: `Multiple redirects detected (${redirects.length})`
                });
            }
        }

        return indicators;
    }

    /**
     * Sleep utility
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Get service status
     */
    getStatus() {
        return {
            enabled: this.enabled,
            service: 'URLScan.io',
            features: [
                'Website screenshot capture',
                'SSL/TLS certificate validation',
                'Technology stack detection',
                'Malicious content detection',
                'Network request analysis',
                'Reputation scoring'
            ]
        };
    }
}

export default new URLScanService();
