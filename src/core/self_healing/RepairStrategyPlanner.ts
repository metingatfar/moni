export type RepairStrategyType = 
  | 'Minimal Fix'
  | 'Interface Alignment'
  | 'Import Repair'
  | 'Test Update'
  | 'Mock Repair'
  | 'Dependency Correction'
  | 'Refactor Required'
  | 'Rollback Recommended';

export interface RepairStrategy {
  strategy: RepairStrategyType;
  instructions: string[];
  estimatedRisk: 'low' | 'medium' | 'high';
}

export class RepairStrategyPlanner {
  public planStrategy(errorType: string, probableCause: string): RepairStrategy {
    const combined = `${errorType} ${probableCause}`.toLowerCase();

    if (combined.includes('unused') || combined.includes('ts6133')) {
      return {
        strategy: 'Minimal Fix',
        instructions: ['Identify unused local declaration line.', 'Remove assignment or add underscore prefix.'],
        estimatedRisk: 'low'
      };
    }

    if (combined.includes('import') || combined.includes('cannot find name') || combined.includes('ts2304') || combined.includes('missing type') || combined.includes('variable identifier')) {
      return {
        strategy: 'Import Repair',
        instructions: ['Locate missing module/symbol.', 'Verify path or container bootstraps and insert import declaration statement.'],
        estimatedRisk: 'low'
      };
    }

    if (combined.includes('expect') || combined.includes('assert') || combined.includes('test')) {
      return {
        strategy: 'Test Update',
        instructions: ['Verify test assertions logic.', 'Align mock values with changed service contracts.'],
        estimatedRisk: 'medium'
      };
    }

    if (combined.includes('dependency') || combined.includes('module')) {
      return {
        strategy: 'Dependency Correction',
        instructions: ['Scan package.json manifest references.', 'Clean node_modules workspace cache.'],
        estimatedRisk: 'medium'
      };
    }

    return {
      strategy: 'Refactor Required',
      instructions: ['Audit architectural boundaries.', 'Resolve underlying class signature contract drift.'],
      estimatedRisk: 'high'
    };
  }
}

export const repairStrategyPlanner = new RepairStrategyPlanner();
export default repairStrategyPlanner;
