import { codeTemplateEngine } from './CodeTemplateEngine';

export interface PatchDraft {
  id: string;
  targetFile: string;
  patchContent: string;
  type: 'create' | 'modify' | 'delete';
}

export class AutonomousCodeGenerator {
  public generateCode(
    fileName: string,
    _goal: string,
    _strategy: string,
    framework: string
  ): PatchDraft {
    const isInterface = fileName.toLowerCase().includes('interface') || fileName.startsWith('I');
    const type = isInterface ? 'interface' : 'class';
    
    const patchContent = codeTemplateEngine.generateTemplate(
      type,
      fileName,
      framework
    );

    return {
      id: `draft-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      targetFile: fileName,
      patchContent,
      type: 'create'
    };
  }
}

export const autonomousCodeGenerator = new AutonomousCodeGenerator();
export default autonomousCodeGenerator;
