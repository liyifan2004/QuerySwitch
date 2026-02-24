# QuerySwitch Implementation Plan

## Phase 1: Project Structure Setup
1. Create directory structure:
   ```
   query-switch/
   ├── manifest.json
   ├── background.js
   ├── content.js
   ├── popup/
   │   ├── popup.html
   │   ├── popup.css
   │   └── popup.js
   ├── options/
   │   ├── options.html
   │   ├── options.css
   │   └── options.js
   ├── _locales/
   │   ├── en/
   │   │   └── messages.json
   │   └── zh_CN/
   │       └── messages.json
   ├── icons/
   │   ├── icon16.png
   │   ├── icon32.png
   │   ├── icon48.png
   │   └── icon128.png
   └── shared/
       ├── utils.js
       └── constants.js
   ```

## Phase 2: Core Files Development

### 2.1 manifest.json
- Manifest V3 format
- Permissions: tabs, contextMenus, commands, storage, notifications
- Background service worker
- Content script for search pages
- Action popup
- Options page
- Commands for keyboard shortcuts

### 2.2 shared/constants.js
- Built-in search engines configuration:
  - Google: `https://www.google.com/search?q={query}`
  - Baidu: `https://www.baidu.com/s?wd={query}`
  - Bing: `https://www.bing.com/search?q={query}`
  - Yahoo: `https://search.yahoo.com/search?p={query}`
  - DuckDuckGo: `https://duckduckgo.com/?q={query}`
- URL pattern matchers for each engine

### 2.3 shared/utils.js
- `extractQueryFromURL(url, engine)` - Extract search query from URL
- `buildSearchURL(query, engine)` - Build target search URL
- `detectSearchEngine(url)` - Detect which engine the current page uses
- `getCurrentQuery()` - Get query from active tab

### 2.4 background.js
- Initialize context menu on install
- Handle context menu clicks
- Handle keyboard shortcuts (commands)
- Open new tab with switched search
- Manage storage for settings

### 2.5 content.js
- Detect if current page is search results
- Extract query from URL or DOM
- Listen for keyboard shortcuts
- Communicate with background script

### 2.6 popup/
- Show current detected query
- Display list of available engines
- Handle engine selection
- Link to options page

### 2.7 options/
- Manage built-in engines (enable/disable)
- Add/edit/delete custom engines
- Configure keyboard shortcuts
- Language selection
- Reset to defaults

### 2.8 _locales/
- English and Chinese translations
- All UI strings externalized

### 2.9 icons/
- Create simple SVG icon
- Generate PNG versions in multiple sizes

## Phase 3: Implementation Order
1. Create manifest.json
2. Create shared/constants.js with engine definitions
3. Create shared/utils.js with URL parsing functions
4. Create background.js with context menu
5. Create content.js for page detection
6. Create popup UI
7. Create options page
8. Add i18n support
9. Create icons
10. Test and debug

## Technical Notes
- Use chrome.storage.sync for settings
- Use URLSearchParams for query extraction
- Handle URL encoding properly for Chinese characters
- Minimal dependencies (vanilla JS only)
