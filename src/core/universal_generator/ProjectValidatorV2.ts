export interface ValidationResult {
  score: number;
  warnings: string[];
  errors: string[];
}

export class ProjectValidatorV2 {
  public validateProject(filesPlanned: string[], modules: string[]): ValidationResult {
    const warnings: string[] = [];
    const errors: string[] = [];
    let score = 100;

    if (modules.length === 0) {
      errors.push('Project has zero modules planned.');
      score -= 30;
    }

    if (!filesPlanned.some(f => f.includes('README.md'))) {
      warnings.push('Missing README.md documentation.');
      score -= 5;
    }

    // Check naming casing violations
    for (const f of filesPlanned) {
      const parts = f.split('/');
      const filename = parts[parts.length - 1];
      if (filename && filename.includes('_') && filename.endsWith('.ts') && !filename.includes('test') && !filename.includes('spec')) {
        warnings.push(`File ${filename} uses snake_case instead of standard camelCase/PascalCase.`);
        score -= 2;
      }
    }

    // Check tests planned
    if (!filesPlanned.some(f => f.includes('test') || f.includes('spec'))) {
      warnings.push('Missing testing configurations.');
      score -= 10;
    }

    return {
      score: Math.max(score, 0),
      warnings,
      errors
    };
  }
}
export const projectValidatorV2 = new ProjectValidatorV2();
export default projectValidatorV2;
