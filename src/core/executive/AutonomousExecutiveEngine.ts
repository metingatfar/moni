import { ExecutiveStateManager } from './ExecutiveStateManager';
import { ExecutiveMonitor } from './ExecutiveMonitor';
import { ExecutivePolicyEngine } from './ExecutivePolicyEngine';
import type { ExecutivePolicy } from './ExecutivePolicyEngine';
import { ExecutivePriorityManager } from './ExecutivePriorityManager';
import { ExecutiveResourceManager } from './ExecutiveResourceManager';
import { ExecutiveDecisionCoordinator } from './ExecutiveDecisionCoordinator';
import { ExecutiveSelfAssessment } from './ExecutiveSelfAssessment';
import { ExecutiveImprovementPlanner } from './ExecutiveImprovementPlanner';
import { ExecutiveTelemetry } from './ExecutiveTelemetry';

export class AutonomousExecutiveEngine {
  public stateManager = new ExecutiveStateManager();
  public monitor = new ExecutiveMonitor();
  public policyEngine = new ExecutivePolicyEngine();
  public priorityManager = new ExecutivePriorityManager();
  public resourceManager = new ExecutiveResourceManager();
  public coordinator = new ExecutiveDecisionCoordinator();
  public assessment = new ExecutiveSelfAssessment();
  public planner = new ExecutiveImprovementPlanner();
  public telemetry = new ExecutiveTelemetry();

  private totalDecisionsCount = 0;

  public async evaluateExecution(userInput: string): Promise<{
    policy: ExecutivePolicy;
    priorities: string[];
    decisionResult: string;
  }> {
    const startTime = Date.now();
    
    // 1. Update request context state
    this.stateManager.updateState({
      activeRequest: userInput,
      userActivity: 'Active'
    });

    // 2. Health check monitoring
    const statuses = this.monitor.checkHealth();
    const activeEnginesCount = statuses.filter(s => s.status === 'Healthy').length;

    // 3. Determine active policy based on rules
    const policy = this.policyEngine.determinePolicy(userInput);

    // 4. Calculate priorities stack
    const priorities = this.priorityManager.getPriorities(policy);

    // 5. Check resource usage (metrics are updated internally)

    // 6. Conflict Resolution coordinator
    const mockDecisions = [
      { engineName: 'PlanningEngine', recommendedAction: 'create_plan', safetyScore: 90, confidence: 0.8 },
      { engineName: 'ToolIntelligenceEngine', recommendedAction: 'execute_tool_directly', safetyScore: 85, confidence: 0.95 }
    ];
    
    // If health policy is active, insert a safety prioritised decision
    if (policy === 'HealthPriority') {
      mockDecisions.push({
        engineName: 'HealthAgent',
        recommendedAction: 'check_user_fatigue',
        safetyScore: 99,
        confidence: 0.98
      });
    }

    const resolved = this.coordinator.resolveConflict(mockDecisions);
    this.totalDecisionsCount += 1;

    // 7. Update State
    this.stateManager.updateState({
      activePlan: policy === 'PlanningPriority' ? 'Sprint Planning Plan' : 'Standard Response Plan',
      activeTool: resolved.recommendedAction
    });

    // 8. Record telemetry
    const duration = Date.now() - startTime;
    this.telemetry.recordExecution(duration, activeEnginesCount);

    return {
      policy,
      priorities,
      decisionResult: resolved.recommendedAction
    };
  }

  public getDiagnostics() {
    const state = this.stateManager.getState();
    const resources = this.resourceManager.getMetrics();
    const assesment = this.assessment.getLastAssessment();
    
    const mockScores = {
      ReasoningEngine: 98,
      PlanningEngine: 88,
      ToolIntelligenceEngine: 84
    };
    const suggestions = this.planner.generateSuggestions(mockScores);

    return {
      activeExecutiveState: state.activeRequest === 'None' ? 'Idle' : 'Analyzing',
      currentPolicy: this.policyEngine.determinePolicy(state.activeRequest),
      activeEngines: 'Reasoning, Knowledge, Planning, ToolIntel, Vision, Learning, Memory',
      enginePriority: this.priorityManager.getPriorities(this.policyEngine.determinePolicy(state.activeRequest)).join(' -> '),
      resourceUsage: `CPU: ${state.cpuEstimate}, RAM: ${resources.ramUsageMs}MB`,
      tokenUsage: `${100000 - resources.tokenRemaining} tokens used`,
      contextUsage: `${resources.contextUsagePercent}%`,
      executiveDecisions: this.totalDecisionsCount,
      selfAssessmentScore: assesment.score,
      improvementSuggestions: suggestions.length,
      executiveHealth: 'Healthy',
      executiveConfidence: Math.round(assesment.score)
    };
  }
}

export const autonomousExecutiveEngine = new AutonomousExecutiveEngine();
export default autonomousExecutiveEngine;
