import { autonomousCodeGenerator } from './AutonomousCodeGenerator';
import { selfVerificationEngine } from './SelfVerificationEngine';
import type { PatchDraft } from './AutonomousCodeGenerator';

export class MultiFileGenerator {
  public generateMultipleFiles(
    files: string[],
    goal: string,
    strategy: string,
    framework: string
  ): { drafts: PatchDraft[]; verifiedIssues: string[] } {
    const drafts: PatchDraft[] = [];
    const verifiedIssues: string[] = [];

    for (const file of files) {
      const rawDraft = autonomousCodeGenerator.generateCode(file, goal, strategy, framework);
      
      // Run through self verification loop
      const verifyResult = selfVerificationEngine.verifyAndImprove(rawDraft, goal);
      drafts.push(verifyResult.finalDraft);
      verifiedIssues.push(...verifyResult.issuesCorrected);
    }

    return { drafts, verifiedIssues };
  }
}

export const multiFileGenerator = new MultiFileGenerator();
export default multiFileGenerator;
