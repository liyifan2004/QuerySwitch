/**
 * QuerySwitch - Options Page Script
 */

document.addEventListener('DOMContentLoaded', () => {
  initializeOptions();
});

/**
 * Initialize options page
 */
async function initializeOptions() {
  await loadSettings();
  await loadEngines();
  setupEventListeners();
}

/**
 * Load settings
 */
async function loadSettings() {
  const result = await chrome.storage.sync.get(STORAGE_KEYS.SETTINGS);
  const settings = result[STORAGE_KEYS.SETTINGS] || DEFAULT_SETTINGS;
  
  document.getElementById('language-select').value = settings.language || 'en';
}

/**
 * Load and display engines
 */
async function loadEngines() {
  const result = await chrome.storage.sync.get([
    STORAGE_KEYS.ENGINES,
    STORAGE_KEYS.CUSTOM_ENGINES
  ]);
  
  const engineSettings = result[STORAGE_KEYS.ENGINES] || {};
  const customEngines = result[STORAGE_KEYS.CUSTOM_ENGINES] || {};
  
  const enginesList = document.getElementById('engines-list');
  enginesList.innerHTML = '';
  
  // Add built-in engines
  for (const [id, engine] of Object.entries(BUILTIN_ENGINES)) {
    const enabled = engineSettings[id]?.enabled !== false;
    const item = createEngineListItem(id, engine, enabled, true);
    enginesList.appendChild(item);
  }
  
  // Add custom engines
  for (const [id, engine] of Object.entries(customEngines)) {
    const item = createEngineListItem(id, engine, true, false);
    enginesList.appendChild(item);
  }
}

/**
 * Create engine list item
 */
function createEngineListItem(id, engine, enabled, isBuiltin) {
  const item = document.createElement('div');
  item.className = 'engine-item';
  item.dataset.engineId = id;
  
  item.innerHTML = `
    <input type="checkbox" ${enabled ? 'checked' : ''} ${isBuiltin ? '' : 'disabled'}
           data-engine-id="${id}" class="engine-toggle">
    <div class="engine-info">
      <div class="engine-name">${escapeHtml(engine.name)}</div>
      <div class="engine-url">${escapeHtml(engine.searchURL)}</div>
    </div>
    ${isBuiltin ? '' : `
      <div class="engine-actions">
        <button class="btn btn-danger btn-delete" data-engine-id="${id}">Delete</button>
      </div>
    `}
  `;
  
  return item;
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  // Language change
  document.getElementById('language-select').addEventListener('change', async (e) => {
    const result = await chrome.storage.sync.get(STORAGE_KEYS.SETTINGS);
    const settings = result[STORAGE_KEYS.SETTINGS] || DEFAULT_SETTINGS;
    settings.language = e.target.value;
    await chrome.storage.sync.set({ [STORAGE_KEYS.SETTINGS]: settings });
  });
  
  // Engine toggle
  document.getElementById('engines-list').addEventListener('change', async (e) => {
    if (e.target.classList.contains('engine-toggle')) {
      const engineId = e.target.dataset.engineId;
      const enabled = e.target.checked;
      
      const result = await chrome.storage.sync.get(STORAGE_KEYS.ENGINES);
      const engines = result[STORAGE_KEYS.ENGINES] || {};
      
      engines[engineId] = { enabled };
      await chrome.storage.sync.set({ [STORAGE_KEYS.ENGINES]: engines });
    }
  });
  
  // Delete custom engine
  document.getElementById('engines-list').addEventListener('click', async (e) => {
    if (e.target.classList.contains('btn-delete')) {
      const engineId = e.target.dataset.engineId;
      
      if (confirm('Delete this custom engine?')) {
        const result = await chrome.storage.sync.get(STORAGE_KEYS.CUSTOM_ENGINES);
        const customEngines = result[STORAGE_KEYS.CUSTOM_ENGINES] || {};
        
        delete customEngines[engineId];
        await chrome.storage.sync.set({ [STORAGE_KEYS.CUSTOM_ENGINES]: customEngines });
        
        await loadEngines();
      }
    }
  });
  
  // Add engine button
  document.getElementById('add-engine-btn').addEventListener('click', () => {
    document.getElementById('add-engine-modal').classList.remove('hidden');
  });
  
  // Cancel add
  document.getElementById('cancel-add').addEventListener('click', () => {
    document.getElementById('add-engine-modal').classList.add('hidden');
    clearModalInputs();
  });
  
  // Confirm add
  document.getElementById('confirm-add').addEventListener('click', async () => {
    const name = document.getElementById('engine-name').value.trim();
    const url = document.getElementById('engine-url').value.trim();
    const pattern = document.getElementById('engine-pattern').value.trim();
    const param = document.getElementById('engine-param').value.trim();
    
    if (!name || !url || !pattern || !param) {
      alert('Please fill in all fields');
      return;
    }
    
    if (!url.includes('{query}')) {
      alert('URL must contain {query} placeholder');
      return;
    }
    
    const engineId = 'custom_' + Date.now();
    const newEngine = {
      name,
      searchURL: url,
      patterns: [new RegExp(pattern)],
      queryParam: param,
      enabled: true
    };
    
    const result = await chrome.storage.sync.get(STORAGE_KEYS.CUSTOM_ENGINES);
    const customEngines = result[STORAGE_KEYS.CUSTOM_ENGINES] || {};
    
    customEngines[engineId] = newEngine;
    await chrome.storage.sync.set({ [STORAGE_KEYS.CUSTOM_ENGINES]: customEngines });
    
    document.getElementById('add-engine-modal').classList.add('hidden');
    clearModalInputs();
    await loadEngines();
  });
  
  // Open shortcuts
  document.getElementById('open-shortcuts').addEventListener('click', (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });
  });
  
  // Reset
  document.getElementById('reset-btn').addEventListener('click', async () => {
    if (confirm('Reset all settings to defaults?')) {
      await chrome.storage.sync.set({
        [STORAGE_KEYS.ENGINES]: {},
        [STORAGE_KEYS.CUSTOM_ENGINES]: {},
        [STORAGE_KEYS.SETTINGS]: DEFAULT_SETTINGS
      });
      
      await loadSettings();
      await loadEngines();
    }
  });
}

/**
 * Clear modal inputs
 */
function clearModalInputs() {
  document.getElementById('engine-name').value = '';
  document.getElementById('engine-url').value = '';
  document.getElementById('engine-pattern').value = '';
  document.getElementById('engine-param').value = '';
}

/**
 * Escape HTML
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
