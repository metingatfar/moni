export interface TaskAssignment {
  agentName: string;
  taskDescription: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Pending' | 'In Progress' | 'Completed';
}

export class AIProjectManager {
  private assignments: TaskAssignment[] = [];

  public createTaskAssignments(blueprint: any): TaskAssignment[] {
    this.assignments = [];

    const apis = blueprint?.apis || [];
    const tables = blueprint?.database?.tables || [];
    const targetPlatform = blueprint?.targetPlatform || 'Web';

    // 1. Architect Task
    this.assignments.push({
      agentName: 'LeadArchitectAgent',
      taskDescription: 'Validate high-level system layers architecture.',
      priority: 'High',
      status: 'Pending'
    });

    // 2. DB Task
    if (tables.length > 0) {
      this.assignments.push({
        agentName: 'DatabaseArchitectAgent',
        taskDescription: `Validate schema for tables: ${tables.join(', ')}`,
        priority: 'High',
        status: 'Pending'
      });
    }

    // 3. Backend Task
    if (apis.length > 0) {
      this.assignments.push({
        agentName: 'BackendDeveloperAgent',
        taskDescription: `Design endpoints routing and check parameters logic.`,
        priority: 'High',
        status: 'Pending'
      });
    }

    // 4. UI Tasks
    if (targetPlatform.toLowerCase().includes('mobile')) {
      this.assignments.push({
        agentName: 'MobileDeveloperAgent',
        taskDescription: 'Plan hybrid screen layouts and viewport adapters.',
        priority: 'High',
        status: 'Pending'
      });
    } else {
      this.assignments.push({
        agentName: 'FrontendDeveloperAgent',
        taskDescription: 'Plan CSS classes components framework alignment.',
        priority: 'High',
        status: 'Pending'
      });
    }

    // 5. Quality Tasks
    this.assignments.push({
      agentName: 'QAEngineerAgent',
      taskDescription: 'Configure unit and integration mock test coverage strategies.',
      priority: 'Medium',
      status: 'Pending'
    });

    this.assignments.push({
      agentName: 'SecurityEngineerAgent',
      taskDescription: 'Scan JWT rules and check static vulnerability vectors.',
      priority: 'High',
      status: 'Pending'
    });

    return this.assignments;
  }

  public getAssignments(): TaskAssignment[] {
    return this.assignments;
  }

  public updateStatus(agentName: string, status: TaskAssignment['status']): void {
    const task = this.assignments.find(a => a.agentName === agentName);
    if (task) {
      task.status = status;
    }
  }
}
