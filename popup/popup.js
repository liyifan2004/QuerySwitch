/**
 * QuerySwitch - Popup Script
 * Handles popup UI interactions
 */

document.addEventListener('DOMContentLoaded', async () => {
  await initializePopup();
});

/**
 * Initialize popup
 */
async function initializePopup() {
  // Initialize i18n text
  await initializeI18n();
  
  // Get current tab info
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  
  if (tabs.length === 0) {
    showNoSearchPage();
    return;
  }
  
  const tab = tabs[0];
  
  // Send message to content script to get page info
  try {
    const response = await chrome.tabs.sendMessage(tab.id, { action: 'getPageInfo' });
    
    if (response && response.isSearchPage) {
      showSearchPage(response.query, response.engine);
      await loadEngines(response.engine);
    } else {
      showNoSearchPage();
    }
  } catch (error) {
    // Content script not loaded or not a search page
    showNoSearchPage();
  }
}

/**
 * Show search page UI
 * @param {string} query - Current query
 * @param {string} currentEngineId - Current engine ID
 */
function showSearchPage(query, currentEngineId) {
  document.getElementById('query-section').classList.remove('hidden');
  document.getElementById('engines-section').classList.remove('hidden');
  document.getElementById('no-search-page').classList.add('hidden');
  
  document.getElementById('current-query').textContent = query || '-';
}

/**
 * Show no search page UI
 */
function showNoSearchPage() {
  document.getElementById('query-section').classList.add('hidden');
  document.getElementById('engines-section').classList.add('hidden');
  document.getElementById('no-search-page').classList.remove('hidden');
}

/**
 * Load and display available engines
 * @param {string} currentEngineId - Current engine ID to exclude
 */
async function loadEngines(currentEngineId) {
  const enginesList = document.getElementById('engines-list');
  enginesList.innerHTML = '';
  
  try {
    // Get enabled engines from storage
    const result = await chrome.storage.sync.get([
      STORAGE_KEYS.ENGINES,
      STORAGE_KEYS.CUSTOM_ENGINES
    ]);
    
    const engineSettings = result[STORAGE_KEYS.ENGINES] || {};
    const customEngines = result[STORAGE_KEYS.CUSTOM_ENGINES] || {};
    
    // Merge engines
    const allEngines = { ...BUILTIN_ENGINES, ...customEngines };
    
    // Filter enabled engines (excluding current)
    const enabledEngines = Object.entries(allEngines)
      .filter(([id, engine]) => {
        const isEnabled = engineSettings[id]?.enabled !== false;
        return isEnabled && id !== currentEngineId;
      })
      .map(([id, engine]) => ({ ...engine, id }));
    
    if (enabledEngines.length === 0) {
      enginesList.innerHTML = '<p style="color: #999; text-align: center;">No other engines available</p>';
      return;
    }
    
    // Create engine items
    for (const engine of enabledEngines) {
      const item = createEngineItem(engine);
      enginesList.appendChild(item);
    }
    
  } catch (error) {
    console.error('Error loading engines:', error);
    enginesList.innerHTML = '<p style="color: #999; text-align: center;">Error loading engines</p>';
  }
}

/**
 * Create engine item element
 * @param {Object} engine - Engine configuration
 * @returns {HTMLElement}
 */
function createEngineItem(engine) {
  const item = document.createElement('div');
  item.className = 'engine-item';
  item.dataset.engineId = engine.id;
  
  // Get first letter for icon
  const initial = engine.name.charAt(0).toUpperCase();
  
  item.innerHTML = `
    <div class="engine-icon ${engine.id}">${initial}</div>
    <span class="engine-name">${escapeHtml(engine.name)}</span>
  `;
  
  item.addEventListener('click', () => {
    switchToEngine(engine.id);
  });
  
  return item;
}

/**
 * Switch to selected engine
 * @param {string} engineId - Target engine ID
 */
async function switchToEngine(engineId) {
  try {
    await chrome.runtime.sendMessage({
      action: 'switchToEngine',
      engineId: engineId
    });
    
    // Close popup
    window.close();
  } catch (error) {
    console.error('Error switching engine:', error);
  }
}

/**
 * Escape HTML special characters
 * @param {string} text
 * @returns {string}
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
