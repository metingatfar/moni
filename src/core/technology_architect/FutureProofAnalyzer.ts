import type { ProjectRequirements } from './RequirementAnalyzer';

export interface FutureProofAnalysis {
  technologyLifetimeYears: number;
  communityGrowthRate: 'high' | 'stable' | 'declining';
  vendorLockinRisk: 'high' | 'medium' | 'low';
  migrationDifficultyScore: number; // 1-10
  recommendations: string[];
}

export class FutureProofAnalyzer {
  public analyzeFutureProof(requirements: ProjectRequirements, recommendedStack: string[]): FutureProofAnalysis {
    const recs: string[] = [];
    let lifetime = 8;
    let growth: 'high' | 'stable' | 'declining' = 'stable';
    let lockin: 'high' | 'medium' | 'low' = 'low';
    let migrationDiff = 4;

    if (recommendedStack.includes('Supabase') || recommendedStack.includes('Firebase')) {
      lockin = 'medium';
      recs.push('Supabase / Firebase bindings simplify dev but increase provider lock-in. Implement abstract repository interfaces.');
    }

    if (recommendedStack.includes('Python')) {
      growth = 'high';
      recs.push('Python machine learning packages will remain highly active due to AI research expansions.');
    }

    if (requirements.scalabilityNeed === 'high' && !recommendedStack.includes('Flutter')) {
      migrationDiff = 7;
      recs.push('High scalability backend structures require decoupled domain models to avoid distributed refactoring bottlenecks later.');
    }

    return {
      technologyLifetimeYears: lifetime,
      communityGrowthRate: growth,
      vendorLockinRisk: lockin,
      migrationDifficultyScore: migrationDiff,
      recommendations: recs
    };
  }
}
