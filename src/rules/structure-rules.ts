import { HealthRule } from '../interfaces/health-rule';

export const structureRules: HealthRule[] = [
    {
        name: 'missing_separation',
        category: 'STRUCTURE',
        check: (content: string, filePath: string) => {
            // Check if project lacks proper folder structure
            const isInRoot = !filePath.includes('/src/') && !filePath.includes('\\src\\');
            const isLargeFile = content.split('\n').length > 100;
            
            return isInRoot && isLargeFile;
        },
        severity: 'WARNING',
        description: 'Large file in root directory - needs better organization',
        suggestion: 'Move to src/ folder and consider CodeWolf structure: interfaces/, rules/, utils/, templates/',
        priority: 7
    },
    {
        name: 'no_interfaces_folder',
        category: 'STRUCTURE',
        check: (content: string, filePath: string) => {
            // Check if file has interfaces but no interfaces folder exists
            const hasInterfaces = /interface\s+\w+|type\s+\w+/.test(content);
            const isNotInInterfacesFolder = !filePath.includes('/interfaces/') && !filePath.includes('\\interfaces\\');
            
            return hasInterfaces && isNotInInterfacesFolder && content.split('\n').length > 50;
        },
        severity: 'INFO',
        description: 'File contains interfaces - consider extracting to interfaces/ folder',
        suggestion: 'Create interfaces/ folder like CodeWolf for better type organization',
        priority: 4
    },
    {
        name: 'utils_in_main_file',
        category: 'STRUCTURE',
        check: (content: string, filePath: string) => {
            // Check for utility functions in main files
            const hasUtils = /(helper|util|format|parse|validate|sanitize|transform)/.test(content);
            const isNotUtilsFile = !filePath.includes('/utils/') && !filePath.includes('\\utils\\');
            const isMainFile = filePath.includes('App.') || filePath.includes('index.') || filePath.includes('main.');
            
            return hasUtils && isNotUtilsFile && isMainFile;
        },
        severity: 'WARNING',
        description: 'Utility functions mixed with main logic',
        suggestion: 'Extract utilities to utils/ folder like CodeWolf pattern for reusability',
        priority: 6
    },
    {
        name: 'codewolf_compliant',
        category: 'STRUCTURE',
        check: (content: string, filePath: string) => {
            // Check if following CodeWolf pattern
            const isInProperFolder = filePath.includes('/src/') && (
                filePath.includes('/interfaces/') ||
                filePath.includes('/rules/') ||
                filePath.includes('/utils/') ||
                filePath.includes('/templates/') ||
                filePath.includes('/components/')
            );
            const isSmallFile = content.split('\n').length <= 100;
            
            return isInProperFolder && isSmallFile;
        },
        severity: 'INFO',
        description: 'Excellent! Following CodeWolf architecture pattern',
        suggestion: 'Perfect structure! Keep up the modular approach 🐺',
        priority: 1
    },
    {
        name: 'everything_in_components',
        category: 'STRUCTURE',
        check: (content: string, filePath: string) => {
            // Check if everything is dumped in components folder
            const isInComponents = filePath.includes('/components/') || filePath.includes('\\components\\');
            const hasBusinessLogic = /(api|fetch|axios|database|sql|query)/.test(content);
            const hasUtils = /(helper|util|format|parse)/.test(content);
            
            return isInComponents && (hasBusinessLogic || hasUtils);
        },
        severity: 'WARNING',
        description: 'Business logic or utilities in components folder',
        suggestion: 'Move business logic to rules/ or services/, utilities to utils/ folder',
        priority: 6
    }
];
