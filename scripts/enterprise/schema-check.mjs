import { schemaVersionManager } from '../../src/core/enterprise/SchemaVersionManager.ts';

const activeSchema = schemaVersionManager.getActiveSchema();
const compatMatrix = schemaVersionManager.getCompatibilityMatrix();
console.log('--- Database Schema Check ---');
console.log(`Active Schema: ${activeSchema}`);
console.log(`Compatibility Boundaries: ${compatMatrix.join(', ')}`);
console.log('Is schema-v1 compatible?', schemaVersionManager.isCompatible('schema-v1'));
console.log('Is schema-v2 compatible?', schemaVersionManager.isCompatible('schema-v2'));
console.log('Is schema-v3 compatible?', schemaVersionManager.isCompatible('schema-v3'));
