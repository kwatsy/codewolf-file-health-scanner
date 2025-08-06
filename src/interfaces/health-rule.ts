export interface HealthRule {
    name: string;
    category: 'SIZE' | 'COMPLEXITY' | 'STRUCTURE' | 'NAMING';
    pattern?: RegExp;
    check: (content: string, filePath: string, lineCount: number, config?: HealthConfig) => boolean;
    severity: 'INFO' | 'WARNING' | 'CRITICAL';
    description: string;
    suggestion: string;
    priority: number;
}

export interface HealthConfig {
    maxHealthyFileSize: number;
    criticalFileSize: number;
    enableRealTimeScanning: boolean;
    excludePatterns: string[];
    customRules?: HealthRule[];
}
