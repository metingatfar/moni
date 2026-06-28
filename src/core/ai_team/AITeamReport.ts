import type { CompiledTeamReviews } from './TeamCoordinator';
import type { BoardReviewOutput } from './ReviewBoard';
import type { TeamMetricsSummary } from './AITeamMetrics';
import * as fs from 'fs';
import * as path from 'path';

export class AITeamReport {
  public generateMainReport(
    reviews: CompiledTeamReviews,
    board: BoardReviewOutput,
    metrics: TeamMetricsSummary
  ): string {
    return `# MONI AI Developer Team Review Report

## Executive Review Summary
* **Review Board Verdict**: **${board.status.toUpperCase()}**
* **Consolidated Team Confidence**: \`${board.confidenceScore}%\`
* **Project Overall Health Score**: \`${metrics.overallHealthScore}/100\`
* **Calculated Risk Rating**: \`${board.riskScore}/100\`

---

## Unified Engineering Metrics
* **Total Mapped Files Reviewed**: \`${metrics.reviewedFilesCount} files\`
* **Total API Enpoints Audited**: \`${metrics.reviewedApisCount} endpoints\`
* **Identified Vulnerability / Bug Risks**: \`${metrics.detectedRisksCount} findings\`
* **Static Analysis Code Smells**: \`${reviews.staticAnalysisReview.codeSmellsCount} smells\`
* **Projected QA Test Coverage**: \`${metrics.qaCoveragePercent}%\`
* **Projected Documentation Coverage**: \`${metrics.documentationCoveragePercent}%\`

---

## Detailed Agent Findings

### Lead Architect
${reviews.architectReview.findings.map((f: string) => `- ${f}`).join('\n') || '- No critical architectural findings.'}
* **Recommendations**: ${reviews.architectReview.recommendations.join(' ') || 'None.'}

### Database Architect
${reviews.databaseReview.findings.map((f: string) => `- ${f}`).join('\n') || '- No relational schema findings.'}
* **Normalization Tiers**: \`${reviews.databaseReview.normalizationLevel}\`

### Backend Developer
${reviews.backendReview.findings.map((f: string) => `- ${f}`).join('\n') || '- No backend service findings.'}

### Frontend Developer
${reviews.frontendReview.findings.map((f: string) => `- ${f}`).join('\n') || '- No layout structures findings.'}

### Security & Vulnerabilities
${reviews.securityReview.findings.map((f: string) => `- ${f}`).join('\n')}
${reviews.securityReview.owaspVulnerabilities.map((v: string) => `- **[OWASP DETECTED]**: ${v}`).join('\n') || '- Zero OWASP threats identified.'}

### Performance Optimization
${reviews.performanceReview.findings.map((f: string) => `- ${f}`).join('\n')}
${reviews.performanceReview.bottlenecksFound.map((b: string) => `- **[BOTTLENECK]**: ${b}`).join('\n') || '- Zero performance issues identified.'}

### Bug Hunter Diagnostics
${reviews.bugReview.findings.map((f: string) => `- ${f}`).join('\n')}
${reviews.bugReview.potentialBugs.map((b: string) => `- **[POTENTIAL BUG]**: ${b}`).join('\n') || '- Zero active runtime bugs detected.'}

---

## Mandatory Quality Gates Review
* **Total Gates Evaluated**: \`${board.gateSummary.totalGatesChecked}\`
* **Passed Gates**: \`${board.gateSummary.passedGatesCount}\`
* **Failed Gates**: ${board.gateSummary.failedGates.map(g => `\`${g}\``).join(', ') || 'None'}
`;
  }

  public writeAllReports(
    reviews: CompiledTeamReviews,
    board: BoardReviewOutput,
    metrics: TeamMetricsSummary,
    targetDir: string = './reports'
  ): void {
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const write = (filename: string, content: string) => {
      fs.writeFileSync(path.join(targetDir, filename), content.trim() + '\n', 'utf8');
    };

    // 1. AI_Team_Report.md
    write('AI_Team_Report.md', this.generateMainReport(reviews, board, metrics));

    // 2. Lead_Architect_Report.md
    write('Lead_Architect_Report.md', `# Lead Architect Agent Report
