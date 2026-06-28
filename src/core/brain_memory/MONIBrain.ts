import { ProjectMemory } from './ProjectMemory';
import { DecisionMemory } from './DecisionMemory';
import { EngineeringHistory } from './EngineeringHistory';
import { ContextBuilder } from './ContextBuilder';
import { MemorySearchEngine } from './MemorySearchEngine';
import { KnowledgeGraph } from './KnowledgeGraph';
import { SprintTimeline } from './SprintTimeline';
import { ActiveContextManager } from './ActiveContextManager';
import { BrainReasoningEngine } from './BrainReasoningEngine';
import { BrainMetrics } from './BrainMetrics';

export class MONIBrain {
  private memory = new ProjectMemory();
  private decisions = new DecisionMemory();
  private history = new EngineeringHistory();
  private contextBuilder = new ContextBuilder();
  private searchEngine = new MemorySearchEngine();
  private graph = new KnowledgeGraph();
  private timeline = new SprintTimeline();
  private contextManager = new ActiveContextManager();
  private reasoning = new BrainReasoningEngine();
  private metrics = new BrainMetrics();

  public getMemory() { return this.memory; }
  public getDecisions() { return this.decisions; }
  public getHistory() { return this.history; }
  public getContextBuilder() { return this.contextBuilder; }
  public getSearchEngine() { return this.searchEngine; }
  public getGraph() { return this.graph; }
  public getTimeline() { return this.timeline; }
  public getContextManager() { return this.contextManager; }
  public getReasoning() { return this.reasoning; }
  public getMetrics() { return this.metrics; }

  public async constructContext(userInput: string) {
    const rawContext = this.contextBuilder.constructContextText(
      this.memory,
      this.decisions,
      this.history
    );
    const reasoningResult = this.reasoning.reason(
      userInput,
      this.memory,
      this.graph,
      this.history
    );
    const activeContext = this.contextManager.getActiveContext();

    return {
      rawContext,
      reasoningResult,
      activeContext
    };
  }

  public syncWorkflowMetadata(metadata: any): void {
    this.history.recordMilestone('Sprint 7.0', 'Workflow Engine', `[Workflow Sync] ID: ${metadata.id}, State: ${metadata.state}`, new Date().toISOString().split('T')[0], metadata.healthScore);
    this.decisions.recordDecision('Workflow', `workflow-execution-${metadata.id}`, `Executed workflow step with priority ${metadata.priority}`, 95);
  }

  public syncDecision(selected: any): void {
    this.decisions.recordDecision('Workflow Decision', `workflow-decision-${selected.id}`, selected.selectionJustification, selected.confidenceScore);
  }

  public syncSimulation(workflowId: string, result: any): void {
    this.history.recordMilestone('Sprint 7.0 Addendum', 'Simulation Engine', `Simulation for ${workflowId}: Success Rate ${result.estimatedSuccessRate}%`, new Date().toISOString().split('T')[0], result.estimatedSuccessRate);
  }

  public syncAnalytics(stats: any): void {
    this.history.recordMilestone('Sprint 7.0 Addendum', 'Analytics Engine', `Analytics compiled: Average execution time ${stats.averageExecutionTime}ms`, new Date().toISOString().split('T')[0], Math.round(stats.highestSuccessRate));
  }

  public syncPrediction(workflowId: string, prediction: any): void {
    this.history.recordMilestone('Sprint 7.0 Addendum II', 'Prediction Engine', `Prediction for ${workflowId}: Success ${prediction.successProbability}%, Cost $${prediction.estimatedCost}`, new Date().toISOString().split('T')[0], prediction.successProbability);
    this.decisions.recordDecision('Workflow Prediction', `workflow-predict-${workflowId}`, prediction.explanation, prediction.confidenceScore);
  }

  public syncOptimizationProposal(proposal: any): void {
    this.history.recordMilestone('Sprint 7.0 Addendum II', 'AI Optimizer', `Optimization proposed: saved ${proposal.estimatedTimeSaved}ms (${proposal.estimatedResourceSaved}% resource)`, new Date().toISOString().split('T')[0], proposal.confidence);
    this.decisions.recordDecision('Workflow Optimization Proposal', `workflow-opt-${proposal.id}`, proposal.description, proposal.confidence);
  }

  public syncCostProfile(workflowId: string, profile: any): void {
    this.history.recordMilestone('Sprint 7.0 Addendum II', 'Cost Engine', `Cost Profile for ${workflowId}: Total $${profile.totalCost.toFixed(3)} (AI $${profile.aiModelCost.toFixed(3)})`, new Date().toISOString().split('T')[0], 100);
  }

  public syncAIRecommendation(recommendations: any[]): void {
    const summary = recommendations.map(r => `[${r.source}] ${r.suggestion}`).join('; ');
    this.history.recordMilestone('Sprint 7.0 Addendum II', 'Auto Optimizer', `Auto Recommendations generated: ${recommendations.length} packages`, new Date().toISOString().split('T')[0], 90);
    this.decisions.recordDecision('Workflow Auto Optimization', `workflow-auto-opt-${Date.now()}`, summary, 95);
  }
}

export const moniBrain = new MONIBrain();
export default moniBrain;
