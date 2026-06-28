import type { AgentProfile } from './AgentProfile';

export class AgentRegistry {
  private registry: Map<string, AgentProfile> = new Map();

  constructor() {
    this.initializeDefaultAgents();
  }

  private initializeDefaultAgents(): void {
    const defaultAgents: AgentProfile[] = [
      {
        agentId: 'project-manager',
        role: 'ProjectManager',
        capabilities: ['Deconstruct requirements', 'Task planning', 'Estimate effort', 'Coordinate roadmap'],
        priority: 'high',
        confidence: 95,
        availability: true,
        lastResult: 'Initialized project manager.'
      },
      {
        agentId: 'developer-agent',
        role: 'Developer',
        capabilities: ['Develop feature manifests', 'Design specifications', 'System integration plans'],
        priority: 'high',
        confidence: 92,
        availability: true,
        lastResult: 'Initialized developer agent.'
      },
      {
        agentId: 'autonomous-coding-agent',
        role: 'Coder',
        capabilities: ['Write code', 'Create patch drafts', 'Refactor code templates', 'Framework detection'],
        priority: 'critical',
        confidence: 90,
        availability: true,
        lastResult: 'Initialized coding agent.'
      },
      {
        agentId: 'autonomous-testing-agent',
        role: 'Tester',
        capabilities: ['Generate tests', 'Run test coverage', 'Prioritize assertions', 'Test optimization'],
        priority: 'high',
        confidence: 88,
        availability: true,
        lastResult: 'Initialized testing agent.'
      },
      {
        agentId: 'self-healing-agent',
        role: 'SelfHealer',
        capabilities: ['Parse build errors', 'Resolve tests failures', 'Dry-run patch generation'],
        priority: 'high',
        confidence: 85,
        availability: true,
        lastResult: 'Initialized self-healing agent.'
      },
      {
        agentId: 'ai-consensus-engine',
        role: 'Reviewer',
        capabilities: ['Verify patch consensus', 'Resolve conflicts', 'Merge multi-agent outputs'],
        priority: 'critical',
        confidence: 96,
        availability: true,
        lastResult: 'Initialized consensus engine.'
      },
      {
        agentId: 'knowledge-base',
        role: 'Knowledge',
        capabilities: ['Search codebase history', 'Reference standard documents', 'Retrieve guidelines'],
        priority: 'medium',
        confidence: 98,
        availability: true,
        lastResult: 'Initialized knowledge base.'
      },
      {
        agentId: 'repository-intelligence',
        role: 'Architect',
        capabilities: ['Scan files', 'Index project structure', 'Detect packages'],
        priority: 'high',
        confidence: 95,
        availability: true,
        lastResult: 'Initialized repository intelligence.'
      },
      {
        agentId: 'code-intelligence',
        role: 'Architect',
        capabilities: ['Build syntax trees', 'Identify code dependencies', 'Static verification'],
        priority: 'high',
        confidence: 94,
        availability: true,
        lastResult: 'Initialized code intelligence.'
      }
    ];

    for (const agent of defaultAgents) {
      this.registerAgent(agent);
    }
  }

  public registerAgent(profile: AgentProfile): void {
    this.registry.set(profile.agentId, profile);
  }

  public getAgent(agentId: string): AgentProfile | undefined {
    return this.registry.get(agentId);
  }

  public getAllAgents(): AgentProfile[] {
    return Array.from(this.registry.values());
  }

  public getAgentsByRole(role: string): AgentProfile[] {
    return this.getAllAgents().filter(agent => agent.role === role);
  }
}

export const agentRegistry = new AgentRegistry();
export default agentRegistry;
