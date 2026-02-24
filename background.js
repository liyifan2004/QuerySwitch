/**
 * QuerySwitch - Background Service Worker
 * Handles context menu, keyboard shortcuts, and tab management
 */

// Import shared scripts for service worker context
// Note: In MV3 with type: 'module', we need to handle imports differently
// The constants and utils are loaded via importScripts but we need to ensure they're available
try {
  importScripts('shared/constants.js', 'shared/utils.js');
} catch (e) {
  console.error('Failed to import shared scripts:', e);
}

// Context menu ID
const CONTEXT_MENU_PARENT = 'queryswitch-parent';
const CONTEXT_MENU_SWITCH_TO = 'queryswitch-switch-to-';

/**
 * Initialize extension on install
 */
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    // Initialize storage with defaults
    await chrome.storage.sync.set({
      [STORAGE_KEYS.ENGINES]: {},
      [STORAGE_KEYS.CUSTOM_ENGINES]: {},
      [STORAGE_KEYS.SETTINGS]: DEFAULT_SETTINGS
    });
    
    console.log('[QuerySwitch] Extension installed successfully');
  }
  
  if (details.reason === 'update') {
    console.log('[QuerySwitch] Extension updated from version', details.previousVersion);
  }
  
  // Create context menu on install/update
  await createContextMenu();
});

// Also create context menu on startup (service worker may be restarted)
chrome.runtime.onStartup.addListener(async () => {
  console.log('[QuerySwitch] Extension started');
  await createContextMenu();
});

/**
 * Create context menu structure
 */
async function createContextMenu() {
  try {
    // Remove existing menus
    await chrome.contextMenus.removeAll();
    
    // Create parent menu item
    await new Promise((resolve, reject) => {
      chrome.contextMenus.create({
        id: CONTEXT_MENU_PARENT,
        title: chrome.i18n.getMessage('contextMenuTitle') || 'Switch Search Engine',
        contexts: ['all'],
        documentUrlPatterns: [
          '*://*.google.com/*',
          '*://*.google.com.*/*',
          '*://*.baidu.com/*',
          '*://*.bing.com/*',
          '*://*.yahoo.com/*',
          '*://*.duckduckgo.com/*'
        ]
      }, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
    
    // Get enabled engines and create submenu
    const engines = await getEnabledEngines();
    
    // Create submenu items in parallel
    const createPromises = engines.map(engine => {
      return new Promise((resolve, reject) => {
        chrome.contextMenus.create({
          id: `${CONTEXT_MENU_SWITCH_TO}${engine.id}`,
          parentId: CONTEXT_MENU_PARENT,
          title: engine.name,
          contexts: ['all'],
          documentUrlPatterns: [
            '*://*.google.com/*',
            '*://*.google.com.*/*',
            '*://*.baidu.com/*',
            '*://*.bing.com/*',
            '*://*.yahoo.com/*',
            '*://*.duckduckgo.com/*'
          ]
        }, () => {
          if (chrome.runtime.lastError) {
            console.warn(`Failed to create menu for ${engine.id}:`, chrome.runtime.lastError);
            // Don't reject, just log the error and continue
            resolve();
          } else {
            resolve();
          }
        });
      });
    });
    
    await Promise.all(createPromises);
    console.log('[QuerySwitch] Context menu created successfully with', engines.length, 'engines');
  } catch (error) {
    console.error('[QuerySwitch] Failed to create context menu:', error);
  }
}

/**
 * Handle context menu clicks
 */
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId.startsWith(CONTEXT_MENU_SWITCH_TO)) {
    const targetEngineId = info.menuItemId.replace(CONTEXT_MENU_SWITCH_TO, '');
    await handleSwitch(tab, targetEngineId);
  }
});

/**
 * Handle keyboard shortcuts
 */
chrome.commands.onCommand.addListener(async (command, tab) => {
  if (command.startsWith('switch-to-')) {
    const targetEngineId = command.replace('switch-to-', '');
    
    // Tab may be undefined in some cases, need to query active tab
    if (!tab) {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tabs.length === 0) {
        showNotification(
          'No active tab',
          'Please switch to a search results page first'
        );
        return;
      }
      tab = tabs[0];
    }
    
    await handleSwitch(tab, targetEngineId);
  }
});

/**
 * Handle search engine switch
 * @param {Object} tab - Current tab
 * @param {string} targetEngineId - Target engine ID
 */
async function handleSwitch(tab, targetEngineId) {
  try {
    // Validate tab object
    if (!tab || !tab.url) {
      showNotification(
        'Error',
        'Cannot access current page. Please refresh and try again.'
      );
      return;
    }
    
    const currentEngine = detectSearchEngine(tab.url);
    
    if (!currentEngine) {
      showNotification(
        'Not a search page',
        'Current page is not a recognized search results page'
      );
      return;
    }
    
    // Extract query from current URL
    const query = extractQueryFromURL(tab.url, currentEngine);
    
    if (!query) {
      showNotification(
        'No query found',
        'Could not extract search query from current page'
      );
      return;
    }
    
    // Get target engine
    const engines = await getEnabledEngines();
    const targetEngine = engines.find(e => e.id === targetEngineId);
    
    if (!targetEngine) {
      showNotification(
        'Engine not found',
        `Search engine '${targetEngineId}' is not available`
      );
      return;
    }
    
    // Open search in new tab
    await openSearchInNewTab(query, targetEngine, tab.id);
    
  } catch (error) {
    console.error('Error switching search engine:', error);
    showNotification(
      'Error',
      'Failed to switch search engine'
    );
  }
}

/**
 * Show browser notification
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 */
function showNotification(title, message) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon128.png',
    title,
    message
  });
}

/**
 * Listen for storage changes to update context menu
 */
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync' && changes[STORAGE_KEYS.ENGINES]) {
    createContextMenu();
  }
});

/**
 * Handle messages from content scripts and popup
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getCurrentQuery') {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      if (tabs.length === 0) {
        sendResponse({ error: 'No active tab' });
        return;
      }
      
      const tab = tabs[0];
      const engine = detectSearchEngine(tab.url);
      
      if (!engine) {
        sendResponse({ isSearchPage: false });
        return;
      }
      
      const query = extractQueryFromURL(tab.url, engine);
      sendResponse({
        isSearchPage: true,
        query,
        currentEngine: engine.id
      });
    });
    return true; // Keep message channel open for async
  }
  
  if (request.action === 'switchToEngine') {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      if (tabs.length > 0) {
        await handleSwitch(tabs[0], request.engineId);
      }
    });
    sendResponse({ success: true });
  }
});
