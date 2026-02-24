/**
 * QuerySwitch - Options Page Script
 */

// Store for shortcut inputs
let shortcutInputs = {};

// Default shortcuts from manifest
const DEFAULT_SHORTCUTS = {
  'switch-to-google': 'Ctrl+Shift+G',
  'switch-to-baidu': 'Ctrl+Shift+B',
  'switch-to-bing': 'Ctrl+Shift+M'
};

document.addEventListener('DOMContentLoaded', () => {
  initializeOptions();
});

/**
 * Initialize options page
 */
async function initializeOptions() {
  await loadSettings();
  await loadEngines();
  await loadShortcuts();
  setupEventListeners();
  await initializeI18n(); // Initialize language on page load
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
 * Load and display keyboard shortcuts
 */
async function loadShortcuts() {
  const shortcutsList = document.getElementById('shortcuts-list');
  shortcutsList.innerHTML = '';
  shortcutInputs = {};
  
  try {
    // Get all commands
    const commands = await chrome.commands.getAll();
    
    for (const command of commands) {
      if (command.name.startsWith('switch-to-')) {
        const engineId = command.name.replace('switch-to-', '');
        const engineName = BUILTIN_ENGINES[engineId]?.name || engineId;
        
        const shortcutItem = createShortcutItem(command.name, engineName, command.shortcut);
        shortcutsList.appendChild(shortcutItem);
      }
    }
  } catch (error) {
    console.error('Error loading shortcuts:', error);
    shortcutsList.innerHTML = '<p class="error">Failed to load shortcuts</p>';
  }
}

/**
 * Create shortcut input item
 */
function createShortcutItem(commandName, engineName, currentShortcut) {
  const item = document.createElement('div');
  item.className = 'shortcut-item';
  
  const shortcutId = `shortcut-${commandName}`;
  shortcutInputs[commandName] = {
    shortcut: currentShortcut || '',
    element: null
  };
  
  item.innerHTML = `
    <div class="shortcut-info">
      <div class="shortcut-name">${escapeHtml(engineName)}</div>
      <div class="shortcut-command">${escapeHtml(commandName)}</div>
    </div>
    <div class="shortcut-input-wrapper">
      <input type="text" 
             id="${shortcutId}" 
             class="shortcut-input" 
             value="${escapeHtml(currentShortcut || '')}" 
             placeholder="Click to set shortcut"
             readonly>
      <button class="btn btn-small btn-clear-shortcut" data-command="${commandName}">✕</button>
    </div>
  `;
  
  // Store reference to input element
  const input = item.querySelector('.shortcut-input');
  shortcutInputs[commandName].element = input;
  
  // Add keyboard capture
  input.addEventListener('keydown', (e) => handleShortcutKeydown(e, commandName));
  input.addEventListener('focus', () => {
    input.placeholder = 'Press keys...';
  });
  input.addEventListener('blur', () => {
    input.placeholder = 'Click to set shortcut';
  });
  
  // Add clear button handler
  const clearBtn = item.querySelector('.btn-clear-shortcut');
  clearBtn.addEventListener('click', () => {
    shortcutInputs[commandName].shortcut = '';
    input.value = '';
  });
  
  return item;
}

/**
 * Handle keydown for shortcut input
 */
function handleShortcutKeydown(e, commandName) {
  e.preventDefault();
  e.stopPropagation();
  
  // Allow Escape to cancel
  if (e.key === 'Escape') {
    e.target.blur();
    return;
  }
  
  // Allow Backspace/Delete to clear
  if (e.key === 'Backspace' || e.key === 'Delete') {
    shortcutInputs[commandName].shortcut = '';
    e.target.value = '';
    return;
  }
  
  // Build shortcut string
  const parts = [];
  
  if (e.ctrlKey) parts.push('Ctrl');
  if (e.altKey) parts.push('Alt');
  if (e.shiftKey) parts.push('Shift');
  if (e.metaKey) parts.push('Command');
  
  // Add the key (ignore modifiers alone)
  const key = e.key;
  if (key && !['Control', 'Alt', 'Shift', 'Meta'].includes(key)) {
    // Capitalize single letters
    const formattedKey = key.length === 1 ? key.toUpperCase() : key;
    parts.push(formattedKey);
    
    const shortcut = parts.join('+');
    shortcutInputs[commandName].shortcut = shortcut;
    e.target.value = shortcut;
  }
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
    
    // Immediately update UI language
    await updatePageLanguage();
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
  
  // Save shortcuts
  document.getElementById('save-shortcuts').addEventListener('click', saveShortcuts);
  
  // Reset shortcuts
  document.getElementById('reset-shortcuts').addEventListener('click', resetShortcuts);
  
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
      await loadShortcuts();
    }
  });
}

/**
 * Save keyboard shortcuts
 */
async function saveShortcuts() {
  try {
    let updatedCount = 0;
    
    for (const [commandName, data] of Object.entries(shortcutInputs)) {
      const newShortcut = data.shortcut;
      
      // Update the command
      await chrome.commands.update({
        name: commandName,
        shortcut: newShortcut || ''
      });
      
      updatedCount++;
    }
    
    // Show success message
    const messages = await loadMessages(currentLanguage || 'en');
    const savedText = getMessageFromObject(messages, 'shortcutsSaved') || 'Shortcuts saved successfully!';
    alert(savedText);
    
    // Reload shortcuts to show updated state
    await loadShortcuts();
  } catch (error) {
    console.error('Error saving shortcuts:', error);
    alert('Failed to save shortcuts: ' + error.message);
  }
}

/**
 * Reset shortcuts to defaults
 */
async function resetShortcuts() {
  if (!confirm('Reset all shortcuts to default?')) {
    return;
  }
  
  try {
    for (const [commandName, defaultShortcut] of Object.entries(DEFAULT_SHORTCUTS)) {
      await chrome.commands.update({
        name: commandName,
        shortcut: defaultShortcut
      });
    }
    
    await loadShortcuts();
    
    const messages = await loadMessages(currentLanguage || 'en');
    const resetText = getMessageFromObject(messages, 'shortcutsReset') || 'Shortcuts reset to default!';
    alert(resetText);
  } catch (error) {
    console.error('Error resetting shortcuts:', error);
    alert('Failed to reset shortcuts: ' + error.message);
  }
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
