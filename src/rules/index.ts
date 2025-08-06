import { HealthRule } from '../interfaces/health-rule';
import { sizeRules } from './size-rules';
import { complexityRules } from './complexity-rules';
import { structureRules } from './structure-rules';

export function loadAllHealthRules(): HealthRule[] {
    return [
        ...sizeRules,
        ...complexityRules,
        ...structureRules
    ];
}

export function getRulesByCategory(category: 'SIZE' | 'COMPLEXITY' | 'STRUCTURE' | 'NAMING'): HealthRule[] {
    const allRules = loadAllHealthRules();
    return allRules.filter(rule => rule.category === category);
}

export function getCriticalRules(): HealthRule[] {
    const allRules = loadAllHealthRules();
    return allRules.filter(rule => rule.severity === 'CRITICAL');
}

export {
    sizeRules,
    complexityRules,
    structureRules
};
