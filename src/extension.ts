import * as vscode from 'vscode';
import { HealthScanner } from './health-scanner';
import { HealthCalculator } from './utils/health-calculator';
import { FileHealth, HealthIssue, ProjectHealth } from './interfaces/file-health';

let healthScanner: HealthScanner;
let diagnosticCollection: vscode.DiagnosticCollection;
let outputChannel: vscode.OutputChannel;
let fileDecorationProvider: vscode.FileDecorationProvider;

export function activate(context: vscode.ExtensionContext) {
    console.log('🐺 CodeWolf File Health Scanner is now active!');
    
    healthScanner = new HealthScanner();
    diagnosticCollection = vscode.languages.createDiagnosticCollection('codeWolfHealth');
    outputChannel = vscode.window.createOutputChannel('CodeWolf File Health');
    
    // Create and register file decoration provider
    fileDecorationProvider = new CodeWolfFileDecorationProvider();
    const decorationDisposable = vscode.window.registerFileDecorationProvider(fileDecorationProvider);
    
    // Register commands
    const scanFileCommand = vscode.commands.registerCommand('codewolf.scanFileHealth', async (uri?: vscode.Uri) => {
        await scanFileHealth(uri);
    });
    
    const scanProjectCommand = vscode.commands.registerCommand('codewolf.scanProjectHealth', async (uri?: vscode.Uri) => {
        await scanProjectHealth(uri);
    });
    
    const generateReportCommand = vscode.commands.registerCommand('codewolf.generateHealthReport', async () => {
        await generateHealthReport();
    });
    
    const suggestRefactoringCommand = vscode.commands.registerCommand('codewolf.suggestRefactoring', async () => {
        await suggestRefactoring();
    });
    
    // New CodeWolf commands matching original
    const scanCurrentFileCommand = vscode.commands.registerCommand('codewolf.scanCurrentFile', async () => {
        const activeEditor = vscode.window.activeTextEditor;
        if (!activeEditor) {
            vscode.window.showErrorMessage('🐺 No active file to scan');
            return;
        }
        await scanFileHealth(activeEditor.document.uri);
    });
    
    const scanSelectedFolderCommand = vscode.commands.registerCommand('codewolf.scanSelectedFolder', async (uri?: vscode.Uri) => {
        if (!uri) {
            vscode.window.showErrorMessage('🐺 No folder selected');
            return;
        }
        await scanProjectHealth(uri);
    });
    
    const scanEntireWorkspaceCommand = vscode.commands.registerCommand('codewolf.scanEntireWorkspace', async () => {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            vscode.window.showErrorMessage('🐺 No workspace folder open');
            return;
        }
        await scanProjectHealth(workspaceFolder.uri);
    });
    
    const clearDiagnosticsCommand = vscode.commands.registerCommand('codewolf.clearDiagnostics', async () => {
        diagnosticCollection.clear();
        vscode.window.showInformationMessage('🧹 CodeWolf Files: All problems cleared!');
    });
    
    const refreshDiagnosticsCommand = vscode.commands.registerCommand('codewolf.refreshDiagnostics', async () => {
        // Clear first
        diagnosticCollection.clear();
        
        // Re-scan all open files
        const openFiles = vscode.workspace.textDocuments
            .filter(doc => !doc.isUntitled && doc.uri.scheme === 'file')
            .filter(doc => /\.(js|ts|jsx|tsx|vue|py|java|cs|php)$/.test(doc.fileName));
        
        if (openFiles.length === 0) {
            vscode.window.showInformationMessage('🔄 No files to refresh');
            return;
        }
        
        vscode.window.showInformationMessage(`🔄 Refreshing ${openFiles.length} files...`);
        
        for (const doc of openFiles) {
            try {
                const fileHealth = await healthScanner.scanFile(doc.fileName);
                const diagnostics = createHealthDiagnostics(fileHealth);
                diagnosticCollection.set(doc.uri, diagnostics);
            } catch (error) {
                console.error(`Failed to refresh ${doc.fileName}:`, error);
            }
        }
        
        vscode.window.showInformationMessage('🐺 CodeWolf Files: Problems refreshed!');
    });
    
    const configureThresholdsCommand = vscode.commands.registerCommand('codewolf.configureThresholds', async () => {
        await configureThresholds();
    });
    
    context.subscriptions.push(
        scanFileCommand,
        scanProjectCommand, 
        generateReportCommand,
        suggestRefactoringCommand,
        scanCurrentFileCommand,
        scanSelectedFolderCommand,
        scanEntireWorkspaceCommand,
        clearDiagnosticsCommand,
        refreshDiagnosticsCommand,
        configureThresholdsCommand,
        decorationDisposable,
        diagnosticCollection,
        outputChannel
    );
    
    // Show welcome message
    vscode.window.showInformationMessage(
        '🐺 CodeWolf File Health Scanner is ready to help you organize your code!',
        'Scan Current File',
        'Scan Project'
    ).then(selection => {
        if (selection === 'Scan Current File') {
            vscode.commands.executeCommand('codewolf.scanFileHealth');
        } else if (selection === 'Scan Project') {
            vscode.commands.executeCommand('codewolf.scanProjectHealth');
        }
    });
}

