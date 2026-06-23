import type { RoadmapStep } from './ExecutionPlanner';

export class RecoveryPlanner {
  private recoveryPlansCount = 0;

  public generateRecoveryPlan(failedStepId: string, currentSteps: RoadmapStep[]): RoadmapStep[] {
    this.recoveryPlansCount++;
    console.warn(`[RecoveryPlanner] Generating recovery steps for failed step: ${failedStepId}`);

    // Create a copy of roadmap steps
    const newSteps = currentSteps.map(s => ({ ...s }));

    // Find the failed step
    const failedStep = newSteps.find(s => s.id === failedStepId);
    if (failedStep) {
      // Modify target params or switch tool to fallback (e.g. if internet fails, switch to memory query)
      if (failedStep.requiredTool === 'internet') {
        failedStep.requiredTool = 'memory';
        failedStep.objective = `[RECOVERY - Local Fallback] ${failedStep.objective} (İnternet bağlantısı başarısız, yerel hafızadan çağrılıyor)`;
      } else if (failedStep.requiredTool === 'calendar') {
        failedStep.requiredTool = 'reminders';
        failedStep.objective = `[RECOVERY - Reminder Fallback] ${failedStep.objective} (Takvim eklenemedi, basit hatırlatıcı kuruluyor)`;
      } else {
        failedStep.objective = `[RECOVERY] ${failedStep.objective} (Yeniden deneniyor)`;
      }
    }

    return newSteps;
  }

  public getRecoveryPlansCount(): number {
    return this.recoveryPlansCount;
  }
}
export const recoveryPlanner = new RecoveryPlanner();
export default recoveryPlanner;
