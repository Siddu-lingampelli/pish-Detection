// Background service worker for Chrome Extension
const API_URL = 'http://localhost:5000/api';

// Listen for tab updates (when user navigates to new page)
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  // Only scan when page is fully loaded
  if (changeInfo.status === 'complete' && tab.url) {
    // Skip chrome:// and extension pages
    if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
      return;
    }

    // Auto-scan in background
    await scanInBackground(tab.url, tabId);
  }
});

// Scan URL in background
async function scanInBackground(url, tabId) {
  try {
    const response = await fetch(`${API_URL}/scan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url })
    });

    if (!response.ok) {
      console.error('Background scan failed:', response.statusText);
      return;
    }

    const data = await response.json();

    // Update badge based on risk
    updateBadge(tabId, data.riskScore);

    // Show warning for high-risk sites
    if (data.riskScore >= 70) {
      // Inject warning overlay
      chrome.scripting.executeScript({
        target: { tabId },
        func: showWarningOverlay,
        args: [data.riskScore, data.threats || []]
      });

      // Send notification
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon48.png',
        title: '⚠️ Phishing Warning',
        message: `Risk Score: ${data.riskScore}/100 - This site may be dangerous!`,
        priority: 2
      });
    }

  } catch (error) {
    console.error('Background scan error:', error);
  }
}

// Update extension badge
function updateBadge(tabId, riskScore) {
  let color = '#10b981'; // Green
  let text = '✓';

  if (riskScore >= 70) {
    color = '#ef4444'; // Red
    text = '⚠';
  } else if (riskScore >= 40) {
    color = '#f59e0b'; // Yellow
    text = '!';
  }

  chrome.action.setBadgeBackgroundColor({ color, tabId });
  chrome.action.setBadgeText({ text, tabId });
}

// Function to inject warning overlay (runs in page context)
function showWarningOverlay(riskScore, threats) {
  // Check if overlay already exists
  if (document.getElementById('phishing-shield-overlay')) {
    return;
  }

  // Create overlay
  const overlay = document.createElement('div');
  overlay.id = 'phishing-shield-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.95);
    z-index: 999999999;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  `;

  overlay.innerHTML = `
    <div style="
      max-width: 500px;
      background: #111;
      border: 2px solid #ef4444;
      border-radius: 12px;
      padding: 32px;
      text-align: center;
      color: white;
    ">
      <div style="font-size: 64px; margin-bottom: 16px;">⚠️</div>
      <h1 style="font-size: 28px; margin-bottom: 12px; color: #ef4444;">
        Warning: High Risk Website
      </h1>
      <p style="font-size: 16px; color: #aaa; margin-bottom: 24px;">
        This website has a risk score of <strong style="color: #ef4444;">${riskScore}/100</strong>
      </p>
      <div style="background: #1a1a1a; padding: 16px; border-radius: 8px; margin-bottom: 24px; text-align: left;">
        <strong style="color: #ef4444;">⚠️ Detected Threats:</strong>
        <ul style="margin: 12px 0 0 24px; color: #ccc;">
          ${threats.map(t => `<li>${t}</li>`).join('') || '<li>Suspicious activity detected</li>'}
        </ul>
      </div>
      <div style="display: flex; gap: 12px;">
        <button id="phishing-proceed" style="
          flex: 1;
          padding: 12px 24px;
          background: #333;
          border: 1px solid #555;
          color: white;
          border-radius: 6px;
          font-size: 14px;
          cursor: pointer;
          font-weight: 600;
        ">
          Proceed Anyway (Not Recommended)
        </button>
        <button id="phishing-goback" style="
          flex: 1;
          padding: 12px 24px;
          background: white;
          border: none;
          color: black;
          border-radius: 6px;
          font-size: 14px;
          cursor: pointer;
          font-weight: 600;
        ">
          🛡️ Go Back to Safety
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  // Button handlers
  document.getElementById('phishing-proceed').addEventListener('click', () => {
    overlay.remove();
  });

  document.getElementById('phishing-goback').addEventListener('click', () => {
    window.history.back();
  });
}

// Listen for extension installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('Phishing Shield installed successfully!');
  
  // Set default settings
  chrome.storage.local.set({
    autoScan: true,
    showWarnings: true,
    scanHistory: []
  });
});
