import * as vscode from 'vscode';
import { FileHealth, ProjectHealth } from './interfaces/file-health';
import { HealthConfig, HealthRule } from './interfaces/health-rule';
import { loadAllHealthRules } from './rules';
import { FileAnalyzer } from './utils/file-analyzer';
import { HealthCalculator } from './utils/health-calculator';

export class HealthScanner {
    private rules: HealthRule[];
    private isDisposed: boolean = false;
    
    constructor() {
        this.rules = loadAllHealthRules();
    }
    
    dispose(): void {
        this.isDisposed = true;
    }
    
    async scanFile(filePath: string, config?: HealthConfig): Promise<FileHealth> {
        this.checkDisposed();
        
        const healthConfig = config || this.getDefaultConfig();
        
        try {
            return await FileAnalyzer.analyzeFile(filePath, this.rules, healthConfig);
        } catch (error) {
            throw new Error(`Failed to scan file: ${error}`);
        }
    }
    
    async scanProject(projectPath: string, config?: HealthConfig): Promise<ProjectHealth> {
        this.checkDisposed();
        
        const healthConfig = config || this.getDefaultConfig();
        
        try {
            const fileHealthResults = await FileAnalyzer.scanDirectory(projectPath, this.rules, healthConfig);
            return HealthCalculator.calculateProjectHealth(fileHealthResults);
        } catch (error) {
            throw new Error(`Failed to scan project: ${error}`);
        }
    }
    
    async scanWorkspace(
        workspacePath: string, 
        progressCallback?: (progress: number, currentFile: string) => void,
        config?: HealthConfig
    ): Promise<ProjectHealth> {
        this.checkDisposed();
        
        const healthConfig = config || this.getDefaultConfig();
        
        try {
            // Get all files first for progress tracking
            const allFiles = await this.getAllTargetFiles(workspacePath, healthConfig.excludePatterns);
            const fileHealthResults: FileHealth[] = [];
            
            for (let i = 0; i < allFiles.length; i++) {
                const filePath = allFiles[i];
                
                if (progressCallback) {
                    const progress = Math.round((i / allFiles.length) * 100);
                    progressCallback(progress, filePath);
                }
                
                try {
                    const health = await FileAnalyzer.analyzeFile(filePath, this.rules, healthConfig);
                    fileHealthResults.push(health);
                } catch (error) {
                    // Log error but continue with other files
                    console.warn(`Failed to analyze ${filePath}: ${error}`);
                }
            }
            
            if (progressCallback) {
                progressCallback(100, 'Calculating project health...');
            }
            
            return HealthCalculator.calculateProjectHealth(fileHealthResults);
            
        } catch (error) {
            throw new Error(`Failed to scan workspace: ${error}`);
        }
    }
    
    generateHealthReport(projectHealth: ProjectHealth): string {
        this.checkDisposed();
        return HealthCalculator.generateProjectSummary(projectHealth);
    }
    
    getWorstOffenders(projectHealth: ProjectHealth, limit: number = 5): FileHealth[] {
        this.checkDisposed();
        return projectHealth.worstOffenders.slice(0, limit);
    }
    
    getRefactoringSuggestions(projectHealth: ProjectHealth, priority: 'ALL' | 'HIGH' | 'CRITICAL' = 'ALL') {
        this.checkDisposed();
        
        let suggestions = projectHealth.suggestions;
        
        if (priority === 'HIGH') {
            suggestions = suggestions.filter(s => s.priority >= 6);
        } else if (priority === 'CRITICAL') {
            suggestions = suggestions.filter(s => s.priority >= 8);
        }
        
        return suggestions;
    }
    
    private async getAllTargetFiles(directoryPath: string, excludePatterns: string[]): Promise<string[]> {
        // Use FileAnalyzer.scanDirectory to get files
        try {
            const fileHealthResults = await FileAnalyzer.scanDirectory(directoryPath, this.rules, {
                maxHealthyFileSize: 200,
                criticalFileSize: 500,
                enableRealTimeScanning: true,
                excludePatterns
            });
            return fileHealthResults.map(result => result.filePath);
        } catch (error) {
            console.warn(`Failed to get target files: ${error}`);
            return [];
        }
    }
    
    private getDefaultConfig(): HealthConfig {
        const config = vscode.workspace.getConfiguration('codewolfHealth');
        
        return {
            maxHealthyFileSize: config.get('maxHealthyFileSize', 300),
            criticalFileSize: config.get('criticalFileSize', 500),
            enableRealTimeScanning: config.get('enableRealTimeScanning', true),
            excludePatterns: config.get('excludePatterns', [
                // JavaScript/Node.js exclusions
                'node_modules/**',
                'dist/**',
                'build/**',
                '.next/**',
                'coverage/**',
                '*.min.js',
                '*.bundle.js',
                
                // Python virtual environment exclusions (multiple formats for Windows compatibility)
                '.venv/**',
                'venv/**',
                '.env/**',
                'env/**',
                '**/.venv/**',
                '**/venv/**',
                '**\\.venv\\**',
                '**\\venv\\**',
                '**/Lib/site-packages/**',
                '**\\Lib\\site-packages\\**',
                '**/lib/python*/site-packages/**',
                '**\\lib\\python*\\site-packages\\**',
                
                // Python cache and compiled files
                '__pycache__/**',
                '**/__pycache__/**',
                '**\\__pycache__\\**',
                '*.pyc',
                '*.pyo',
                '*.pyd',
                'pyvenv.cfg',
                '**/pyvenv.cfg',
                
                // Virtual environment directories
                'Scripts/**',
                'bin/**',
                'include/**',
                'Include/**',
                '**\\Scripts\\**',
                '**\\bin\\**',
                '**\\include\\**',
                '**\\Include\\**',
                
                // Version control
                '.git/**',
                '.svn/**',
                '.hg/**',
                '**/.git/**',
                '**/.svn/**',
                '**/.hg/**',
                
                // Common build/temp directories
                'temp/**',
                'tmp/**',
                '.tmp/**',
                'out/**',
                'target/**'
            ])
        };
    }
    
    private checkDisposed(): void {
        if (this.isDisposed) {
            throw new Error('HealthScanner has been disposed');
        }
    }
}
