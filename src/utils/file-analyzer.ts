import * as fs from 'fs';
import * as path from 'path';
import { FileHealth, HealthIssue, RefactoringSuggestion } from '../interfaces/file-health';
import { HealthRule, HealthConfig } from '../interfaces/health-rule';

export class FileAnalyzer {
    
    static async analyzeFile(filePath: string, rules: HealthRule[], config: HealthConfig): Promise<FileHealth> {
        try {
            const content = await fs.promises.readFile(filePath, 'utf-8');
            const stats = await fs.promises.stat(filePath);
            const lineCount = content.split('\n').length;
            
            const issues: HealthIssue[] = [];
            const suggestions: RefactoringSuggestion[] = [];
            
            // Run all health rules
            for (const rule of rules) {
                if (rule.check(content, filePath, lineCount, config)) {
                    issues.push({
                        type: rule.category,
                        severity: rule.severity,
                        description: rule.description,
                        suggestion: rule.suggestion
                    });
                    
                    // Generate refactoring suggestions for critical issues
                    if (rule.severity === 'CRITICAL') {
                        suggestions.push(this.generateRefactoringSuggestion(rule, filePath, lineCount));
                    }
                }
            }
            
            const healthScore = this.calculateHealthScore(lineCount, issues, config);
            const complexity = this.determineComplexity(healthScore);
            
            return {
                filePath,
                fileName: path.basename(filePath),
                lineCount,
                complexity,
                healthScore,
                issues,
                suggestions,
                fileSize: stats.size,
                lastModified: stats.mtime
            };
            
        } catch (error) {
            throw new Error(`Failed to analyze file ${filePath}: ${error}`);
        }
    }
    
    static async scanDirectory(directoryPath: string, rules: HealthRule[], config: HealthConfig): Promise<FileHealth[]> {
        const results: FileHealth[] = [];
        
        try {
            const files = await this.collectFiles(directoryPath, config.excludePatterns);
            
            for (const filePath of files) {
                if (this.isTargetFile(filePath)) {
                    const health = await this.analyzeFile(filePath, rules, config);
                    results.push(health);
                }
            }
            
            return results.sort((a, b) => a.healthScore - b.healthScore); // Worst first
            
        } catch (error) {
            throw new Error(`Failed to scan directory ${directoryPath}: ${error}`);
        }
    }
    
    private static async collectFiles(directoryPath: string, excludePatterns: string[]): Promise<string[]> {
        const files: string[] = [];
        
        const scanDir = async (dir: string): Promise<void> => {
            const entries = await fs.promises.readdir(dir, { withFileTypes: true });
            
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                
                if (entry.isDirectory()) {
                    if (!this.shouldSkipDirectory(entry.name, excludePatterns) && !this.shouldSkipPath(fullPath)) {
                        await scanDir(fullPath);
                    }
                } else {
                    if (!this.shouldSkipFile(fullPath, excludePatterns)) {
                        files.push(fullPath);
                    }
                }
            }
        };
        
