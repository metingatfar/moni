import { auditTrail } from '../../src/core/enterprise/AuditTrail.ts';
import { releaseManager } from '../../src/core/release/ReleaseManager.ts';

// Add a test action to populate the logs if empty
auditTrail.logAction('System Audit Initialized', 'Success');
await releaseManager.runReleaseDryRun();

console.log('--- System Enterprise Audit Log ---');
const logs = auditTrail.getLogs();
for (const entry of logs) {
  console.log(`[${entry.timestamp}] ${entry.user} - Action: ${entry.action} - Result: ${entry.result} (${entry.sprint})`);
}