// Deactivate function moved to end of file

async function scanFileHealth(uri?: vscode.Uri) {
    try {
        const filePath = uri?.fsPath || vscode.window.activeTextEditor?.document.fileName;
        
        if (!filePath) {
            vscode.window.showErrorMessage('No file selected or open');
            return;
        }
        
        vscode.window.showInformationMessage('🐺 Analyzing file health...');
        
        const fileHealth = await healthScanner.scanFile(filePath);
        
        // Create diagnostics for Problems panel
        const diagnostics = createHealthDiagnostics(fileHealth);
        diagnosticCollection.set(vscode.Uri.file(filePath), diagnostics);
        
        // Output to Output panel
        outputFileHealthResults(fileHealth);
        
        // Show results in a new document
        const resultDoc = await vscode.workspace.openTextDocument({
            content: formatFileHealthResult(fileHealth),
            language: 'markdown'
        });
        
        await vscode.window.showTextDocument(resultDoc);
        
        // Show summary in status bar
        const emoji = HealthCalculator.getHealthEmoji(fileHealth.complexity);
        vscode.window.showInformationMessage(
            `${emoji} File Health: ${fileHealth.healthScore}/100 (${fileHealth.complexity})`
        );
        
    } catch (error) {
        vscode.window.showErrorMessage(`Failed to scan file: ${error}`);
    }
}

async function scanProjectHealth(uri?: vscode.Uri) {
    try {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            vscode.window.showErrorMessage('No workspace folder open');
            return;
        }
        
        const projectPath = uri?.fsPath || workspaceFolders[0].uri.fsPath;
        
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: '🐺 CodeWolf scanning project health...',
            cancellable: false
        }, async (progress) => {
            
            const projectHealth = await healthScanner.scanWorkspace(projectPath, (percent, currentFile) => {
                progress.report({ 
                    increment: percent,
                    message: `Analyzing: ${currentFile.split(/[/\\]/).pop()}`
                });
            });
            
            // Clear previous diagnostics
            diagnosticCollection.clear();
            
            // Update Problems panel with all file issues
            for (const fileHealth of projectHealth.worstOffenders) {
                const diagnostics = createHealthDiagnostics(fileHealth);
                if (diagnostics.length > 0) {
                    const fileUri = vscode.Uri.file(fileHealth.filePath);
                    diagnosticCollection.set(fileUri, diagnostics);
                }
                
                // Update file decorations
                if (fileDecorationProvider instanceof CodeWolfFileDecorationProvider) {
                    fileDecorationProvider.updateFileHealth(fileHealth.filePath, fileHealth);
                }
            }
            
            // Update Output channel
            outputChannel.clear();
            outputChannel.appendLine('🐺 CodeWolf File Health Scanner - Workspace Scan Results');
            outputChannel.appendLine('='.repeat(60));
            outputChannel.appendLine('');
            outputChannel.appendLine(`📊 Overall Score: ${projectHealth.overallScore}/100`);
            outputChannel.appendLine(`🟢 Healthy: ${projectHealth.healthyFiles} files`);
            outputChannel.appendLine(`🟡 Bloated: ${projectHealth.bloatedFiles} files`);
            outputChannel.appendLine(`🔴 Critical: ${projectHealth.criticalFiles} files`);
            outputChannel.appendLine('');
            
            if (projectHealth.criticalFiles > 0) {
                outputChannel.appendLine('🚨 Critical Files Needing Attention:');
                projectHealth.worstOffenders
                    .filter((f: FileHealth) => f.healthScore < 40)
                    .forEach((file: FileHealth) => {
                        outputChannel.appendLine(`  🔴 ${file.filePath.split(/[/\\]/).pop()} (${file.healthScore}/100)`);
                        file.issues.forEach((issue: HealthIssue) => {
                            if (issue.severity === 'CRITICAL') {
                                outputChannel.appendLine(`     ⚠️  ${issue.description}`);
                            }
                        });
                    });
                outputChannel.appendLine('');
            }
            
            outputChannel.appendLine('💡 Top Refactoring Suggestions:');
            projectHealth.suggestions.slice(0, 5).forEach((suggestion, index) => {
                outputChannel.appendLine(`  ${index + 1}. ${suggestion.description}`);
                outputChannel.appendLine(`     💡 ${suggestion.estimatedBenefit}`);
            });
            
            outputChannel.show();
            
            // Show results
            const resultDoc = await vscode.workspace.openTextDocument({
                content: formatProjectHealthResult(projectHealth),
                language: 'markdown'
            });
            
            await vscode.window.showTextDocument(resultDoc);
            
            // Show summary
            const emoji = projectHealth.overallScore >= 70 ? '🟢' : projectHealth.overallScore >= 40 ? '🟡' : '🔴';
            vscode.window.showInformationMessage(
                `${emoji} Project Health: ${projectHealth.overallScore}/100 - ${projectHealth.criticalFiles} critical files need attention`
            );
        });
        
    } catch (error) {
        vscode.window.showErrorMessage(`Failed to scan project: ${error}`);
    }
}