        await scanDir(directoryPath);
        return files;
    }
    
    private static isTargetFile(filePath: string): boolean {
        const targetExtensions = ['.js', '.ts', '.jsx', '.tsx', '.vue', '.py', '.java', '.cs', '.php', '.go', '.rb'];
        const ext = path.extname(filePath).toLowerCase();
        return targetExtensions.includes(ext);
    }
    
    private static shouldSkipDirectory(dirName: string, excludePatterns: string[]): boolean {
        // Hard-coded critical directories to always skip
        const skipDirs = ['node_modules', '.git', 'dist', 'build', '.next', 'coverage', 'out', 
                         '.venv', 'venv', '.env', 'env', '__pycache__', 'Scripts', 'bin', 'include', 'Include', 
                         'Lib', 'lib', 'temp', 'tmp', '.tmp', 'target'];
        
        if (skipDirs.includes(dirName)) {
            return true;
        }
        
        // Check against exclude patterns
        return excludePatterns.some(pattern => {
            // Remove /** suffix for directory matching
            const dirPattern = pattern.replace(/\/\*\*$/, '').replace(/\\\*\*$/, '');
            // Simple name match or wildcard match
            return dirName === dirPattern || 
                   dirName.match(dirPattern.replace(/\*/g, '.*')) ||
                   pattern.includes(dirName);
        });
    }
    
    private static shouldSkipFile(filePath: string, excludePatterns: string[]): boolean {
        // Normalize path for consistent matching (convert backslashes to forward slashes)
        const normalizedPath = filePath.replace(/\\/g, '/');
        
        return excludePatterns.some(pattern => {
            try {
                // Normalize pattern as well
                const normalizedPattern = pattern.replace(/\\/g, '/');
                
                // Convert glob pattern to regex
                let regexPattern = normalizedPattern
                    .replace(/\*\*/g, '.*')  // ** matches any path
                    .replace(/\*/g, '[^/]*') // * matches any filename
                    .replace(/\./g, '\\.')   // Escape dots
                    .replace(/\?/g, '.');    // ? matches single char
                
                // Add anchors for exact matching
                regexPattern = '^' + regexPattern + '$';
                
                const regex = new RegExp(regexPattern, 'i'); // Case insensitive for Windows
                return regex.test(normalizedPath);
            } catch (error) {
                // Fallback to simple string matching if regex fails
                return normalizedPath.includes(pattern.replace(/\*+/g, ''));
            }
        });
    }
    
    private static shouldSkipPath(fullPath: string): boolean {
        // Normalize path for consistent checking
        const normalizedPath = fullPath.replace(/\\/g, '/');
        
        // Critical paths to always skip (check if path contains these)
        const skipPaths = [
            '/.venv/', '/venv/', '/.env/', '/env/',
            '/node_modules/', '/.git/', '/dist/', '/build/',
            '/__pycache__/', '/Scripts/', '/Lib/site-packages/',
            '/bin/', '/include/', '/Include/', '/lib/',
            '/.next/', '/coverage/', '/out/', '/target/'
        ];
        
        return skipPaths.some(skipPath => normalizedPath.includes(skipPath));
    }
    
    private static calculateHealthScore(lineCount: number, issues: HealthIssue[], config: HealthConfig): number {
        let score = 100;
        
        // Penalize based on file size
        if (lineCount > config.maxHealthyFileSize) {
            const sizePenalty = Math.min(50, (lineCount - config.maxHealthyFileSize) / 10);
            score -= sizePenalty;
        }
        
        // Penalize based on issues
        for (const issue of issues) {
            switch (issue.severity) {
                case 'CRITICAL':
                    score -= 25;
                    break;
                case 'WARNING':
                    score -= 10;
                    break;
                case 'INFO':
                    score += 5; // Positive feedback for good practices
                    break;
            }
        }
        
        return Math.max(0, Math.min(100, score));
    }
    
    private static determineComplexity(healthScore: number): 'HEALTHY' | 'BLOATED' | 'CRITICAL' {
        if (healthScore >= 70) return 'HEALTHY';
        if (healthScore >= 40) return 'BLOATED';
        return 'CRITICAL';
    }
    
    private static generateRefactoringSuggestion(rule: HealthRule, filePath: string, lineCount: number): RefactoringSuggestion {
        const fileName = path.basename(filePath, path.extname(filePath));
        
        switch (rule.name) {
            case 'massive_file':
            case 'god_file':
                return {
                    type: 'split-file',
                    description: `Split ${fileName} into smaller modules`,
                    targetPath: `src/modules/${fileName}/`,
                    priority: 10,
                    estimatedBenefit: 'Easier maintenance, better testability, improved readability'
                };
            case 'god_function':
                return {
                    type: 'extract-function',
                    description: `Extract large functions from ${fileName}`,
                    targetPath: `src/utils/${fileName}-helpers.ts`,
                    priority: 8,
                    estimatedBenefit: 'Better code organization and reusability'
                };
            case 'utils_in_main_file':
                return {
                    type: 'move-to-utils',
                    description: `Move utility functions to dedicated utils file`,
                    targetPath: `src/utils/${fileName}-utils.ts`,
                    priority: 6,
                    estimatedBenefit: 'Reusable utilities, cleaner main file'
                };
            default:
                return {
                    type: 'split-file',
                    description: rule.suggestion,
                    targetPath: `src/refactored/${fileName}/`,
                    priority: rule.priority,
                    estimatedBenefit: 'Improved code organization'
                };
        }
    }
}
