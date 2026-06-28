import { StateManager } from './StateManager';
import { EngineLifecycleManager } from './EngineLifecycleManager';
import { SystemDiagnostics } from './SystemDiagnostics';

export class OperatingSystemKernel {
  private booted: boolean = false;
  private stateManager: StateManager;
  private lifecycleManager: EngineLifecycleManager;
  private diagnostics: SystemDiagnostics;

  constructor(
    stateManager: StateManager,
    lifecycleManager: EngineLifecycleManager,
    diagnostics: SystemDiagnostics
  ) {
    this.stateManager = stateManager;
    this.lifecycleManager = lifecycleManager;
    this.diagnostics = diagnostics;
  }

  public async boot(): Promise<void> {
    console.log('[MONI Kernel] Starting boot sequence...');
    this.stateManager.transitionTo('Busy');

    // Load default lifecycle managers and initialize diagnostic logs
    this.lifecycleManager.resetAllStates();
    this.diagnostics.reset();

    this.booted = true;
    this.stateManager.transitionTo('Idle');
    console.log('[MONI Kernel] Boot sequence completed successfully.');
  }

  public isBooted(): boolean {
    return this.booted;
  }

  public async shutdown(): Promise<void> {
    console.log('[MONI Kernel] Shutting down operating system kernel...');
    this.stateManager.transitionTo('Shutdown');
    this.booted = false;
    console.log('[MONI Kernel] Kernel shutdown complete.');
  }
}
