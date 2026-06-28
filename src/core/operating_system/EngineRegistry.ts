export interface EngineMetadata {
  name: string;
  serviceKey: string;
  dependencies: string[];
  priority: number; // Higher is run earlier/has precedence
  health: 'healthy' | 'warning' | 'degraded' | 'critical';
  latencyMs: number;
}

export class EngineRegistry {
  private engines: Map<string, EngineMetadata> = new Map();

  constructor() {
    this.initializeDefaultRegistry();
  }

  private initializeDefaultRegistry(): void {
    const defaults: EngineMetadata[] = [
      { name: 'MONIBrain', serviceKey: 'MONIBrain', dependencies: [], priority: 100, health: 'healthy', latencyMs: 2 },
      { name: 'TechnologyArchitect', serviceKey: 'TechnologyArchitect', dependencies: [], priority: 90, health: 'healthy', latencyMs: 5 },
      { name: 'UniversalCodeGenerationEngine', serviceKey: 'UniversalCodeGenerationEngine', dependencies: ['TechnologyArchitect'], priority: 80, health: 'healthy', latencyMs: 12 },
      { name: 'VisualBuilderEngine', serviceKey: 'VisualBuilderEngine', dependencies: [], priority: 70, health: 'healthy', latencyMs: 4 },
      { name: 'VisualDesignerStudio', serviceKey: 'VisualDesignerStudio', dependencies: [], priority: 65, health: 'healthy', latencyMs: 3 },
      { name: 'AutonomousCodingEngine', serviceKey: 'AutonomousCodingEngine', dependencies: ['UniversalCodeGenerationEngine'], priority: 60, health: 'healthy', latencyMs: 25 },
      { name: 'AutonomousTestingEngine', serviceKey: 'AutonomousTestingEngine', dependencies: ['AutonomousCodingEngine'], priority: 50, health: 'healthy', latencyMs: 30 },
      { name: 'SelfHealingAgent', serviceKey: 'SelfHealingAgent', dependencies: ['AutonomousTestingEngine'], priority: 40, health: 'healthy', latencyMs: 15 },
      { name: 'MultiAgentCollaborationEngine', serviceKey: 'MultiAgentCollaborationEngine', dependencies: [], priority: 30, health: 'healthy', latencyMs: 8 },
      { name: 'ExperienceEngine', serviceKey: 'ExperienceEngine', dependencies: [], priority: 20, health: 'healthy', latencyMs: 2 },
      { name: 'ResourceManager', serviceKey: 'ResourceManager', dependencies: [], priority: 10, health: 'healthy', latencyMs: 1 }
    ];

    for (const meta of defaults) {
      this.engines.set(meta.name, meta);
    }
  }

  public register(meta: EngineMetadata): void {
    this.engines.set(meta.name, meta);
  }

  public get(name: string): EngineMetadata | undefined {
    return this.engines.get(name);
  }

  public getAll(): EngineMetadata[] {
    return Array.from(this.engines.values());
  }

  public getOrdered(): EngineMetadata[] {
    return this.getAll().sort((a, b) => b.priority - a.priority);
  }

  public updateHealth(name: string, health: EngineMetadata['health'], latencyMs?: number): void {
    const meta = this.engines.get(name);
    if (meta) {
      meta.health = health;
      if (latencyMs !== undefined) {
        meta.latencyMs = latencyMs;
      }
    }
  }
}

export const engineRegistryOS = new EngineRegistry();
export default engineRegistryOS;
