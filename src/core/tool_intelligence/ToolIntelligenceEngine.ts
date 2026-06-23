import { ToolIntentAnalyzer } from './ToolIntentAnalyzer';
import { MultiToolPlanner } from './MultiToolPlanner';
import { ToolConflictResolver } from './ToolConflictResolver';
import type { ToolExecutionPlan } from './ToolExecutionPlanner';
import { ToolExecutionPlanner } from './ToolExecutionPlanner';
import { internetDecisionEngine } from './InternetDecisionEngine';
import { eventBus } from '../events/EventBus';

export class ToolIntelligenceEngine {
  private intentAnalyzer = new ToolIntentAnalyzer();
  private planner = new MultiToolPlanner();
  private conflictResolver = new ToolConflictResolver();
  private execPlanner = new ToolExecutionPlanner();

  // Selection statistics
  private totalSelections = 0;
  private selectionTimes: number[] = [];
  private confirmationRequestsCount = 0;
  private learningStats: Record<string, { successRate: number; usageCount: number }> = {};

  constructor() {
    // Load some mock starting data for LearningEngine optimization
    this.learningStats = {
      calendar: { successRate: 0.95, usageCount: 12 },
      reminders: { successRate: 0.98, usageCount: 25 },
      workflows: { successRate: 0.90, usageCount: 8 },
      goals: { successRate: 0.92, usageCount: 6 },
      memory: { successRate: 0.96, usageCount: 30 },
      internet: { successRate: 0.85, usageCount: 15 }
    };
  }

  public recordSuccess(toolName: string): void {
    if (!this.learningStats[toolName]) {
      this.learningStats[toolName] = { successRate: 1.0, usageCount: 0 };
    }
    const stat = this.learningStats[toolName];
    stat.usageCount++;
    // asymptotic update towards 1.0
    stat.successRate = stat.successRate * 0.9 + 0.1;
  }

  public recordFailure(toolName: string): void {
    if (!this.learningStats[toolName]) {
      this.learningStats[toolName] = { successRate: 0.5, usageCount: 0 };
    }
    const stat = this.learningStats[toolName];
    stat.usageCount++;
    // asymptotic update towards 0.0
    stat.successRate = stat.successRate * 0.9;
  }

  public async planExecution(input: string): Promise<ToolExecutionPlan> {
    const startTime = Date.now();
    this.totalSelections++;

    // 1. Intent Analysis
    const intent = this.intentAnalyzer.analyze(input);

    // 2. Internet Decision
    const internetDecision = internetDecisionEngine.decide(input);

    // 3. Multi-Tool Planning
    let steps = this.planner.planMultiToolExecution(intent, input);

    // Filter internet if not required by decision engine
    if (!internetDecision.useInternet) {
      steps = steps.filter(s => s.tool !== 'internet');
    } else {
      // Add internet search step if required but not planned
      if (!steps.some(s => s.tool === 'internet') && intent.intent === 'research') {
        steps.push({
          tool: 'internet',
          action: 'search',
          params: { query: input }
        });
      }
    }

    // 4. Resolve conflicts
    steps = this.conflictResolver.resolveConflicts(steps);

    // 5. Tool execution plan structure
    const plan = this.execPlanner.buildExecutionPlan(steps);

    const selectionTime = Date.now() - startTime;
    this.selectionTimes.push(selectionTime);

    if (plan.requiresConfirmation) {
      this.confirmationRequestsCount++;
    }

    eventBus.publish('ToolIntelligencePlanned', {
      input,
      stepsCount: steps.length,
      requiresConfirmation: plan.requiresConfirmation,
      selectionTime
    });

    return plan;
  }

  public getDiagnostics() {
    const avgSelectionTime = this.selectionTimes.length > 0
      ? Math.round(this.selectionTimes.reduce((a, b) => a + b, 0) / this.selectionTimes.length)
      : 12;

    const stats = internetDecisionEngine.getStats();

    // Find most used tool
    let mostUsed = 'None';
    let maxUsage = 0;
    for (const [name, data] of Object.entries(this.learningStats)) {
      if (data.usageCount > maxUsage) {
        maxUsage = data.usageCount;
        mostUsed = name;
      }
    }

    // Calculate avg success rate
    let totalSuccess = 0;
    let count = 0;
    for (const data of Object.values(this.learningStats)) {
      totalSuccess += data.successRate;
      count++;
    }
    const avgSuccess = count > 0 ? Math.round((totalSuccess / count) * 100) : 93;

    return {
      mostUsedTool: mostUsed,
      avgSelectionTimeMs: avgSelectionTime,
      toolAccuracyPercent: avgSuccess,
      toolSuccessRatePercent: avgSuccess,
      multiToolPlansCount: this.totalSelections,
      conflictCount: this.conflictResolver.getConflictCount(),
      avgExecutionCost: 15,
      internetDecisions: stats.internetDecisions,
      localDecisions: stats.localDecisions,
      confirmationRequests: this.confirmationRequestsCount
    };
  }
}
export const toolIntelligenceEngine = new ToolIntelligenceEngine();
export default toolIntelligenceEngine;
