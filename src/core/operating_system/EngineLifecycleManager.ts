export type EngineState =
  | 'Initializing'
  | 'Loading'
  | 'Ready'
  | 'Running'
  | 'Waiting'
  | 'Paused'
  | 'Recovering'
  | 'Completed'
  | 'Failed'
  | 'Disabled';

export class EngineLifecycleManager {
  private states: Map<string, EngineState> = new Map();

  constructor() {
    this.resetAllStates();
  }

  public resetAllStates(): void {
    const defaultEngines = [
      'MONIBrain',
      'TechnologyArchitect',
      'UniversalCodeGenerationEngine',
      'VisualBuilderEngine',
      'VisualDesignerStudio',
      'AutonomousCodingEngine',
      'AutonomousTestingEngine',
      'SelfHealingAgent',
      'MultiAgentCollaborationEngine',
      'ExperienceEngine',
      'ResourceManager'
    ];
    for (const engine of defaultEngines) {
      this.states.set(engine, 'Ready');
    }
  }

  public transitionTo(engine: string, state: EngineState): void {
    this.states.set(engine, state);
  }

  public getStatus(engine: string): EngineState {
    return this.states.get(engine) || 'Disabled';
  }

  public getAllStatuses(): Record<string, EngineState> {
    const res: Record<string, EngineState> = {};
    for (const [key, val] of this.states.entries()) {
      res[key] = val;
    }
    return res;
  }
}

export const engineLifecycleManagerOS = new EngineLifecycleManager();
export default engineLifecycleManagerOS;
