/**
 * QuerySwitch - Utility Functions
 */

/**
 * Extract search query from URL based on engine configuration
 * @param {string} url - Current page URL
 * @param {Object} engine - Engine configuration
 * @returns {string|null} - Extracted query or null
 */
function extractQueryFromURL(url, engine) {
  try {
    const urlObj = new URL(url);
    const params = new URLSearchParams(urlObj.search);
    const query = params.get(engine.queryParam);
    if (query) {
      return decodeURIComponent(query);
    }
  } catch (e) {
    console.error('Error extracting query:', e);
  }
  return null;
}

/**
 * Build search URL for target engine
 * @param {string} query - Search query
 * @param {Object} engine - Target engine configuration
 * @returns {string} - Complete search URL
 */
function buildSearchURL(query, engine) {
  const encodedQuery = encodeURIComponent(query);
  return engine.searchURL.replace('{query}', encodedQuery);
}

/**
 * Detect which search engine the current URL belongs to
 * @param {string} url - Current page URL
 * @returns {Object|null} - Detected engine or null
 */
function detectSearchEngine(url) {
  for (const [key, engine] of Object.entries(BUILTIN_ENGINES)) {
    for (const pattern of engine.patterns) {
      if (pattern.test(url)) {
        return engine;
      }
    }
  }
  return null;
}

/**
 * Check if URL is a search results page
 * @param {string} url - URL to check
 * @returns {boolean}
 */
function isSearchResultsPage(url) {
  return detectSearchEngine(url) !== null;
}

/**
 * Get all enabled engines (built-in + custom)
 * @returns {Promise<Array>} - Array of enabled engines
 */
async function getEnabledEngines() {
  const result = await chrome.storage.sync.get([
    STORAGE_KEYS.ENGINES,
    STORAGE_KEYS.CUSTOM_ENGINES
  ]);
  
  const engines = result[STORAGE_KEYS.ENGINES] || {};
  const customEngines = result[STORAGE_KEYS.CUSTOM_ENGINES] || {};
  
  // Merge built-in and custom engines
  const allEngines = { ...BUILTIN_ENGINES, ...customEngines };
  
  // Apply enabled settings
  const enabledEngines = [];
  for (const [id, engine] of Object.entries(allEngines)) {
    const enabled = engines[id]?.enabled !== false; // Default to true
    if (enabled) {
      enabledEngines.push({ ...engine, id });
    }
  }
  
  return enabledEngines;
}

/**
 * Open search in new tab
 * @param {string} query - Search query
 * @param {Object} targetEngine - Target engine
 * @param {number} currentTabId - Current tab ID
 */
async function openSearchInNewTab(query, targetEngine, currentTabId) {
  const searchURL = buildSearchURL(query, targetEngine);
  await chrome.tabs.create({
    url: searchURL,
    index: currentTabId + 1,
    active: true
  });
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    extractQueryFromURL,
    buildSearchURL,
    detectSearchEngine,
    isSearchResultsPage,
    getEnabledEngines,
    openSearchInNewTab
  };
}

// For Chrome extension content scripts and service worker
if (typeof self !== 'undefined') {
  self.extractQueryFromURL = extractQueryFromURL;
  self.buildSearchURL = buildSearchURL;
  self.detectSearchEngine = detectSearchEngine;
  self.isSearchResultsPage = isSearchResultsPage;
  self.getEnabledEngines = getEnabledEngines;
  self.openSearchInNewTab = openSearchInNewTab;
}
