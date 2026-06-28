import { qualityGate } from '../../src/core/enterprise/QualityGate.ts';

console.log('Evaluating release quality gate criteria...');
const check = qualityGate.checkGate();
if (check.passed) {
  console.log('Quality Gate PASSED. Code meets all release requirements.');
} else {
  console.error(`Quality Gate FAILED: ${check.reason}`);
  process.exit(1);
}
