// API Configuration
let API_URL = 'http://localhost:5000/api';
let WEB_APP_URL = 'http://localhost:3000';

chrome.storage.local.get(['apiUrl', 'webAppUrl'], (result) => {
  if (result.apiUrl) API_URL = result.apiUrl.replace(/\/+$/, '') + '/api';
  if (result.webAppUrl) WEB_APP_URL = result.webAppUrl;
});

// Get current tab URL and scan it
document.addEventListener('DOMContentLoaded', async () => {
  const loadingDiv = document.getElementById('loading');
  const resultsDiv = document.getElementById('results');
  
  try {
    // Get current tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const url = tab.url;

    // Show URL
    document.getElementById('currentUrl').textContent = url;

    // Scan the URL
    await scanURL(url);

  } catch (error) {
    console.error('Extension error:', error);
    showError('Failed to scan page. Please try again.');
  }
});

// Map server response to a 0-100 numeric riskScore for the popup UI
function deriveRiskScore(serverData) {
  const inner = serverData?.data || {};
  const confidence = Number(inner.confidence_score);
  const result = String(inner.result || '').toLowerCase();
  let base;
  if (!isNaN(confidence)) {
    base = result === 'phishing' ? Math.round(confidence * 100)
         : result === 'suspicious' ? Math.round(confidence * 100)
         : Math.round((1 - confidence) * 100);
  } else {
    base = 0;
  }
  const factorBoost = Math.min(20, (inner.meta_data?.risk_factors?.length || 0) * 5);
  return Math.max(0, Math.min(100, base + factorBoost));
}

function deriveThreats(serverData) {
  const inner = serverData?.data || {};
  return Array.isArray(inner.meta_data?.risk_factors) ? inner.meta_data.risk_factors : [];
}

// Scan URL using backend API
async function scanURL(url) {
  const loadingDiv = document.getElementById('loading');
  const resultsDiv = document.getElementById('results');

  try {
    const response = await fetch(`${API_URL}/scan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url })
    });

    if (!response.ok) {
      throw new Error('Scan failed');
    }

    const data = await response.json();

    loadingDiv.classList.add('hidden');
    resultsDiv.classList.remove('hidden');

    const riskScore = deriveRiskScore(data);
    const threats = deriveThreats(data);
    const displayData = { riskScore, threats };

    updateUI(displayData, url);

    await saveToHistory(url, displayData);

    if (riskScore >= 70) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon48.svg',
        title: '⚠️ High Risk Website Detected!',
        message: `This website has a risk score of ${riskScore}/100. Be cautious!`,
        priority: 2
      });
    }

  } catch (error) {
    console.error('Scan error:', error);
    loadingDiv.classList.add('hidden');
    resultsDiv.classList.remove('hidden');
    showError('Unable to scan. Make sure the backend server is running.');
  }
}

// Update UI with scan results
function updateUI(data, url) {
  const statusIcon = document.getElementById('statusIcon');
  const statusTitle = document.getElementById('statusTitle');
  const statusSubtitle = document.getElementById('statusSubtitle');
  const riskLevel = document.getElementById('riskLevel');
  const riskScore = document.getElementById('riskScore');
  const httpsStatus = document.getElementById('httpsStatus');

  // Determine risk level
  let level = 'LOW';
  let statusClass = 'safe';
  let icon = '✓';
  let title = 'Safe Website';
  let subtitle = 'No threats detected';

  if (data.riskScore >= 70) {
    level = 'HIGH';
    statusClass = 'danger';
    icon = '⚠️';
    title = 'High Risk Detected';
    subtitle = 'This website may be dangerous';
  } else if (data.riskScore >= 40) {
    level = 'MEDIUM';
    statusClass = 'warning';
    icon = '⚠';
    title = 'Proceed with Caution';
    subtitle = 'Some suspicious elements found';
  }

  // Update status icon
  statusIcon.className = `status-icon ${statusClass}`;
  statusIcon.textContent = icon;

  // Update text
  statusTitle.textContent = title;
  statusSubtitle.textContent = subtitle;

  // Update details
  riskLevel.textContent = level;
  riskLevel.className = `detail-value ${statusClass}`;
  riskScore.textContent = `${data.riskScore}/100`;

  // Check HTTPS
  const isHttps = url.startsWith('https://');
  httpsStatus.textContent = isHttps ? '✓' : '✗';
  httpsStatus.className = `detail-value ${isHttps ? 'safe' : 'danger'}`;
}

// Show error message
function showError(message) {
  const statusIcon = document.getElementById('statusIcon');
  const statusTitle = document.getElementById('statusTitle');
  const statusSubtitle = document.getElementById('statusSubtitle');

  statusIcon.className = 'status-icon warning';
  statusIcon.textContent = '⚠';
  statusTitle.textContent = 'Scan Error';
  statusSubtitle.textContent = message;

  document.getElementById('riskLevel').textContent = 'UNKNOWN';
  document.getElementById('riskScore').textContent = '-/100';
}

// Save scan to local storage history
async function saveToHistory(url, data) {
  const result = await chrome.storage.local.get(['scanHistory']);
  const history = result.scanHistory || [];

  history.unshift({
    url,
    riskScore: data.riskScore,
    timestamp: new Date().toISOString(),
    threats: data.threats || []
  });

  // Keep only last 100 scans
  if (history.length > 100) {
    history.pop();
  }

  await chrome.storage.local.set({ scanHistory: history });
}

// Button handlers
document.getElementById('scanAgain').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  // Show loading
  document.getElementById('loading').classList.remove('hidden');
  document.getElementById('results').classList.add('hidden');

  // Scan again
  await scanURL(tab.url);
});

document.getElementById('viewDetails').addEventListener('click', () => {
  // Open your web app with the scan results
  chrome.tabs.create({
    url: `${WEB_APP_URL}/scanner`
  });
});