async function generateHealthReport() {
    try {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            vscode.window.showErrorMessage('No workspace folder open');
            return;
        }
        
        const projectPath = workspaceFolders[0].uri.fsPath;
        const projectHealth = await healthScanner.scanProject(projectPath);
        
        // Generate HTML report (we'll create this template next)
        const htmlReport = generateHTMLReport(projectHealth);
        
        // Save report to workspace
        const reportPath = vscode.Uri.file(`${projectPath}/codewolf-health-report.html`);
        await vscode.workspace.fs.writeFile(reportPath, Buffer.from(htmlReport));
        
        vscode.window.showInformationMessage(
            '📊 Health report generated!',
            'Open Report'
        ).then(selection => {
            if (selection === 'Open Report') {
                vscode.env.openExternal(reportPath);
            }
        });
        
    } catch (error) {
        vscode.window.showErrorMessage(`Failed to generate report: ${error}`);
    }
}

async function suggestRefactoring() {
    try {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            vscode.window.showErrorMessage('No workspace folder open');
            return;
        }
        
        const projectPath = workspaceFolders[0].uri.fsPath;
        const projectHealth = await healthScanner.scanProject(projectPath);
        const suggestions = healthScanner.getRefactoringSuggestions(projectHealth, 'HIGH');
        
        if (suggestions.length === 0) {
            vscode.window.showInformationMessage('🎉 No urgent refactoring needed! Your code looks healthy 🐺');
            return;
        }
        
        // Show top suggestion
        const topSuggestion = suggestions[0];
        const priority = HealthCalculator.getRefactoringPriorityText(topSuggestion.priority);
        
        vscode.window.showWarningMessage(
            `${priority}: ${topSuggestion.description}`,
            'Show All Suggestions',
            'Dismiss'
        ).then(selection => {
            if (selection === 'Show All Suggestions') {
                // Show all suggestions in a document
                const content = formatRefactoringSuggestions(suggestions);
                vscode.workspace.openTextDocument({
                    content,
                    language: 'markdown'
                }).then(doc => vscode.window.showTextDocument(doc));
            }
        });
        
    } catch (error) {
        vscode.window.showErrorMessage(`Failed to get suggestions: ${error}`);
    }
}

function formatFileHealthResult(fileHealth: any): string {
    const emoji = HealthCalculator.getHealthEmoji(fileHealth.complexity);
    
    let result = `# 🐺 CodeWolf File Health Report\n\n`;
    result += `## ${emoji} ${fileHealth.fileName}\n\n`;
    result += `**Health Score:** ${fileHealth.healthScore}/100\n`;
    result += `**Complexity:** ${fileHealth.complexity}\n`;
    result += `**Lines:** ${fileHealth.lineCount}\n`;
    result += `**Size:** ${HealthCalculator.formatFileSize(fileHealth.fileSize)}\n\n`;
    
    if (fileHealth.issues.length > 0) {
        result += `## Issues Found\n\n`;
        fileHealth.issues.forEach((issue: any) => {
            const issueEmoji = issue.severity === 'CRITICAL' ? '🔴' : issue.severity === 'WARNING' ? '🟡' : '🟢';
            result += `${issueEmoji} **${issue.severity}**: ${issue.description}\n`;
            result += `   💡 ${issue.suggestion}\n\n`;
        });
    }
    
    if (fileHealth.suggestions.length > 0) {
        result += `## Refactoring Suggestions\n\n`;
        fileHealth.suggestions.forEach((suggestion: any) => {
            result += `### ${suggestion.type}\n`;
            result += `**Description:** ${suggestion.description}\n`;
            result += `**Target:** \`${suggestion.targetPath}\`\n`;
            result += `**Benefit:** ${suggestion.estimatedBenefit}\n\n`;
        });
    }
    
    return result;
}

