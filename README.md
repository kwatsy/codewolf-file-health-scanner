# 🐺 CodeWolf File Health Scanner

> **The architect wolf for Code-Coders who care about clean structure**

[![VS Code Extension](https://img.shields.io/badge/VS%20Code-Extension-blue?style=for-the-badge&logo=visual-studio-code)](https://open-vsx.org)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE.txt)
[![CodeWolf](https://img.shields.io/badge/CodeWolf-Ecosystem-red?style=for-the-badge&logo=wolf)](https://4wavelabs.com)

## 🎯 **Mission**

CodeWolf File Health Scanner helps **Code-Coders** (newbie AI coders) organize their projects and improve code structure. No more massive files, complex spaghetti code, or poorly structured projects - the wolf pack has your back!

## ✨ **Features**

### 📊 **Comprehensive Health Analysis**
- **File Size Analysis** - Detect bloated, massive, and god files
- **Complexity Detection** - Find god functions, nested hell, and import chaos  
- **Structure Validation** - Check folder organization and interface placement
- **Health Scoring** - Get a clear 0-100 health score for every file

### 🔍 **Real-Time Diagnostics**
- **Problems Panel Integration** - Health issues appear as VS Code diagnostics
- **Smart Filtering** - Only shows actual problems (healthy files stay clean)
- **Severity Levels** - Critical, Warning, Info classifications
- **Actionable Suggestions** - Get specific refactoring recommendations

### 📈 **Professional Reporting**
- **Output Channel** - Detailed health analysis with CodeWolf branding
- **HTML Reports** - Generate beautiful project health reports
- **Markdown Summaries** - Export results for documentation
- **Progress Tracking** - Monitor improvements over time

## 🚀 **Quick Start**

### Installation
1. Open VS Code
2. Go to Extensions (`Ctrl+Shift+X`)
3. Search for **"CodeWolf"** to find all CodeWolf extensions
4. Install **"CodeWolf File Health Scanner"**

*Also available on [Open VSX Registry](https://open-vsx.org) - search for "CodeWolf"*

### Usage
Open the **Command Palette** (`Ctrl+Shift+P`) and choose:

- `🐺 CodeWolf Files: Scan Current File` - Analyze the active file
- `🐺 CodeWolf Files: Scan Selected Folder` - Check a specific directory
- `🐺 CodeWolf Files: Scan Entire Workspace` - Full project analysis
- `🐺 CodeWolf Files: Generate Health Report` - Create detailed HTML report

## 📋 **Health Rules**

### 📏 **Size Rules**
- **Healthy File**: < 200 lines ✅
- **Bloated File**: 200-500 lines ⚠️
- **Massive File**: 500-1000 lines 🔴
- **God File**: > 1000 lines 💀

### 🧩 **Complexity Rules**
- **God Functions**: Functions > 50 lines
- **Nested Hell**: Indentation > 4 levels
- **Import Chaos**: > 20 imports in one file
- **Mixed Concerns**: Multiple responsibilities in one file

### 🏗️ **Structure Rules**
- **Folder Organization**: Proper separation of concerns
- **Interface Placement**: Types in dedicated files
- **Utility Extraction**: Reusable code in utils
- **CodeWolf Compliance**: Following best practices

## 🎨 **User Experience**

### Problems Panel
```
🐺 File too large! Consider breaking into smaller modules
💡 Split this file into separate components for better maintainability
```

### Output Channel
```
🐺 ==========================================
🐺 CODEWOLF FILE HEALTH SCANNER RESULTS
🐺 ==========================================
📅 Scan Date: 8/4/2025, 9:24:05 PM
📁 File: example.ts
📏 Lines: 42
📊 Health Score: 100/100
🔥 Complexity: HEALTHY

🎉 Excellent! Your project follows good CodeWolf practices!
🐺 CodeWolf File Health Scanner - Keeping your code organized! 🐺
```

## 🔧 **Configuration**

Add these settings to your VS Code `settings.json`:

```json
{
  "codeWolfFileHealth.maxHealthyFileSize": 200,
  "codeWolfFileHealth.criticalFileSize": 1000,
  "codeWolfFileHealth.enableRealTimeScanning": true,
  "codeWolfFileHealth.excludePatterns": [
    "**/node_modules/**",
    "**/dist/**",
    "**/*.min.js"
  ]
}
```

## 🐺 **CodeWolf Ecosystem**

CodeWolf File Health Scanner is part of the complete CodeWolf developer toolkit:

- **🛡️ CodeWolf Security Scanner** - Find vulnerabilities and security issues
- **📁 CodeWolf File Health Scanner** - Organize code structure and maintainability
- **🔮 CodeWolf AI Assistant** *(Coming Soon)* - AI-powered code suggestions

## 🎓 **For Vibe-Coders**

### What are Vibe-Coders?
Vibe-Coders are developers who embrace AI-assisted coding while maintaining high standards for code quality, structure, and maintainability. They understand that good vibes come from good code!

### Learning Path
1. **Start Small** - Use the scanner on individual files
2. **Understand Patterns** - Learn what makes code healthy
3. **Refactor Gradually** - Improve one file at a time
4. **Build Habits** - Make health scanning part of your workflow
5. **Share Knowledge** - Help other Vibe-Coders learn

## 📊 **Health Score Breakdown**

| Score | Status | Description |
|-------|--------|-------------|
| 90-100 | 🟢 **HEALTHY** | Excellent structure, ready for production |
| 70-89 | 🟡 **BLOATED** | Some issues, consider refactoring |
| 40-69 | 🟠 **COMPLEX** | Multiple problems, needs attention |
| 0-39 | 🔴 **CRITICAL** | Serious issues, immediate refactoring needed |

## 🤝 **Contributing**

We welcome contributions from the CodeWolf pack! 

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 **License**

This project is licensed under the MIT License - see the [LICENSE.txt](LICENSE.txt) file for details.

## 🙏 **Acknowledgments**

- **VS Code Team** - For the amazing extension API
- **TypeScript Community** - For excellent tooling
- **Vibe-Coders Everywhere** - For inspiring better code practices

## ☕ **Support CodeWolf File Health Scanner**

**CodeWolf File Health Scanner is completely FREE** and always will be! 🎉

If CodeWolf has helped you organize your code and improve your architecture, consider supporting the project by buying me a coffee!

[![Ko-fi](https://img.shields.io/badge/Ko--fi-☕-orange.svg)](https://ko-fi.com/watsy)

**Every coffee helps:**
- 🐺 Keep CodeWolf updated with new architectural patterns
- 🛡️ Add support for more frameworks and languages  
- ⚡ Improve scanning performance and accuracy
- 📚 Create more code organization education content

**Your support keeps the guardian wolf strong!** 🐺💪

---

## 🌊 **Created by 4WaveLabs**

**CodeWolf File Health Scanner** is proudly brought to you by **[4WaveLabs](https://4wavelabs.com)** 🌊

**4WaveLabs** - *Innovative development solutions and security tools for the modern developer ecosystem.*

---

<div align="center">

**🐺 Made with ❤️ for new and experienced developers**

*Keep your code organized and healthy - This is the CodeWolf way!* 🐺

[![Follow on GitHub](https://img.shields.io/github/followers/4wavelabs?style=social)](https://github.com/4wavelabs)

</div>
