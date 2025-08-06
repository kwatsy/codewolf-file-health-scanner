import { HealthRule } from '../interfaces/health-rule';

export const sizeRules: HealthRule[] = [
    {
        name: 'massive_file',
        category: 'SIZE',
        check: (content: string, filePath: string, lineCount: number) => lineCount > 500,
        severity: 'CRITICAL',
        description: 'File exceeds 500 lines - this is getting unwieldy!',
        suggestion: 'Break into smaller, focused modules like CodeWolf Security Scanner (went from 835 → 78 lines)',
        priority: 10
    },
    {
        name: 'bloated_file',
        category: 'SIZE', 
        check: (content: string, filePath: string, lineCount: number, config?: any) => {
            const threshold = config?.maxHealthyFileSize || 300;
            return lineCount > threshold;
        },
        severity: 'WARNING',
        description: 'File exceeds healthy threshold - consider splitting',
        suggestion: 'Extract utilities, components, or business logic into separate files',
        priority: 7
    },
    {
        name: 'god_file',
        category: 'SIZE',
        check: (content: string, filePath: string, lineCount: number, config?: any) => {
            const threshold = config?.criticalFileSize || 500;
            return lineCount > threshold;
        },
        severity: 'CRITICAL',
        description: 'CRITICAL FILE! This needs immediate refactoring',
        suggestion: 'URGENT: Split this into multiple focused modules. Check CodeWolf patterns for inspiration.',
        priority: 10
    },
    {
        name: 'healthy_file',
        category: 'SIZE',
        check: (content: string, filePath: string, lineCount: number, config?: any) => {
            const threshold = config?.maxHealthyFileSize || 300;
            return lineCount <= threshold;
        },
        severity: 'INFO',
        description: 'Perfect file size! Easy to read and maintain',
        suggestion: 'Keep up the good work! This is the CodeWolf way 🐺',
        priority: 1
    }
];