function formatProjectHealthResult(projectHealth: any): string {
    const summary = healthScanner.generateHealthReport(projectHealth);
    
    let result = summary + '\n\n';
    
    if (projectHealth.worstOffenders.length > 0) {
        result += `## 🔴 Files Needing Attention\n\n`;
        projectHealth.worstOffenders.forEach((file: any) => {
            const emoji = HealthCalculator.getHealthEmoji(file.complexity);
            result += `${emoji} **${file.fileName}** (${file.healthScore}/100)\n`;
            result += `   📏 ${file.lineCount} lines\n`;
            result += `   📁 \`${file.filePath}\`\n\n`;
        });
    }
    
    return result;
}

function formatRefactoringSuggestions(suggestions: any[]): string {
    let result = `# 🐺 CodeWolf Refactoring Suggestions\n\n`;
    
    suggestions.forEach((suggestion, index) => {
        const priority = HealthCalculator.getRefactoringPriorityText(suggestion.priority);
        result += `## ${index + 1}. ${suggestion.type} (${priority})\n\n`;
        result += `**Description:** ${suggestion.description}\n`;
        result += `**Target Path:** \`${suggestion.targetPath}\`\n`;
        result += `**Estimated Benefit:** ${suggestion.estimatedBenefit}\n\n`;
    });
    
    return result;
}

function generateHTMLReport(projectHealth: any): string {
    // Simplified HTML report - we'll create a proper template later
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <title>🐺 CodeWolf Health Report</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .score { font-size: 2em; font-weight: bold; }
            .healthy { color: #4CAF50; }
            .bloated { color: #FF9800; }
            .critical { color: #F44336; }
        </style>
    </head>
    <body>
        <h1>🐺 CodeWolf Project Health Report</h1>
        <div class="score">Overall Score: ${projectHealth.overallScore}/100</div>
        <p>Total Files: ${projectHealth.totalFiles}</p>
        <p>Healthy: ${projectHealth.healthyFiles} | Bloated: ${projectHealth.bloatedFiles} | Critical: ${projectHealth.criticalFiles}</p>
    </body>
    </html>`;
}

function createHealthDiagnostics(fileHealth: FileHealth): vscode.Diagnostic[] {
    const diagnostics: vscode.Diagnostic[] = [];
    
    // Only create diagnostics for actual problems (not healthy file messages)
    const problemIssues = fileHealth.issues.filter(issue => 
        issue.severity !== 'INFO' || !issue.description.includes('Perfect file size')
    );
    
    problemIssues.forEach(issue => {
        const line = 0; // For now, put all issues on line 1
        const range = new vscode.Range(line, 0, line, 1000);
        
        let severity: vscode.DiagnosticSeverity;
        switch (issue.severity) {
            case 'CRITICAL':
                severity = vscode.DiagnosticSeverity.Error;
                break;
            case 'WARNING':
                severity = vscode.DiagnosticSeverity.Warning;
                break;
            case 'INFO':
                severity = vscode.DiagnosticSeverity.Information;
                break;
            default:
                severity = vscode.DiagnosticSeverity.Hint;
        }
        
        const diagnostic = new vscode.Diagnostic(
            range,
            `🐺 ${issue.description}\n\n💡 ${issue.suggestion}`,
            severity
        );
        
        diagnostic.source = 'CodeWolf File Health';
        diagnostic.code = {
            value: issue.type,
            target: vscode.Uri.parse(`codewolf://health/${issue.type}/${fileHealth.filePath}`)
        };
        
        diagnostics.push(diagnostic);
    });
    
    return diagnostics;
}

