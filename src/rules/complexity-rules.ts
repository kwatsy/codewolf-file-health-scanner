import { HealthRule } from '../interfaces/health-rule';

export const complexityRules: HealthRule[] = [
    {
        name: 'god_function',
        category: 'COMPLEXITY',
        pattern: /(function|const|class)\s+\w+.*\{[\s\S]{1000,}\}/,
        check: (content: string) => {
            // Look for massive functions/components
            const functionMatches = content.match(/(function|const|class)\s+\w+[^{]*\{/g);
            if (!functionMatches) return false;
            
            // Check if any function body is huge
            return content.includes('function') && content.length > 2000;
        },
        severity: 'CRITICAL',
        description: 'Function/component is doing WAY too much',
        suggestion: 'Split into smaller, single-purpose functions. Follow the CodeWolf pattern!',
        priority: 9
    },
    {
        name: 'nested_hell',
        category: 'COMPLEXITY',
        pattern: /\{[\s\S]*\{[\s\S]*\{[\s\S]*\{[\s\S]*\{[\s\S]*\{/,
        check: (content: string) => {
            // Count nesting levels
            let maxNesting = 0;
            let currentNesting = 0;
            
            for (const char of content) {
                if (char === '{') {
                    currentNesting++;
                    maxNesting = Math.max(maxNesting, currentNesting);
                } else if (char === '}') {
                    currentNesting--;
                }
            }
            
            return maxNesting > 6;
        },
        severity: 'WARNING',
        description: 'Too much nesting - code is hard to follow',
        suggestion: 'Extract nested logic into separate functions or use early returns',
        priority: 6
    },
    {
        name: 'everything_in_one_place',
        category: 'COMPLEXITY',
        check: (content: string) => {
            // Check for files that seem to do everything
            const hasComponents = /export\s+(default\s+)?(function|const|class)/.test(content);
            const hasUtils = /(helper|util|format|parse|validate)/.test(content);
            const hasTypes = /(interface|type|enum)/.test(content);
            const hasStyles = /(styled|css|style)/.test(content);
            
            return hasComponents && hasUtils && hasTypes && hasStyles;
        },
        severity: 'WARNING',
        description: 'File is trying to do everything - components, utils, types, styles',
        suggestion: 'Separate concerns: components/, utils/, interfaces/, styles/ like CodeWolf',
        priority: 8
    },
    {
        name: 'import_chaos',
        category: 'COMPLEXITY',
        check: (content: string) => {
            const importLines = content.split('\n').filter(line => 
                line.trim().startsWith('import') || line.trim().startsWith('const') && line.includes('require')
            );
            return importLines.length > 20;
        },
        severity: 'WARNING',
        description: 'Too many imports - file has too many dependencies',
        suggestion: 'Consider if this file is doing too much. Split responsibilities.',
        priority: 5
    }
];
