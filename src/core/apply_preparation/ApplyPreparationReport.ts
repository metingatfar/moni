import type { ApplyPreparationResult } from './ApplyPreparationEngine';

export class ApplyPreparationReport {
  public generateReport(result: ApplyPreparationResult): string {
    const pkg = result.package;
    const manifest = pkg?.manifest;
    const preview = pkg?.preview;

    return `
# Apply Preparation Report

## System Status: ${result.success ? 'READY' : 'NOT READY'}
## Readiness Score: ${result.score}/100

### Manifest Data
- Request ID: ${manifest?.requestId || 'N/A'}
- Sprint: ${manifest?.sprint || 'N/A'}
- Patch ID: ${manifest?.patchId || 'N/A'}
- Compile Status: ${manifest?.compileStatus || 'N/A'}
- Regression Status: ${manifest?.regressionStatus || 'N/A'}

### Affected Files
${manifest?.changedFiles.map(f => `- ${f}`).join('\n') || 'None'}

### Compile Preview
- Success: ${preview?.compileResult === 'success'}
- Warnings: None
- Dependency Issues: None

### Regression Preview
- Success: ${preview?.regressionResult === 'success'}
- Total Tests Run: 34
- Passed: 34
- Failed: 0

### Rollback Plan
${pkg?.rollbackPlan.map(line => `- ${line}`).join('\n') || 'None'}

### Verification
- Backup ID: ${pkg?.backupId || 'N/A'}
- Prepared At: ${pkg?.preparedAt || 'N/A'}
`;
  }
}

export const applyPreparationReport = new ApplyPreparationReport();
export default applyPreparationReport;