function outputFileHealthResults(fileHealth: FileHealth): void {
    outputChannel.clear();
    outputChannel.show(true);
    
    outputChannel.appendLine('🐺 ==========================================');
    outputChannel.appendLine('🐺 CODEWOLF FILE HEALTH SCANNER RESULTS');
    outputChannel.appendLine('🐺 ==========================================');
    outputChannel.appendLine(`📅 Scan Date: ${new Date().toLocaleString()}`);
    outputChannel.appendLine(`📁 File: ${fileHealth.fileName}`);
    outputChannel.appendLine(`📏 Lines: ${fileHealth.lineCount}`);
    outputChannel.appendLine(`📊 Health Score: ${fileHealth.healthScore}/100`);
    outputChannel.appendLine(`🎯 Complexity: ${fileHealth.complexity}`);
    outputChannel.appendLine('');
    
    if (fileHealth.issues.length === 0) {
        outputChannel.appendLine('🎉 EXCELLENT! No health issues found!');
        outputChannel.appendLine('✅ This file follows CodeWolf best practices');
        outputChannel.appendLine('✅ Perfect size and structure');
        outputChannel.appendLine('✅ Ready for production!');
    } else {
        outputChannel.appendLine(`🔍 Issues Found: ${fileHealth.issues.length}`);
        outputChannel.appendLine('');
        
        // Group by severity
        const critical = fileHealth.issues.filter(i => i.severity === 'CRITICAL');
        const warnings = fileHealth.issues.filter(i => i.severity === 'WARNING');
        const info = fileHealth.issues.filter(i => i.severity === 'INFO');
        
        outputChannel.appendLine('📊 SEVERITY BREAKDOWN:');
        outputChannel.appendLine(`🔴 CRITICAL: ${critical.length}`);
        outputChannel.appendLine(`🟡 WARNING: ${warnings.length}`);
        outputChannel.appendLine(`🔵 INFO: ${info.length}`);
        outputChannel.appendLine('');
        
        // Show issues
        if (critical.length > 0) {
            outputChannel.appendLine('🔴 CRITICAL ISSUES:');
            outputChannel.appendLine(''.padEnd(50, '-'));
            critical.forEach((issue, index) => {
                outputChannel.appendLine(`${index + 1}. ${issue.description}`);
                outputChannel.appendLine(`   💡 ${issue.suggestion}`);
                outputChannel.appendLine('');
            });
        }
        
        if (warnings.length > 0) {
            outputChannel.appendLine('🟡 WARNING ISSUES:');
            outputChannel.appendLine(''.padEnd(50, '-'));
            warnings.forEach((issue, index) => {
                outputChannel.appendLine(`${index + 1}. ${issue.description}`);
                outputChannel.appendLine(`   💡 ${issue.suggestion}`);
                outputChannel.appendLine('');
            });
        }
        
        if (info.length > 0) {
            outputChannel.appendLine('🔵 INFO:');
            outputChannel.appendLine(''.padEnd(50, '-'));
            info.forEach((issue, index) => {
                outputChannel.appendLine(`${index + 1}. ${issue.description}`);
                outputChannel.appendLine(`   💡 ${issue.suggestion}`);
                outputChannel.appendLine('');
            });
        }
    }
    
    // Refactoring suggestions
    if (fileHealth.suggestions.length > 0) {
        outputChannel.appendLine('💡 REFACTORING SUGGESTIONS:');
        outputChannel.appendLine(''.padEnd(50, '='));
        fileHealth.suggestions.forEach((suggestion, index) => {
            const priority = HealthCalculator.getRefactoringPriorityText(suggestion.priority);
            outputChannel.appendLine(`${index + 1}. [${priority}] ${suggestion.description}`);
            outputChannel.appendLine(`   📁 Target: ${suggestion.targetPath}`);
            outputChannel.appendLine(`   ✨ Benefit: ${suggestion.estimatedBenefit}`);
            outputChannel.appendLine('');
        });
    }
    
    outputChannel.appendLine('🐺 CodeWolf File Health Scanner - Keeping your code organized! 🐺');
}

// File decoration provider for showing health scores in Explorer
class CodeWolfFileDecorationProvider implements vscode.FileDecorationProvider {
    private _onDidChangeFileDecorations = new vscode.EventEmitter<vscode.Uri | vscode.Uri[] | undefined>();
    readonly onDidChangeFileDecorations = this._onDidChangeFileDecorations.event;
    
    private fileHealthCache = new Map<string, FileHealth>();
    
