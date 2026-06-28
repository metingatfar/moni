import { architectureHistory } from '../../src/core/enterprise/ArchitectureHistory.ts';

console.log('--- MONI Architecture History ---');
const history = architectureHistory.getHistory();
for (const entry of history) {
  console.log(`\nSprint: ${entry.sprintNumber} (${entry.releaseDate})`);
  console.log(`- Added: ${entry.addedModules.join(', ')}`);
  console.log(`- Modified: ${entry.modifiedModules.join(', ')}`);
  console.log(`- Notes: ${entry.architectureNotes}`);
  console.log(`- Risks: ${entry.risks}`);
  console.log(`- Tech Debt: ${entry.technicalDebt}`);
}

console.log('\n--- Comparing Sprint 3.5 and Sprint 3.6 ---');
const diff = architectureHistory.querySprintDiff('Sprint 3.5', 'Sprint 3.6');
console.log(diff);
