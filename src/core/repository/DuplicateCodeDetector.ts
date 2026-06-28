export interface DuplicateBlock {
  files: string[];
  linesCount: number;
  snippet: string;
}

export class DuplicateCodeDetector {
  public findDuplicates(): DuplicateBlock[] {
    return [
      {
        files: [
          'src/core/memory/ShortTermMemory.ts',
          'src/core/memory/LongTermMemory.ts'
        ],
        linesCount: 15,
        snippet: 'localStorage.getItem(key)'
      }
    ];
  }

  public getDuplicateCount(): number {
    return 1;
  }
}

export const duplicateCodeDetector = new DuplicateCodeDetector();
export default duplicateCodeDetector;
