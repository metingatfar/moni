import { OperatingSystemKernel } from './OperatingSystemKernel';
import { EngineRegistry } from './EngineRegistry';
import { EngineLifecycleManager } from './EngineLifecycleManager';
import { container } from '../container/ServiceContainer';
import type { WorkflowPlan } from './WorkflowPlanner';
import { WorkflowPlanner } from './WorkflowPlanner';
import { TaskScheduler } from './TaskScheduler';
import { DependencyResolverOS } from './DependencyResolverOS';
import { ExecutionCoordinator } from './ExecutionCoordinator';
import { ApprovalGateManager } from './ApprovalGateManager';
import { EventBus } from './EventBus';
import { StateManager } from './StateManager';
import { ResourceAllocator } from './ResourceAllocator';
import { HealthMonitor } from './HealthMonitor';
import { RecoveryCoordinator } from './RecoveryCoordinator';
import { SystemDiagnostics } from './SystemDiagnostics';
import { OperatingSystemMetrics } from './OperatingSystemMetrics';
import { OperatingSystemReport } from './OperatingSystemReport';

export class MONIOperatingSystem {
  public kernel: OperatingSystemKernel;
  public registry: EngineRegistry;
  public lifecycle: EngineLifecycleManager;
  public planner: WorkflowPlanner;
  public scheduler: TaskScheduler;
  public dependencyResolver: DependencyResolverOS;
  public coordinator: ExecutionCoordinator;
  public approvals: ApprovalGateManager;
  public eventBus: EventBus;
  public state: StateManager;
  public resources: ResourceAllocator;
  public health: HealthMonitor;
  public recovery: RecoveryCoordinator;
  public diagnostics: SystemDiagnostics;
  public metrics: OperatingSystemMetrics;
  public reporter: OperatingSystemReport;

  constructor(
    kernel: OperatingSystemKernel,
    registry: EngineRegistry,
    lifecycle: EngineLifecycleManager,
    planner: WorkflowPlanner,
    scheduler: TaskScheduler,
    dependencyResolver: DependencyResolverOS,
    coordinator: ExecutionCoordinator,
    approvals: ApprovalGateManager,
    eventBus: EventBus,
    state: StateManager,
    resources: ResourceAllocator,
    health: HealthMonitor,
    recovery: RecoveryCoordinator,
    diagnostics: SystemDiagnostics,
    metrics: OperatingSystemMetrics,
    reporter: OperatingSystemReport
  ) {
    this.kernel = kernel;
    this.registry = registry;
    this.lifecycle = lifecycle;
    this.planner = planner;
    this.scheduler = scheduler;
    this.dependencyResolver = dependencyResolver;
    this.coordinator = coordinator;
    this.approvals = approvals;
    this.eventBus = eventBus;
    this.state = state;
    this.resources = resources;
    this.health = health;
    this.recovery = recovery;
    this.diagnostics = diagnostics;
    this.metrics = metrics;
    this.reporter = reporter;
  }

  public async startWorkflow(userInput: string): Promise<WorkflowPlan> {
    const startTime = Date.now();
    this.state.transitionTo('Busy');
    this.metrics.incrementWorkflows();

    const requestId = `wf-${Date.now()}`;
    this.eventBus.publish('WorkflowStarted', { requestId, input: userInput });

    // Step 1: Create Workflow Plan
    const plan = this.planner.createPlan(requestId, userInput);

    // Step 2: Validate Dependencies
    const validation = this.dependencyResolver.validatePlan(plan, this.registry);
    if (!validation.valid) {
      this.state.transitionTo('Idle');
      this.eventBus.publish('WorkflowFailed', { requestId, errors: validation.errors });
      throw new Error(`Workflow validation failed: ${validation.errors.join('; ')}`);
    }

    // System Integration - Sprint 7.0 Parts 4 & 5
    try {
      const workflowEngine = container.resolve<any>('WorkflowEngine');
      if (workflowEngine) {
        await workflowEngine.submitWorkflow({ id: requestId, name: userInput, parameters: {} });
        await workflowEngine.executeNext();
      }
    } catch (e) {
      console.warn('[MONIOperatingSystem] WorkflowEngine integration delegate failed:', e);
    }

    plan.status = 'executing';

    // Step 3: Schedule tasks
    for (const step of plan.steps) {
      this.scheduler.schedule({
        id: step.id,
        name: `${step.engineName}.${step.actionName}`,
        priority: this.registry.get(step.engineName)?.priority ?? 50,
        dependencies: [],
        run: async () => {
          this.lifecycle.transitionTo(step.engineName, 'Running');
          this.resources.allocate(10000); // Simulate token allocation

          const mockExecute = async () => {
            // Check if there is an approval gate required
            if (step.engineName === 'UniversalCodeGenerationEngine' || step.engineName === 'VisualBuilderEngine') {
              const gate = this.approvals.createGate(step.id, step.engineName, `Apply proposed generation for step ${step.id}`);
              this.metrics.recordApproval();
              this.eventBus.publish('ApprovalGateWaiting', { gateId: gate.id });
              this.state.transitionTo('Waiting');
              // Automatically resolve gate in simulated OS mode
              this.approvals.approve(gate.id);
              this.state.transitionTo('Executing');
            }
            return { stepId: step.id, engine: step.engineName, status: 'mocked_success' };
          };

          try {
            const res = await this.coordinator.coordinateStep(step, mockExecute, this.eventBus);
            this.lifecycle.transitionTo(step.engineName, 'Completed');
            this.diagnostics.recordEngineExecution(step.engineName, 5, true);
            this.resources.deallocate(10000);
            return res;
          } catch (e: any) {
            this.lifecycle.transitionTo(step.engineName, 'Failed');
            this.diagnostics.recordEngineExecution(step.engineName, 5, false);
            this.resources.deallocate(10000);

            // Attempt recovery coordination loop
            this.metrics.recordRecovery();
            this.diagnostics.setRecoveryCount(this.recovery.getRecoverCount());
            return await this.recovery.coordinateRecovery(
              e,
              step.id,
              mockExecute,
              this.coordinator,
              this.eventBus
            );
          }
        }
      });
    }

    // Step 4: Execute scheduled items
    try {
      this.state.transitionTo('Executing');
      await this.scheduler.runAll();
      plan.status = 'completed';

      const duration = Date.now() - startTime;
      this.metrics.recordCompletedWorkflow(duration);
      this.diagnostics.recordWorkflowDuration(requestId, duration);

      this.eventBus.publish('WorkflowCompleted', { requestId, duration });
    } catch (e: any) {
      plan.status = 'failed';
      this.eventBus.publish('WorkflowFailed', { requestId, error: e.message });
    } finally {
      this.state.transitionTo('Idle');
    }

    return plan;
  }
}
