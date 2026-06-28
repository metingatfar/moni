import { architectureIndex } from '../../src/core/enterprise/ArchitectureIndex.ts';
import fs from 'fs';
import path from 'path';

console.log('Generating ArchitectureIndex.json mapping all system dependencies and engines...');
const index = architectureIndex.getIndex();
const targetPath = path.resolve('ArchitectureIndex.json');

fs.writeFileSync(targetPath, JSON.stringify(index, null, 2), 'utf8');
console.log(`ArchitectureIndex.json generated successfully at ${targetPath}.`);
