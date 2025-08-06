export interface FileHealth {
    filePath: string;
    fileName: string;
    lineCount: number;
    complexity: 'HEALTHY' | 'BLOATED' | 'CRITICAL';
    healthScore: number; // 0-100
    issues: HealthIssue[];
    suggestions: RefactoringSuggestion[];
    fileSize: number;
    lastModified: Date;
}

export interface HealthIssue {
    type: 'SIZE' | 'COMPLEXITY' | 'STRUCTURE' | 'NAMING';
    severity: 'INFO' | 'WARNING' | 'CRITICAL';
    description: string;
    lineNumber?: number;
    suggestion: string;
}

export interface RefactoringSuggestion {
    type: 'split-file' | 'extract-function' | 'move-to-utils' | 'create-component' | 'extract-interface';
    description: string;
    targetPath: string;
    priority: number; // 1-10
    estimatedBenefit: string;
}

export interface ProjectHealth {
    totalFiles: number;
    healthyFiles: number;
    bloatedFiles: number;
    criticalFiles: number;
    overallScore: number;
    worstOffenders: FileHealth[];
    suggestions: RefactoringSuggestion[];
}
