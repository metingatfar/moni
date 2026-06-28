export type OSState =
  | 'Idle'
  | 'Busy'
  | 'Executing'
  | 'Waiting'
  | 'Recovering'
  | 'Maintenance'
  | 'Shutdown';

export class StateManager {
  private currentState: OSState = 'Idle';

  public transitionTo(state: OSState): void {
    console.log(`[OS StateManager] State transitioning from ${this.currentState} to ${state}`);
    this.currentState = state;
  }

  public getState(): OSState {
    return this.currentState;
  }

  public isBusy(): boolean {
    return this.currentState === 'Busy' || this.currentState === 'Executing';
  }
}

export const stateManagerOS = new StateManager();
export default stateManagerOS;
