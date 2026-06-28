export type ChangeScope = 'Local' | 'CrossModule' | 'ArchitectureWide' | 'HighRisk';

export class ChangeScopeAnalyzer {
  public determineScope(impactScore: number): ChangeScope {
    if (impactScore > 85) return 'HighRisk';
    if (impactScore > 60) return 'ArchitectureWide';
    if (impactScore > 30) return 'CrossModule';
    return 'Local';
  }
}

export const changeScopeAnalyzer = new ChangeScopeAnalyzer();
export default changeScopeAnalyzer;
