export class ImportResolver {
  public resolveImports(code: string): string[] {
    const imports: string[] = [];
    if (code.includes('AuthService')) {
      imports.push("import { AuthService } from '../auth/AuthService'");
    }
    if (code.includes('Page')) {
      imports.push("import React from 'react'");
    }
    return imports;
  }
}
