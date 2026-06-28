export class ValidationEngine {
  public validateSyntax(code: string): { valid: boolean; score: number; errors: string[] } {
    const errors: string[] = [];

    if (code.includes('undefined') && !code.includes('typeof undefined')) {
      errors.push('Potential unresolved variable reference of type undefined.');
    }
    if (code.includes('TODO')) {
      errors.push('Code contains incomplete TODO blocks.');
    }

    const score = errors.length === 0 ? 100 : Math.max(30, 100 - errors.length * 15);

    return {
      valid: score > 70,
      score,
      errors
    };
  }
}
