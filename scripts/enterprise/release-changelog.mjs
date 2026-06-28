import { changelogGenerator } from '../../src/core/enterprise/ChangelogGenerator.ts';
import fs from 'fs';
import path from 'path';

console.log('Generating automated release changelog...');
const changelog = changelogGenerator.generateChangelog();
console.log('Changelog Content:');
console.log(changelog);

// Write to docs/release/CHANGELOG.md as well
const docsDir = path.resolve('docs/release');
if (!fs.existsSync(docsDir)) {
  fs.mkdirSync(docsDir, { recursive: true });
}
const targetPath = path.join(docsDir, 'CHANGELOG.md');
fs.writeFileSync(targetPath, changelog, 'utf8');
console.log(`Changelog saved successfully at ${targetPath}.`);
