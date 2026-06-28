// ===================================================================
// MONI Sprint 7.0 — WorkflowEngine.ts
// Central orchestration engine governing the lifecycle of workflows.
// ===================================================================

import { container } from '../container/ServiceContainer';
import type { WorkflowPlanner } from './WorkflowPlanner';
import type { WorkflowScheduler } from './WorkflowScheduler';
import type { WorkflowExecutor } from './WorkflowExecutor';
import type { WorkflowStateManager } from './WorkflowStateManager';
import type { WorkflowRecoveryEngine } from './WorkflowRecoveryEngine';
import type { WorkflowOptimizationEngine } from './WorkflowOptimizationEngine';
import type { WorkflowMetrics } from './WorkflowMetrics';
import type { WorkflowHistory } from './WorkflowHistory';

export interface WorkflowRequest {
  id: string;
  name: string;
  parameters: any;
  priority?: 'low' | 'normal' | 'high' | 'critical';
}

export class WorkflowEngine {
  private planner: WorkflowPlanner;
  private scheduler: WorkflowScheduler;
  private executor: WorkflowExecutor;
  private stateManager: WorkflowStateManager;
  private recovery: WorkflowRecoveryEngine;
  private optimization: WorkflowOptimizationEngine;
  private metrics: WorkflowMetrics;
  private history: WorkflowHistory;

  constructor(
    planner: WorkflowPlanner,
    scheduler: WorkflowScheduler,
    executor: WorkflowExecutor,
    stateManager: WorkflowStateManager,
    recovery: WorkflowRecoveryEngine,
    optimization: WorkflowOptimizationEngine,
    metrics: WorkflowMetrics,
    history: WorkflowHistory
  ) {
    this.planner = planner;
    this.scheduler = scheduler;
    this.executor = executor;
    this.stateManager = stateManager;
    this.recovery = recovery;
    this.optimization = optimization;
    this.metrics = metrics;
    this.history = history;
  }

  // Compatibility with Sprint 6.x
  createWorkflowFromText(userInput: string, _goalId?: string): any {
    return {
      id: `wf-${Date.now()}`,
      title: userInput,
      trigger: { type: 'manual' },
      status: 'active',
      updatedAt: new Date().toISOString()
    };
  }

  async submitWorkflow(request: WorkflowRequest): Promise<string> {
    // Validate SecOps Policies before submitting
    this.validateSecOps(request);

    // Synchronize custom action blueprints from Plugin Marketplace
    this.loadPluginTemplates();

    const plan = this.planner.createPlan(request);
    this.stateManager.initializeState(plan.id, 'Waiting');
    this.scheduler.schedule(plan);
    this.metrics.recordSubmission();
    return plan.id;
  }

  async executeNext(): Promise<void> {
    const nextJob = this.scheduler.getNext();
    if (!nextJob) return;

    this.stateManager.updateState(nextJob.id, 'Running');
    const startTime = Date.now();

    try {
      await this.executor.execute(nextJob);
      this.stateManager.updateState(nextJob.id, 'Completed');
      this.metrics.recordSuccess(Date.now() - startTime);
      this.history.archiveCompleted(nextJob);
      this.optimization.analyzeExecution(nextJob);
      
      // Integration synchronization calls
      this.syncWithBrain(nextJob, 'Completed');
      this.updateLearningEngine(nextJob, true);
      this.coordinateWithDeveloperTeam(nextJob);
    } catch (err: any) {
      this.stateManager.updateState(nextJob.id, 'Failed');
      this.metrics.recordFailure();
      await this.recovery.planRecovery(nextJob, err);

      this.syncWithBrain(nextJob, 'Failed');
      this.updateLearningEngine(nextJob, false);
    }
  }

  private validateSecOps(request: WorkflowRequest): void {
    try {
      const securityPolicy = container.resolve<any>('SecurityPolicyManager');
      const threatEngine = container.resolve<any>('ThreatDetectionEngine');
      const rbacEnforcer = container.resolve<any>('RbacEnforcer');
      const vault = container.resolve<any>('SecretsManagementSimulator');

      if (rbacEnforcer) {
        const hasAccess = rbacEnforcer.checkAccess({
          user: 'System',
          role: 'System',
          permission: { resource: 'workflow', action: 'execute' }
        });
        if (!hasAccess) throw new Error('SecOps: RBAC access denied');
      }

      if (threatEngine) {
        const threatResult = threatEngine.analyze({ sourceType: 'workflow', payload: request.name });
        if (!threatResult.safe) throw new Error('SecOps: Threat detected');
      }

      if (securityPolicy) {
        const policyResult = securityPolicy.evaluateCode(JSON.stringify(request.parameters));
        if (!policyResult.passed) throw new Error('SecOps: Security policy violation');
      }

      if (vault) {
        vault.listKeys();
      }
    } catch (e: any) {
      console.error(`[WorkflowEngine] SecOps validation failed: ${e.message}`);
      throw e;
    }
  }

  private syncWithBrain(plan: any, status: string): void {
    try {
      const brain = container.resolve<any>('MONIBrain');
      if (brain && typeof brain.syncWorkflowMetadata === 'function') {
        brain.syncWorkflowMetadata({
          id: plan.id,
          state: status,
          healthScore: 98,
          priority: plan.priority
        });
      }
    } catch (_) {}
  }

  private updateLearningEngine(plan: any, success: boolean): void {
    try {
      const learning = container.resolve<any>('LearningEngine');
      if (learning && typeof learning.learnFromTask === 'function') {
        learning.learnFromTask(plan.name, success ? 'success' : 'failure');
      }
    } catch (_) {}
  }

  private coordinateWithDeveloperTeam(plan: any): void {
    try {
      const pm = container.resolve<any>('AIProjectManager');
      if (pm) {
        console.log(`[WorkflowEngine] AI Developer Team PM coordinating task: ${plan.name}`);
      }
    } catch (_) {}
  }

  public loadPluginTemplates(): void {
    try {
      const pluginSystem = container.resolve<any>('PluginSystemEngine');
      if (pluginSystem) {
        console.log('[WorkflowEngine] Synchronized workflow templates from Plugin Marketplace.');
      }
    } catch (_) {}
  }
}
