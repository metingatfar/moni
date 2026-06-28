import { migrationEngine } from '../../src/core/enterprise/MigrationEngine.ts';

const legacyData = JSON.stringify({
  longTermMemory: [
    { memoryId: "mem-1", content: "Remembered item" }
  ]
});

console.log('Firing database schema migration path from schema-v1 to schema-v2...');
const result = migrationEngine.migrate(legacyData, 'schema-v1', 'schema-v2');
if (result.success) {
  console.log('Migration Completed Successfully.');
  console.log('Changes Applied:', result.changesApplied.join(', '));
  console.log('Migrated Data:', result.data);
} else {
  console.error('Migration Failed:', result.changesApplied.join(', '));
  process.exit(1);
}