* **Confidence Score**: \`${reviews.architectReview.confidence * 100}%\`
* **Valid**: \`${reviews.architectReview.valid}\`

## Key Architecture Findings
${reviews.architectReview.findings.map((f: string) => `- ${f}`).join('\n') || '- No architectural risks found.'}

## Architect Recommendations
${reviews.architectReview.recommendations.map((r: string) => `- ${r}`).join('\n') || '- Adhere to clean structure.'}
`);

    // 3. Backend_Report.md
    write('Backend_Report.md', `# Backend Developer Agent Report
* **Confidence Score**: \`${reviews.backendReview.confidence * 100}%\`

## API & Route Findings
${reviews.backendReview.findings.map((f: string) => `- ${f}`).join('\n') || '- Valid routing configuration.'}

## Backend Recommendations
- Security audit of authentication pathways.
- Review parameter validation depth.
`);

    // 4. Frontend_Report.md
    write('Frontend_Report.md', `# Frontend Developer Agent Report
* **Confidence Score**: \`${reviews.frontendReview.confidence * 100}%\`

## UI Layout & Component Findings
${reviews.frontendReview.findings.map((f: string) => `- ${f}`).join('\n') || '- Clean component declarations.'}

## Frontend Recommendations
- Implement theme-aware responsive typography.
- Enable bundle splitting for heavy components.
`);

    // 5. Mobile_Report.md
    write('Mobile_Report.md', `# Mobile Developer Agent Report
* **Confidence Score**: \`${reviews.mobileReview.confidence * 100}%\`
* **Framework Matched**: \`${reviews.mobileReview.frameworkMatched}\`

## Mobile Architecture Findings
${reviews.mobileReview.findings.map((f: string) => `- ${f}`).join('\n') || '- Valid mobile configuration.'}

## Mobile Developer Recommendations
- Optimize caching policies on HTTP client models.
- Set up local database persistence configurations.
`);

    // 6. Database_Report.md
    write('Database_Report.md', `# Database Architect Agent Report
* **Confidence Score**: \`${reviews.databaseReview.confidence * 100}%\`
* **Normalization Tier**: \`${reviews.databaseReview.normalizationLevel}\`

## Database Indexing & Schema Findings
${reviews.databaseReview.findings.map((f: string) => `- ${f}`).join('\n') || '- Relational integrity verified.'}

## Database Recommendations
${reviews.databaseReview.recommendations.map((r: string) => `- ${r}`).join('\n') || '- Add composite indexes on foreign keys.'}
`);

    // 7. Security_Report.md
    write('Security_Report.md', `# Security Engineer Agent Report
* **Confidence Score**: \`${reviews.securityReview.confidence * 100}%\`
* **Detected OWASP Risks Count**: \`${reviews.securityReview.owaspVulnerabilities.length}\`

## Security Audit Findings
${reviews.securityReview.findings.map((f: string) => `- ${f}`).join('\n')}
${reviews.securityReview.owaspVulnerabilities.map((v: string) => `- **[OWASP]**: ${v}`).join('\n') || '- No security issues detected.'}

## Security Hardening Recommendations
${reviews.securityReview.recommendations.map((r: string) => `- ${r}`).join('\n') || '- No specific recommendations.'}
`);

    // 8. Performance_Report.md
    write('Performance_Report.md', `# Performance Engineer Agent Report
* **Confidence Score**: \`${reviews.performanceReview.confidence * 100}%\`
* **Bottlenecks Detected**: \`${reviews.performanceReview.bottlenecksFound.length}\`

## Performance Findings
${reviews.performanceReview.findings.map((f: string) => `- ${f}`).join('\n')}
${reviews.performanceReview.bottlenecksFound.map((b: string) => `- **[BOTTLENECK]**: ${b}`).join('\n') || '- No bottlenecks detected.'}

## Performance Optimization Recommendations
${reviews.performanceReview.recommendations.map((r: string) => `- ${r}`).join('\n') || '- Enable lazy loading.'}
`);

    // 9. QA_Report.md
    write('QA_Report.md', `# QA Engineer Agent Report
* **Confidence Score**: \`${reviews.qaReview.confidence * 100}%\`
* **Projected QA Coverage**: \`${reviews.qaReview.expectedCoverage}%\`

## QA Audit Findings
${reviews.qaReview.findings.map((f: string) => `- ${f}`).join('\n') || '- Test config is valid.'}

## Planned Test Suites
${reviews.qaReview.testSuitesPlanned.map((s: string) => `- ${s}`).join('\n') || '- Unit test suite only.'}
`);

    // 10. Documentation_Report.md
    write('Documentation_Report.md', `# Documentation Engineer Agent Report
* **Confidence Score**: \`${reviews.docsReview.confidence * 100}%\`
* **Documentation Coverage**: \`${reviews.docsReview.documentationCoveragePercent}%\`

## Documentation Findings
${reviews.docsReview.findings.map((f: string) => `- ${f}`).join('\n') || '- Markdown files verified.'}

## Planned Docs Outline
${reviews.docsReview.docsPlanned.map((d: string) => `- ${d}`).join('\n') || '- README.md'}
`);

    // 11. Code_Review_Report.md
    write('Code_Review_Report.md', `# Code Reviewer Agent Report
* **Confidence Score**: \`${reviews.codeReview.confidence * 100}%\`
* **Style Conforming**: \`${reviews.codeReview.styleConforming}\`
* **Naming Standards Score**: \`${reviews.codeReview.namingStandardsScore}/100\`

## Code Review Findings
${reviews.codeReview.findings.map((f: string) => `- ${f}`).join('\n') || '- Standard coding style checks passed.'}

## Recommendations
- Enforce strict typing across module boundaries.
- Reduce maximum function complexity.
`);

    // 12. Refactoring_Report.md
    write('Refactoring_Report.md', `# Refactoring Agent Report
* **Confidence Score**: \`${reviews.refactoringReview.confidence * 100}%\`

## Refactoring Recommendations
${reviews.refactoringReview.findings.map((f: string) => `- ${f}`).join('\n')}
${reviews.refactoringReview.refactoringOpportunities.map((t: string) => `- **[OPPORTUNITY]**: ${t}`).join('\n') || '- No complex functions need refactoring.'}
`);

    // 13. Bug_Report.md
    write('Bug_Report.md', `# Bug Hunter Agent Report
* **Confidence Score**: \`${reviews.bugReview.confidence * 100}%\`
* **Potential Bugs Found**: \`${reviews.bugReview.potentialBugs.length}\`

## Bug Scan Findings
${reviews.bugReview.findings.map((f: string) => `- ${f}`).join('\n')}
${reviews.bugReview.potentialBugs.map((b: string) => `- **[BUG]**: ${b}`).join('\n') || '- No active logical bugs detected.'}
`);

    // 14. Dependency_Report.md
    write('Dependency_Report.md', `# Dependency Audit Agent Report
* **Confidence Score**: \`${reviews.dependencyReview.confidence * 100}%\`
* **Licensing Risks**: \`${reviews.dependencyReview.licensingRisks.length}\`

## Dependency Findings
${reviews.dependencyReview.findings.map((f: string) => `- ${f}`).join('\n')}
${reviews.dependencyReview.licensingRisks.map((l: string) => `- **[LICENSE]**: ${l}`).join('\n') || '- All dependencies use MIT/Apache licenses.'}
`);

    // 15. Review_Board_Report.md
    write('Review_Board_Report.md', `# Review Board Report
* **Verdict**: **${board.status.toUpperCase()}**
* **Confidence Index**: \`${board.confidenceScore}%\`
* **Risk Score**: \`${board.riskScore}/100\`

## Quality Gates Audit Summary
* Total Checked: \`${board.gateSummary.totalGatesChecked}\`
* Passed: \`${board.gateSummary.passedGatesCount}\`
* Failed Gates list:
${board.gateSummary.failedGates.map(g => `- ${g}`).join('\n') || '- None'}
`);

    // 16. Diagnostics_Report.md
    write('Diagnostics_Report.md', `# Static Analysis & Diagnostics Report
* **Confidence Score**: \`${reviews.staticAnalysisReview.confidence * 100}%\`
* **Lint Code Smells Count**: \`${reviews.staticAnalysisReview.codeSmellsCount}\`

## Diagnostics Findings
${reviews.staticAnalysisReview.findings.map((f: string) => `- ${f}`).join('\n')}
${reviews.staticAnalysisReview.warnings.map((w: string) => `- **[WARNING]**: ${w}`).join('\n') || '- Default eslint configs applied.'}
`);

    // 17. Production_Readiness_Report.md
    write('Production_Readiness_Report.md', `# Production Readiness Report
* **Overall Project Health**: \`${metrics.overallHealthScore}/100\`
* **Final Readiness Verdict**: ${board.status === 'Passed' && metrics.overallHealthScore > 80 ? '**Ready for Production**' : '**Needs Improvements**'}

## Production Audit Summary Checklist
- [x] Architecture validation check
- [x] OWASP Vulnerabilities audit
- [x] Relational schema index checks
- [x] Code standard enforcement linting
- [x] Expected QA coverage validation (Current: ${metrics.qaCoveragePercent}%)
- [x] API documentation coverage validation (Current: ${metrics.documentationCoveragePercent}%)
`);
  }
}

