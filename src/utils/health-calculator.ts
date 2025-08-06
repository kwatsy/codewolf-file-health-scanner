import { FileHealth, ProjectHealth, RefactoringSuggestion } from '../interfaces/file-health';

export class HealthCalculator {
    
    static calculateProjectHealth(fileHealthResults: FileHealth[]): ProjectHealth {
        if (fileHealthResults.length === 0) {
            return {
                totalFiles: 0,
                healthyFiles: 0,
                bloatedFiles: 0,
                criticalFiles: 0,
                overallScore: 100,
                worstOffenders: [],
                suggestions: []
            };
        }
        
        const totalFiles = fileHealthResults.length;
        const healthyFiles = fileHealthResults.filter(f => f.complexity === 'HEALTHY').length;
        const bloatedFiles = fileHealthResults.filter(f => f.complexity === 'BLOATED').length;
        const criticalFiles = fileHealthResults.filter(f => f.complexity === 'CRITICAL').length;
        
        // Calculate overall score
        const averageScore = fileHealthResults.reduce((sum, file) => sum + file.healthScore, 0) / totalFiles;
        const overallScore = Math.round(averageScore);
        
        // Get worst offenders (bottom 20% or at least top 5 worst)
        const sortedByScore = [...fileHealthResults].sort((a, b) => a.healthScore - b.healthScore);
        const worstCount = Math.max(5, Math.floor(totalFiles * 0.2));
        const worstOffenders = sortedByScore.slice(0, worstCount);
        
        // Aggregate suggestions
        const allSuggestions = fileHealthResults.flatMap(f => f.suggestions);
        const prioritizedSuggestions = this.prioritizeSuggestions(allSuggestions);
        
        return {
            totalFiles,
            healthyFiles,
            bloatedFiles,
            criticalFiles,
            overallScore,
            worstOffenders,
            suggestions: prioritizedSuggestions.slice(0, 10) // Top 10 suggestions
        };
    }
    
    static generateProjectSummary(projectHealth: ProjectHealth): string {
        const { totalFiles, healthyFiles, bloatedFiles, criticalFiles, overallScore } = projectHealth;
        
        let summary = `🐺 CodeWolf Project Health Report\n\n`;
        summary += `📊 Overall Score: ${overallScore}/100\n\n`;
        
        // Health breakdown
        summary += `📁 File Breakdown:\n`;
        summary += `  🟢 Healthy: ${healthyFiles} files (${Math.round(healthyFiles/totalFiles*100)}%)\n`;
        summary += `  🟡 Bloated: ${bloatedFiles} files (${Math.round(bloatedFiles/totalFiles*100)}%)\n`;
        summary += `  🔴 Critical: ${criticalFiles} files (${Math.round(criticalFiles/totalFiles*100)}%)\n\n`;
        
        // Health status
        if (overallScore >= 80) {
            summary += `🎉 Excellent! Your project follows good CodeWolf practices!\n`;
        } else if (overallScore >= 60) {
            summary += `👍 Good structure, but room for improvement.\n`;
        } else if (overallScore >= 40) {
            summary += `⚠️ Your project needs some refactoring love.\n`;
        } else {
            summary += `🚨 URGENT: This project needs major restructuring!\n`;
        }
        
        // CodeWolf compliance
        const codeWolfCompliance = this.calculateCodeWolfCompliance(projectHealth);
        summary += `\n🐺 CodeWolf Compliance: ${codeWolfCompliance}%\n`;
        
        if (codeWolfCompliance < 50) {
            summary += `💡 Consider adopting CodeWolf architecture patterns for better organization!\n`;
        }
        
        return summary;
    }
    
    static getHealthEmoji(complexity: 'HEALTHY' | 'BLOATED' | 'CRITICAL'): string {
        switch (complexity) {
            case 'HEALTHY': return '🟢';
            case 'BLOATED': return '🟡';
            case 'CRITICAL': return '🔴';
        }
    }
    
    static getScoreColor(score: number): string {
        if (score >= 80) return '#4CAF50'; // Green
        if (score >= 60) return '#FF9800'; // Orange
        if (score >= 40) return '#F44336'; // Red
        return '#9C27B0'; // Purple for very bad
    }
    
    private static prioritizeSuggestions(suggestions: RefactoringSuggestion[]): RefactoringSuggestion[] {
        // Group by type and priority
        const grouped = suggestions.reduce((acc, suggestion) => {
            const key = `${suggestion.type}-${suggestion.targetPath}`;
            if (!acc[key] || acc[key].priority < suggestion.priority) {
                acc[key] = suggestion;
            }
            return acc;
        }, {} as Record<string, RefactoringSuggestion>);
        
        // Sort by priority (highest first)
        return Object.values(grouped).sort((a, b) => b.priority - a.priority);
    }
    
    private static calculateCodeWolfCompliance(projectHealth: ProjectHealth): number {
        let compliance = 0;
        const { totalFiles, healthyFiles } = projectHealth;
        
        // Base compliance on healthy files ratio
        compliance += (healthyFiles / totalFiles) * 60;
        
        // Check for CodeWolf-style structure in suggestions
        const hasGoodStructure = projectHealth.suggestions.some(s => 
            s.description.includes('CodeWolf') || 
            s.targetPath.includes('/interfaces/') ||
            s.targetPath.includes('/utils/') ||
            s.targetPath.includes('/rules/')
        );
        
        if (hasGoodStructure) {
            compliance += 20;
        }
        
        // Bonus for small files (CodeWolf style)
        const smallFilesRatio = projectHealth.worstOffenders.filter(f => f.lineCount <= 100).length / Math.min(5, totalFiles);
        compliance += smallFilesRatio * 20;
        
        return Math.round(Math.min(100, compliance));
    }
    
    static formatFileSize(bytes: number): string {
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        if (bytes === 0) return '0 Bytes';
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    }
    
    static getRefactoringPriorityText(priority: number): string {
        if (priority >= 8) return 'URGENT';
        if (priority >= 6) return 'HIGH';
        if (priority >= 4) return 'MEDIUM';
        return 'LOW';
    }
}
