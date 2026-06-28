export interface RepairPatchDraft {
  id: string;
  targetFile: string;
  patchContent: string;
  type: 'create' | 'modify' | 'delete';
  strategyUsed: string;
}

export class RepairPatchPlanner {
  public planRepairPatch(
    file: string,
    line: number,
    strategy: string,
    symbol: string
  ): RepairPatchDraft {
    const patchId = `patch-heal-${Date.now()}`;
    let patchContent = `// Self-Healed Content for ${file} resolving ${symbol}\n`;

    if (strategy === 'Import Repair') {
      patchContent += `import { ${symbol || 'container'} } from '../container/ServiceContainer';\n`;
    } else if (strategy === 'Minimal Fix') {
      patchContent += `const _${symbol || 'unusedLocal'} = 42; // Self-corrected unused declaration\n`;
    } else {
      patchContent += `// Applied minimal fallback correction on line ${line}\n`;
    }

    return {
      id: patchId,
      targetFile: file,
      patchContent,
      type: 'modify',
      strategyUsed: strategy
    };
  }
}

export const repairPatchPlanner = new RepairPatchPlanner();
export default repairPatchPlanner;
