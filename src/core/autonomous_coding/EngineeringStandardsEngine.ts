import type { PatchDraft } from './AutonomousCodeGenerator';

export interface EngineeringStandardsReport {
  solidPass: boolean;
  dryPass: boolean;
  kissPass: boolean;
  yagniPass: boolean;
  cleanArchitecturePass: boolean;
  diPass: boolean;
  layerSeparationPass: boolean;
  failures: string[];
}

export class EngineeringStandardsEngine {
  public validateStandards(draft: PatchDraft): EngineeringStandardsReport {
    const code = draft.patchContent || '';
    const targetFile = draft.targetFile;
    const failures: string[] = [];

    const solidPass = code.includes('interface') || code.includes('implements') || !code.includes('class ');
    const dryPass = !code.includes('copy-paste');
    const kissPass = code.split('\n').length < 200;
    const yagniPass = !code.includes('// Future implementation placeholder');
    
    // Clean Architecture Check: Core layers shouldn't import presentation
    const cleanArchitecturePass = !code.includes("import") || !code.includes("presentation");
    
    // Dependency Injection check: Constructor resolves or accepts params instead of direct instantiation
    const diPass = !code.includes('new ') || code.includes('container.resolve');

    // Layer separation
    const layerSeparationPass = !(targetFile.includes('core') && code.includes('document.createElement'));

    if (!solidPass) failures.push('SOLID: Class lacks interface contract mapping.');
    if (!diPass) failures.push('DI: Direct class instantiation found instead of Dependency Injection resolution.');
    if (!layerSeparationPass) failures.push('Layer Separation: Backend module attempts browser DOM mutations.');

    return {
      solidPass,
      dryPass,
      kissPass,
      yagniPass,
      cleanArchitecturePass,
      diPass,
      layerSeparationPass,
      failures
    };
  }
}

export const engineeringStandardsEngine = new EngineeringStandardsEngine();
export default engineeringStandardsEngine;
