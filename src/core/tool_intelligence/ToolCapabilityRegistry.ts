export interface ToolCapability {
  name: string;
  capabilities: string[];
  supportedIntents: string[];
  requiredPermissions: string[];
  estimatedCost: number; // mock token/API metric
  estimatedLatencyMs: number;
  confirmationRequired: boolean;
}

export class ToolCapabilityRegistry {
  private registry: Map<string, ToolCapability> = new Map();

  constructor() {
    this.initDefaultRegistry();
  }

  private initDefaultRegistry() {
    this.register({
      name: 'calendar',
      capabilities: ['create_event', 'update_event', 'cancel_event'],
      supportedIntents: ['create_event', 'update_event', 'cancel_event'],
      requiredPermissions: ['calendar_write'],
      estimatedCost: 10,
      estimatedLatencyMs: 150,
      confirmationRequired: true
    });

    this.register({
      name: 'reminders',
      capabilities: ['create_reminder', 'recurring_reminder', 'delete_reminder'],
      supportedIntents: ['create_reminder', 'recurring_reminder'],
      requiredPermissions: ['notifications'],
      estimatedCost: 5,
      estimatedLatencyMs: 80,
      confirmationRequired: true
    });

    this.register({
      name: 'workflows',
      capabilities: ['recurring_workflow', 'automation'],
      supportedIntents: ['recurring_workflow', 'automation'],
      requiredPermissions: ['background_tasks'],
      estimatedCost: 15,
      estimatedLatencyMs: 200,
      confirmationRequired: true
    });

    this.register({
      name: 'goals',
      capabilities: ['goal', 'milestone', 'progress'],
      supportedIntents: ['goal', 'milestone', 'progress'],
      requiredPermissions: ['database_write'],
      estimatedCost: 12,
      estimatedLatencyMs: 180,
      confirmationRequired: true
    });

    this.register({
      name: 'memory',
      capabilities: ['save_memory', 'retrieve_memory'],
      supportedIntents: ['save_memory', 'retrieve_memory'],
      requiredPermissions: ['database_write', 'database_read'],
      estimatedCost: 8,
      estimatedLatencyMs: 100,
      confirmationRequired: true
    });

    this.register({
      name: 'internet',
      capabilities: ['research', 'verification', 'latest_information'],
      supportedIntents: ['research', 'verification', 'latest_information'],
      requiredPermissions: ['internet_access'],
      estimatedCost: 50,
      estimatedLatencyMs: 800,
      confirmationRequired: true
    });
  }

  public register(cap: ToolCapability): void {
    this.registry.set(cap.name, cap);
  }

  public getCapability(name: string): ToolCapability | undefined {
    return this.registry.get(name);
  }

  public getAllCapabilities(): ToolCapability[] {
    return Array.from(this.registry.values());
  }

  public findByIntent(intent: string): ToolCapability[] {
    return this.getAllCapabilities().filter(cap => 
      cap.supportedIntents.includes(intent)
    );
  }
}