    async provideFileDecoration(uri: vscode.Uri): Promise<vscode.FileDecoration | undefined> {
        // Only decorate supported file types
        if (!/\.(js|ts|jsx|tsx|vue|py|java|cs|php)$/.test(uri.fsPath)) {
            return undefined;
        }
        
        try {
            // Check cache first
            let fileHealth = this.fileHealthCache.get(uri.fsPath);
            
            if (!fileHealth) {
                // Scan the file
                fileHealth = await healthScanner.scanFile(uri.fsPath);
                this.fileHealthCache.set(uri.fsPath, fileHealth);
            }
            
            const score = fileHealth.healthScore;
            let badge: string;
            let color: vscode.ThemeColor;
            let tooltip: string;
            
            if (score >= 80) {
                badge = score.toString();
                color = new vscode.ThemeColor('charts.green');
                tooltip = `🟢 Healthy file (${score}/100)`;
            } else if (score >= 60) {
                badge = score.toString();
                color = new vscode.ThemeColor('charts.yellow');
                tooltip = `🟡 Needs attention (${score}/100)`;
            } else {
                badge = score.toString();
                color = new vscode.ThemeColor('charts.red');
                tooltip = `🔴 Critical issues (${score}/100)`;
            }
            
            return {
                badge,
                color,
                tooltip
            };
            
        } catch (error) {
            // Silently fail for files that can't be analyzed
            return undefined;
        }
    }
    
    // Method to refresh decorations
    refresh(uri?: vscode.Uri): void {
        if (uri) {
            this.fileHealthCache.delete(uri.fsPath);
        } else {
            this.fileHealthCache.clear();
        }
        this._onDidChangeFileDecorations.fire(uri);
    }
    
    // Method to update cache
    updateFileHealth(filePath: string, fileHealth: FileHealth): void {
        this.fileHealthCache.set(filePath, fileHealth);
        this._onDidChangeFileDecorations.fire(vscode.Uri.file(filePath));
    }
}

async function configureThresholds() {
    const config = vscode.workspace.getConfiguration('codewolfHealth');
    const currentHealthy = config.get<number>('maxHealthyFileSize', 300);
    const currentCritical = config.get<number>('criticalFileSize', 500);
    
    // Show input box for healthy threshold
    const healthyInput = await vscode.window.showInputBox({
        prompt: '🟢 Healthy File Threshold (lines)',
        placeHolder: `Current: ${currentHealthy} lines`,
        value: currentHealthy.toString(),
        validateInput: (value) => {
            const num = parseInt(value);
            if (isNaN(num) || num < 50 || num > 1000) {
                return 'Please enter a number between 50 and 1000';
            }
            return null;
        }
    });
    
    if (!healthyInput) {
        return; // User cancelled
    }
    
    const healthyThreshold = parseInt(healthyInput);
    
    // Show input box for critical threshold
    const criticalInput = await vscode.window.showInputBox({
        prompt: '🔴 Critical File Threshold (lines)',
        placeHolder: `Current: ${currentCritical} lines`,
        value: currentCritical.toString(),
        validateInput: (value) => {
            const num = parseInt(value);
            if (isNaN(num) || num < healthyThreshold || num > 2000) {
                return `Please enter a number between ${healthyThreshold} and 2000`;
            }
            return null;
        }
    });
    
    if (!criticalInput) {
        return; // User cancelled
    }
    
    const criticalThreshold = parseInt(criticalInput);
    
    // Update configuration
    try {
        await config.update('maxHealthyFileSize', healthyThreshold, vscode.ConfigurationTarget.Global);
        await config.update('criticalFileSize', criticalThreshold, vscode.ConfigurationTarget.Global);
        
        vscode.window.showInformationMessage(
            `🐺 CodeWolf thresholds updated! Healthy: ${healthyThreshold} lines, Critical: ${criticalThreshold} lines`,
            'Rescan Project'
        ).then(selection => {
            if (selection === 'Rescan Project') {
                vscode.commands.executeCommand('codewolf.scanEntireWorkspace');
            }
        });
    } catch (error) {
        vscode.window.showErrorMessage(`Failed to update thresholds: ${error}`);
    }
}

export function deactivate() {
    if (healthScanner) {
        healthScanner.dispose();
    }
    if (diagnosticCollection) {
        diagnosticCollection.clear();
        diagnosticCollection.dispose();
    }
    if (outputChannel) {
        outputChannel.dispose();
    }
}
