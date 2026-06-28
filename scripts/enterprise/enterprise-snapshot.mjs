import { architectureSnapshot } from '../../src/core/enterprise/ArchitectureSnapshot.ts';
import fs from 'fs';
import path from 'path';

console.log('Generating architecture snapshot of MONI engines and subsystems...');
const snapshot = architectureSnapshot.generateSnapshot();
const targetPath = path.resolve('ArchitectureSnapshot.json');

fs.writeFileSync(targetPath, JSON.stringify(snapshot, null, 2), 'utf8');
console.log(`ArchitectureSnapshot.json generated successfully at ${targetPath}.`);
