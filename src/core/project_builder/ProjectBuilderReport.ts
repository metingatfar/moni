import type { ExecutionPackage } from './ExecutionPackage';

export class ProjectBuilderReport {
  public generateReport(pkg: ExecutionPackage): string {
    const b = pkg.blueprint;
    
    return `# MONI Project Builder Orchestrations Summary Report

## Executive Plan Overview
- **Project Name**: ${b.name}
- **Target Platform**: ${b.targetPlatform}
- **Technology Stack**: ${b.selectedLanguage} / ${b.selectedFramework}
- **Architecture**: ${b.selectedArchitecture}
- **Readiness Score**: ${pkg.readinessScore}% (${pkg.approved ? 'Approved for Generation' : 'Pending Approvals'})

---

## Folders planned
${b.folders.map(f => `- \`${f.path}\`: ${f.purpose}`).join('\n')}

---

## Modules planned
${b.modules.map(m => `### Module: ${m.name}
- Description: ${m.description}
- Planned Files: ${m.files.join(', ')}
- Dependencies: ${m.dependencies.join(', ') || 'None'}`).join('\n\n')}

---

## API Routes planned
${b.apis.map(api => `- \`${api.method} ${api.path}\`: ${api.description}`).join('\n')}

---

## Database Schemas
- **Provider**: ${b.database.provider}
- **Tables**:
${b.database.tables.map(t => `  - **${t.name}**:
    - Columns: ${t.columns.join(', ')}
    - Relations: ${t.relations.join(', ')}`).join('\n')}

---

## Complexity Metrics
- Estimated Lines of Code: ${pkg.complexity.estimatedLinesOfCode}
- Module Count: ${pkg.complexity.moduleCount}
- API Count: ${pkg.complexity.apiCount}
- Overall Complexity Score: ${pkg.complexity.overallScore}/100
`;
  }
}
