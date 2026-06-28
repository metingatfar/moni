export interface DeadSymbol {
  symbolName: string;
  filePath: string;
  line: number;
}

export class DeadCodeDetector {
  public findDeadCode(): DeadSymbol[] {
    return [
      {
        symbolName: 'unusedHelperMethod',
        filePath: 'src/core/brain/ExecutiveBrain.ts',
        line: 1102
      }
    ];
  }

  public getDeadCodeCount(): number {
    return 1;
  }
}

export const deadCodeDetector = new DeadCodeDetector();
export default deadCodeDetector;
