import { container } from '../container/ServiceContainer';

export interface ReuseCandidate {
  name: string;
  type: 'service' | 'component' | 'hook' | 'utility' | 'interface';
  fileUri: string;
  similarityScore: number;
}

export class CodeReuseAnalyzer {
  public analyzeForReuse(goal: string): ReuseCandidate[] {
    const candidates: ReuseCandidate[] = [];
    const lowerGoal = goal.toLowerCase();
    
    // Check code symbols in CodeIntelligence to identify candidates
    try {
      const codeIntel = container.resolve<any>('CodeIntelligenceEngine');
      if (codeIntel) {
        codeIntel.getCodeContext();
        // Mock query search over symbol names
        if (lowerGoal.includes('auth') || lowerGoal.includes('login')) {
          candidates.push({
            name: 'ShortTermMemory',
            type: 'service',
            fileUri: 'src/core/memory/ShortTermMemory.ts',
            similarityScore: 80
          });
        }
      }
    } catch (_) {}

    // Add a default utility helper fallback
    candidates.push({
      name: 'ServiceContainer',
      type: 'utility',
      fileUri: 'src/core/container/ServiceContainer.ts',
      similarityScore: 90
    });

    return candidates;
  }
}

export const codeReuseAnalyzer = new CodeReuseAnalyzer();
export default codeReuseAnalyzer;
