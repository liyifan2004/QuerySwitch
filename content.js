/**
 * QuerySwitch - Content Script
 * Runs on search engine pages to detect queries and handle keyboard shortcuts
 */

/**
 * Get current page query information
 * @returns {Object} Query info
 */
function getCurrentPageQuery() {
  const engine = detectSearchEngine(window.location.href);
  
  if (!engine) {
    return { isSearchPage: false };
  }
  
  const query = extractQueryFromURL(window.location.href, engine);
  
  return {
    isSearchPage: true,
    query,
    engine: engine.id,
    engineName: engine.name
  };
}

/**
 * Listen for keyboard events (shortcuts handled by background)
 * This script mainly provides page detection capability
 */
document.addEventListener('DOMContentLoaded', () => {
  // Notify background script that we're on a search page
  const pageInfo = getCurrentPageQuery();
  
  if (pageInfo.isSearchPage) {
    console.log('[QuerySwitch] Detected search page:', pageInfo.engineName, '- Query:', pageInfo.query);
    
    // Send message to background (optional, for future features)
    chrome.runtime.sendMessage({
      action: 'pageLoaded',
      data: pageInfo
    }).catch(() => {
      // Background may not be listening, ignore error
    });
  }
});

/**
 * Listen for messages from popup/background
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getPageInfo') {
    sendResponse(getCurrentPageQuery());
    return true;
  }
});
