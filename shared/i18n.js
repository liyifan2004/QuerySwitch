/**
 * QuerySwitch - Internationalization Utilities
 * Handles language switching and text replacement
 */

// Cache for loaded messages
let messagesCache = {};
let currentLanguage = 'en';

/**
 * Initialize i18n for the current page
 * Replaces all elements with data-i18n attribute with translated text
 */
async function initializeI18n() {
  await updatePageLanguage();
}

/**
 * Load messages for a specific language
 * @param {string} lang - Language code
 * @returns {Object} - Messages object
 */
async function loadMessages(lang) {
  if (messagesCache[lang]) {
    return messagesCache[lang];
  }
  
  try {
    // Try to fetch the messages file
    const response = await fetch(chrome.runtime.getURL(`_locales/${lang}/messages.json`));
    if (!response.ok) {
      throw new Error(`Failed to load messages for ${lang}`);
    }
    const messages = await response.json();
    messagesCache[lang] = messages;
    return messages;
  } catch (error) {
    console.warn(`[QuerySwitch] Failed to load messages for ${lang}:`, error);
    // Fallback to English
    if (lang !== 'en') {
      return loadMessages('en');
    }
    return {};
  }
}

/**
 * Get message by key from loaded messages
 * @param {Object} messages - Messages object
 * @param {string} key - Message key
 * @returns {string} - Message text or key if not found
 */
function getMessageFromObject(messages, key) {
  if (messages[key] && messages[key].message) {
    return messages[key].message;
  }
  return key;
}

/**
 * Update page text based on current language setting
 */
async function updatePageLanguage() {
  // Get current language from storage
  const result = await chrome.storage.sync.get(STORAGE_KEYS.SETTINGS);
  const settings = result[STORAGE_KEYS.SETTINGS] || DEFAULT_SETTINGS;
  currentLanguage = settings.language || 'en';
  
  // Load messages for current language
  const messages = await loadMessages(currentLanguage);
  
  // Update all elements with data-i18n attribute
  const elements = document.querySelectorAll('[data-i18n]');
  elements.forEach(element => {
    const messageKey = element.getAttribute('data-i18n');
    if (messageKey) {
      const translatedText = getMessageFromObject(messages, messageKey);
      if (translatedText && translatedText !== messageKey) {
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
  const titleElement = document.querySelector('title[data-i18n]');
  if (titleElement) {
    const titleKey = titleElement.getAttribute('data-i18n');
    const translatedTitle = getMessageFromObject(messages, titleKey);
    if (translatedTitle && translatedTitle !== titleKey) {
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
async function getMessage(key, substitutions = []) {
  const result = await chrome.storage.sync.get(STORAGE_KEYS.SETTINGS);
  const settings = result[STORAGE_KEYS.SETTINGS] || DEFAULT_SETTINGS;
  const lang = settings.language || 'en';
  
  const messages = await loadMessages(lang);
  let message = getMessageFromObject(messages, key);
  
  // Handle substitutions
  if (substitutions.length > 0) {
    substitutions.forEach((sub, index) => {
      message = message.replace(new RegExp(`\\$${index + 1}`, 'g'), sub);
    });
  }
  
  return message;
}

/**
 * Synchronous version of getMessage (uses cache)
 * @param {string} key - Message key
 * @returns {string} - Localized message or key if not found
 */
function getMessageSync(key) {
  const messages = messagesCache[currentLanguage] || {};
  return getMessageFromObject(messages, key);
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { initializeI18n, updatePageLanguage, getMessage, getMessageSync };
}

// For Chrome extension content scripts and service worker
if (typeof self !== 'undefined') {
  self.initializeI18n = initializeI18n;
  self.updatePageLanguage = updatePageLanguage;
  self.getMessage = getMessage;
  self.getMessageSync = getMessageSync;
}
