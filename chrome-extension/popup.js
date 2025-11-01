// API Configuration
const API_URL = 'http://localhost:5000/api';

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

// Scan URL using backend API
async function scanURL(url) {
  const loadingDiv = document.getElementById('loading');
  const resultsDiv = document.getElementById('results');

  try {
    // Call your existing scan API
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

    // Hide loading, show results
    loadingDiv.classList.add('hidden');
    resultsDiv.classList.remove('hidden');

    // Update UI with results
    updateUI(data, url);

    // Save to history
    await saveToHistory(url, data);

    // Show notification if high risk
    if (data.riskScore >= 70) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon48.png',
        title: '⚠️ High Risk Website Detected!',
        message: `This website has a risk score of ${data.riskScore}/100. Be cautious!`,
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
    url: 'http://localhost:3000/scanner'
  });
});
