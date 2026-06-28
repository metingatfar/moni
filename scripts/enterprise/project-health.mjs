import { projectHealthEngine } from '../../src/core/enterprise/ProjectHealthEngine.ts';

const health = projectHealthEngine.calculateHealth();
console.log('--- Project Health Metrics ---');
console.log(`Overall Health Score: ${health.healthScore}%`);
console.log(`Architecture Score: ${health.architectureScore}%`);
console.log(`Technical Debt Count: ${health.technicalDebtCount}`);
console.log(`Test Pass Rate: ${health.testPassRate}%`);
console.log(`Build Status: ${health.buildStatus}`);
console.log(`Strongest Subsystem: ${health.strongestSubsystem}`);
console.log(`Weakest Subsystem: ${health.weakestSubsystem}`);
console.log('Recommendations:', health.recommendations.join(', '));
