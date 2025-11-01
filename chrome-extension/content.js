// Content script - Runs on every page
console.log('🛡️ Phishing Shield active');

// Add subtle indicator that extension is active
const indicator = document.createElement('div');
indicator.id = 'phishing-shield-indicator';
indicator.style.cssText = `
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 12px;
  height: 12px;
  background: #10b981;
  border-radius: 50%;
  z-index: 999999;
  box-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
  pointer-events: none;
  opacity: 0;
  animation: fadeInOut 2s ease-in-out;
`;

// Add fade animation
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeInOut {
    0%, 100% { opacity: 0; }
    50% { opacity: 0.6; }
  }
`;
document.head.appendChild(style);
document.body.appendChild(indicator);

// Remove indicator after animation
setTimeout(() => {
  indicator.remove();
}, 2000);

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'showWarning') {
    showWarningOverlay(request.riskScore, request.threats);
  }
  sendResponse({ success: true });
});

// Check for common phishing indicators in the DOM
function checkPageIndicators() {
  const indicators = {
    suspiciousForms: 0,
    externalLinks: 0,
    iframes: 0
  };

  // Check for password forms
  const passwordInputs = document.querySelectorAll('input[type="password"]');
  if (passwordInputs.length > 0) {
    indicators.suspiciousForms++;
  }

  // Check for hidden iframes
  const iframes = document.querySelectorAll('iframe');
  iframes.forEach(iframe => {
    if (iframe.style.display === 'none' || iframe.style.visibility === 'hidden') {
      indicators.iframes++;
    }
  });

  return indicators;
}

// Run checks after page loads
window.addEventListener('load', () => {
  const indicators = checkPageIndicators();
  
  // Send to background script for analysis
  chrome.runtime.sendMessage({
    action: 'pageAnalysis',
    indicators
  });
});
