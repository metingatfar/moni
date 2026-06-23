export class AutomationEngine {
  public registerTrigger(name: string, triggerTime: string, _action: () => void): void {
    console.log(`[AutomationEngine] Scheduled trigger '${name}' for ${triggerTime}`);
    // Future: execute action on time
  }
}
