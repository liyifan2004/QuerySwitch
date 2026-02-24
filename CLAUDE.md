# QuerySwitch Browser Extension

## Project Overview
Building a browser extension (Manifest V3) that allows users to quickly switch search results from one search engine to another.

## Key Features
1. Auto-detect search results pages and extract keywords
2. Three trigger methods: context menu, toolbar popup, keyboard shortcuts
3. Built-in support: Google, Baidu, Bing, Yahoo, DuckDuckGo
4. User can add custom search engines
5. Options page for configuration
6. Multilingual support (English/Chinese)

## Architecture (Manifest V3)
- `manifest.json` - Extension manifest
- `background.js` - Service worker for context menu, tab management
- `content.js` - Content script for page detection and keyword extraction
- `popup/` - Toolbar popup UI (HTML/CSS/JS)
- `options/` - Options page for settings
- `_locales/` - i18n strings (en, zh_CN)
- `icons/` - Extension icons

## Development Plan
1. Create project structure and manifest.json
2. Implement keyword extraction from URLs
3. Implement context menu functionality
4. Create popup UI
5. Create options page
6. Add keyboard shortcuts
7. Add i18n support
8. Testing and polish

## Technical Requirements
- Vanilla JS (no frameworks)
- chrome.storage.sync for settings
- Minimal permissions: tabs, contextMenus, commands, storage, notifications
- Clean, modern UI design

## Current Step
Read PRD.md for full requirements, then create implementation plan.
