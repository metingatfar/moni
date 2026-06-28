export interface FileClassification {
  filePath: string;
  classification: 'ReadOnly' | 'Candidate' | 'Critical' | 'HighRisk';
}

export class FileSelectionEngine {
  public selectFiles(_requestText: string): FileClassification[] {
    return [
      { filePath: 'src/core/container/Bootstrap.ts', classification: 'Critical' },
      { filePath: 'src/core/brain/ExecutiveBrain.ts', classification: 'HighRisk' },
      { filePath: 'src/presentation/MoniDashboard.tsx', classification: 'Candidate' }
    ];
  }
}

export const fileSelectionEngine = new FileSelectionEngine();
export default fileSelectionEngine;
