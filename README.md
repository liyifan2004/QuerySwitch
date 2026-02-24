# QuerySwitch 🔍➡️

一个简洁优雅的浏览器扩展，让你在搜索结果页面快速切换不同搜索引擎。

[English](#english) | [中文](#中文)

---

## 中文

### 📖 简介

QuerySwitch 是一款浏览器扩展，当你在 Google、百度、Bing 等搜索引擎查看结果时，可以一键将当前搜索词切换到其他搜索引擎查看结果。无需复制粘贴关键词，大大提高搜索效率。

### ✨ 功能特性

- **🎯 智能识别**: 自动检测当前所在搜索引擎和搜索关键词
- **🖱️ 右键菜单**: 在搜索结果页右键即可快速切换
- **🔧 工具栏弹窗**: 点击扩展图标查看当前关键词和切换选项
- **⌨️ 快捷键**: 支持自定义键盘快捷键（默认 Ctrl+Shift+G/B/M）
- **🔍 内置引擎**: Google、百度、Bing、Yahoo、DuckDuckGo
- **➕ 自定义引擎**: 支持添加你自己的搜索引擎
- **🌍 双语界面**: 支持简体中文和英文
- **☁️ 同步设置**: 使用浏览器同步功能保存配置

### 📥 安装方法

#### 方法一：Chrome Web Store（推荐）

> 正在审核中，即将上架...

#### 方法二：开发者模式安装（立即使用）

1. 下载最新版本：访问 [Releases 页面](https://github.com/liyifan2004/QuerySwitch/releases) 下载 `QuerySwitch-v1.0.zip`
2. 解压下载的文件
3. 打开 Chrome/Edge 浏览器，进入 `chrome://extensions/` 或 `edge://extensions/`
4. 开启右上角的「开发者模式」
5. 点击「加载已解压的扩展程序」
6. 选择解压后的文件夹
7. 完成！扩展图标会出现在工具栏

### 🚀 使用指南

#### 右键菜单切换
1. 在任意支持的搜索结果页面（Google、百度等）
2. 在页面空白处右键
3. 选择「切换搜索引擎」
4. 点击目标搜索引擎

#### 工具栏弹窗切换
1. 点击浏览器工具栏上的 QuerySwitch 图标
2. 查看当前搜索关键词
3. 点击想要切换的搜索引擎

#### 快捷键切换
- `Ctrl+Shift+G` - 切换到 Google
- `Ctrl+Shift+B` - 切换到百度
- `Ctrl+Shift+M` - 切换到 Bing

> 快捷键可在浏览器扩展设置中自定义

### ⚙️ 选项设置

1. 点击工具栏图标 → 点击「选项」
2. 或在扩展管理页面点击「详情」→「扩展程序选项」

可配置项：
- **语言**: 切换界面语言（中文/英文）
- **搜索引擎**: 启用/禁用内置引擎，添加自定义引擎
- **快捷键**: 跳转到浏览器快捷键设置

### 🛠️ 技术细节

- **规范**: Manifest V3
- **权限**: tabs, contextMenus, commands, storage, notifications
- **存储**: chrome.storage.sync（跨设备同步）
- **技术栈**: Vanilla JavaScript，无外部依赖

---

## English

### 📖 Introduction

QuerySwitch is a browser extension that allows you to quickly switch your search query from one search engine to another. No more copying and pasting keywords - just one click to see results on a different engine.

### ✨ Features

- **🎯 Smart Detection**: Automatically detects current search engine and keywords
- **🖱️ Context Menu**: Right-click on search results page to switch
- **🔧 Toolbar Popup**: Click extension icon to view current query and switch options
- **⌨️ Shortcuts**: Customizable keyboard shortcuts (default: Ctrl+Shift+G/B/M)
- **🔍 Built-in Engines**: Google, Baidu, Bing, Yahoo, DuckDuckGo
- **➕ Custom Engines**: Add your own search engines
- **🌍 Bilingual UI**: English and Simplified Chinese support
- **☁️ Sync Settings**: Uses browser sync to save configuration

### 📥 Installation

#### Method 1: Chrome Web Store (Recommended)

> Pending review, coming soon...

#### Method 2: Developer Mode (Use Immediately)

1. Download the latest release: Visit [Releases page](https://github.com/liyifan2004/QuerySwitch/releases) and download `QuerySwitch-v1.0.zip`
2. Extract the downloaded file
3. Open Chrome/Edge browser, go to `chrome://extensions/` or `edge://extensions/`
4. Enable "Developer mode" in the top right
5. Click "Load unpacked"
6. Select the extracted folder
7. Done! The extension icon will appear in the toolbar

### 🚀 Usage Guide

#### Context Menu Switch
1. On any supported search results page (Google, Baidu, etc.)
2. Right-click on the page
3. Select "Switch Search Engine"
4. Click target search engine

#### Toolbar Popup Switch
1. Click the QuerySwitch icon in the toolbar
2. View current search query
3. Click desired search engine

#### Keyboard Shortcuts
- `Ctrl+Shift+G` - Switch to Google
- `Ctrl+Shift+B` - Switch to Baidu
- `Ctrl+Shift+M` - Switch to Bing

> Shortcuts can be customized in browser extension settings

### ⚙️ Options

1. Click toolbar icon → Click "Options"
2. Or go to extension management page → "Details" → "Extension options"

Configurable items:
- **Language**: Switch UI language (English/Chinese)
- **Search Engines**: Enable/disable built-in engines, add custom engines
- **Shortcuts**: Go to browser shortcut settings

### 🛠️ Technical Details

- **Specification**: Manifest V3
- **Permissions**: tabs, contextMenus, commands, storage, notifications
- **Storage**: chrome.storage.sync (cross-device sync)
- **Tech Stack**: Vanilla JavaScript, no external dependencies

---

## 📂 Project Structure

```
query-switch/
├── manifest.json          # Extension manifest
├── background.js          # Service worker
├── content.js             # Content script for page detection
├── shared/
│   ├── constants.js       # Search engine configs
│   └── utils.js           # Utility functions
├── popup/                 # Toolbar popup UI
├── options/               # Options page
├── _locales/              # i18n translations
└── icons/                 # Extension icons
```

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## 📄 License

MIT License

## 👤 Author

- **GitHub**: [@liyifan2004](https://github.com/liyifan2004)
- **Project**: [QuerySwitch](https://github.com/liyifan2004/QuerySwitch)

---

⭐ Star this repository if you find it helpful!
