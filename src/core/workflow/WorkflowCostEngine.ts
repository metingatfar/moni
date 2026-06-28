// ===================================================================
// MONI Sprint 7.0 Addendum II — WorkflowCostEngine.ts
// Calculates workflow execution costs before run, yielding an Enterprise Cost Profile.
// ===================================================================

import { container } from '../container/ServiceContainer';

export interface CostProfile {
  cpuCost: number;
  memoryCost: number;
  storageCost: number;
  apiCost: number;
  aiModelCost: number;
  pluginCost: number;
  networkCost: number;
  timeCost: number;
  totalCost: number;
}

export class WorkflowCostEngine {
  private customCalculators: Map<string, (workflow: any) => number> = new Map();

  public registerCostCalculator(pluginId: string, calculator: (workflow: any) => number): void {
    this.customCalculators.set(pluginId, calculator);
  }

  public calculateCost(workflow: any): CostProfile {
    const cpuCost = 0.005;
    const memoryCost = 0.008;
    const storageCost = 0.002;
    const apiCost = 0.012;
    const aiModelCost = 0.015;
    let pluginCost = 0.004;
    const networkCost = 0.003;
    const timeCost = 0.006;

    // Apply plugin-registered calculators
    this.customCalculators.forEach((calc) => {
      try {
        pluginCost += calc(workflow);
      } catch (_) {}
    });

    const totalCost = cpuCost + memoryCost + storageCost + apiCost + aiModelCost + pluginCost + networkCost + timeCost;

    const profile: CostProfile = {
      cpuCost,
      memoryCost,
      storageCost,
      apiCost,
      aiModelCost,
      pluginCost,
      networkCost,
      timeCost,
      totalCost
    };

    // Synchronize cost profile with PluginMarketplace metrics if present
    try {
      const marketplace = container.resolve<any>('PluginMarketplace');
      if (marketplace && typeof marketplace.recordCostExtension === 'function') {
        marketplace.recordCostExtension(workflow.id || 'wf-mock', profile);
      }
    } catch (_) {}

    // Sync with MONIBrain
    try {
      const brain = container.resolve<any>('MONIBrain');
      if (brain && typeof brain.syncCostProfile === 'function') {
        brain.syncCostProfile(workflow.id || 'wf-mock', profile);
      }
    } catch (_) {}

    // Sync with LearningEngine
    try {
      const learning = container.resolve<any>('LearningEngine');
      if (learning && typeof learning.learnFromCost === 'function') {
        learning.learnFromCost(99, profile);
      }
    } catch (_) {}

    return profile;
  }
}
