import type { UniversalProjectModel } from './UniversalProjectModel';
import type { ValidationResult } from './ProjectValidatorV2';

export class UniversalGenerationReport {
  public generateReport(
    model: UniversalProjectModel,
    filesPlanned: string[],
    dependencies: string[],
    validation: ValidationResult
  ): string {
    return `
# Universal Code Generation Report - ${model.projectName}

## Selected Technology Stack
- **Target Platform**: ${model.targetPlatform}
- **Language**: ${model.selectedLanguage}
- **Framework**: ${model.selectedFramework}
- **Architecture Style**: ${model.selectedArchitecture}

## File Planning Tree
${filesPlanned.map(f => `- ${f}`).join('\n')}

## Dependency Manifest Package
${dependencies.map(d => `- ${d}`).join('\n')}

## Project Validation Results
- **Validation Score**: ${validation.score}/100
- **Errors Count**: ${validation.errors.length}
- **Warnings Count**: ${validation.warnings.length}
`;
  }
}
export const universalGenerationReport = new UniversalGenerationReport();
export default universalGenerationReport;
