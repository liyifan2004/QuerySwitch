/**
 * QuerySwitch - Internationalization Utilities
 * Handles language switching and text replacement
 */

/**
 * Initialize i18n for the current page
 * Replaces all elements with data-i18n attribute with translated text
 */
function initializeI18n() {
  updatePageLanguage();
}

/**
 * Update page text based on current language setting
 */
async function updatePageLanguage() {
  // Get current language from storage
  const result = await chrome.storage.sync.get(STORAGE_KEYS.SETTINGS);
  const settings = result[STORAGE_KEYS.SETTINGS] || DEFAULT_SETTINGS;
  const currentLang = settings.language || 'en';
  
  // Update all elements with data-i18n attribute
  const elements = document.querySelectorAll('[data-i18n]');
  elements.forEach(element => {
    const messageKey = element.getAttribute('data-i18n');
    if (messageKey) {
      const translatedText = chrome.i18n.getMessage(messageKey);
      if (translatedText) {
        // For input elements, update placeholder or value
        if (element.tagName === 'INPUT') {
          if (element.type === 'button' || element.type === 'submit') {
            element.value = translatedText;
          } else {
            element.placeholder = translatedText;
          }
        } else {
          element.textContent = translatedText;
        }
      }
    }
  });
  
  // Update document title if it has i18n attribute
  if (document.title && document.querySelector('title[data-i18n]')) {
    const titleKey = document.querySelector('title').getAttribute('data-i18n');
    const translatedTitle = chrome.i18n.getMessage(titleKey);
    if (translatedTitle) {
      document.title = translatedTitle;
    }
  }
}

/**
 * Get localized message by key
 * @param {string} key - Message key
 * @param {string[]} substitutions - Optional substitutions
 * @returns {string} - Localized message or key if not found
 */
function getMessage(key, substitutions = []) {
  return chrome.i18n.getMessage(key, substitutions) || key;
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { initializeI18n, updatePageLanguage, getMessage };
}

// For Chrome extension content scripts and service worker
if (typeof self !== 'undefined') {
  self.initializeI18n = initializeI18n;
  self.updatePageLanguage = updatePageLanguage;
  self.getMessage = getMessage;
}
