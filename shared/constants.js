/**
 * QuerySwitch - Constants
 * Built-in search engine configurations
 */

const BUILTIN_ENGINES = {
  google: {
    id: 'google',
    name: 'Google',
    searchURL: 'https://www.google.com/search?q={query}',
    patterns: [
      /google\.com.*[?&]q=/,
      /google\.com.*[?&]query=/
    ],
    queryParam: 'q',
    enabled: true
  },
  baidu: {
    id: 'baidu',
    name: 'Baidu',
    searchURL: 'https://www.baidu.com/s?wd={query}',
    patterns: [
      /baidu\.com.*[?&]wd=/,
      /baidu\.com.*[?&]word=/
    ],
    queryParam: 'wd',
    enabled: true
  },
  bing: {
    id: 'bing',
    name: 'Bing',
    searchURL: 'https://www.bing.com/search?q={query}',
    patterns: [
      /bing\.com.*[?&]q=/
    ],
    queryParam: 'q',
    enabled: true
  },
  yahoo: {
    id: 'yahoo',
    name: 'Yahoo',
    searchURL: 'https://search.yahoo.com/search?p={query}',
    patterns: [
      /yahoo\.com.*[?&]p=/,
      /search\.yahoo\.com.*[?&]p=/
    ],
    queryParam: 'p',
    enabled: true
  },
  duckduckgo: {
    id: 'duckduckgo',
    name: 'DuckDuckGo',
    searchURL: 'https://duckduckgo.com/?q={query}',
    patterns: [
      /duckduckgo\.com.*[?&]q=/
    ],
    queryParam: 'q',
    enabled: true
  }
};

// Storage keys
const STORAGE_KEYS = {
  ENGINES: 'engines',
  CUSTOM_ENGINES: 'customEngines',
  SETTINGS: 'settings'
};

// Default settings
const DEFAULT_SETTINGS = {
  language: 'en',
  showContextMenu: true,
  openInBackground: false
};

// Export for both module and global usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { BUILTIN_ENGINES, STORAGE_KEYS, DEFAULT_SETTINGS };
}

// For Chrome extension content scripts and service worker
if (typeof self !== 'undefined') {
  self.BUILTIN_ENGINES = BUILTIN_ENGINES;
  self.STORAGE_KEYS = STORAGE_KEYS;
  self.DEFAULT_SETTINGS = DEFAULT_SETTINGS;
}
