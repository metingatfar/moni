import type { AgentTask } from './AgentTask';
import type { AgentProfile } from './AgentProfile';

export interface CollaborationRisk {
  riskType: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
}

export class CollaborationRiskAnalyzer {
  public analyzeRisks(tasks: AgentTask[], agents: AgentProfile[]): CollaborationRisk[] {
    const risks: CollaborationRisk[] = [];

    // 1. Over-complex plan
    if (tasks.length > 5) {
      risks.push({
        riskType: 'Over-complex Plan',
        description: `Plan contains ${tasks.length} tasks, which exceeds recommended collaboration limits.`,
        severity: 'medium'
      });
    }

    // 2. Low-confidence agent check
    const lowConfidenceAgents = agents.filter(a => a.confidence < 87);
    for (const agent of lowConfidenceAgents) {
      risks.push({
        riskType: 'Low-confidence Agent in Loop',
        description: `Agent '${agent.agentId}' is active with confidence ${agent.confidence}% (below 87% benchmark).`,
        severity: 'medium'
      });
    }

    // 3. Circular dependency check
    if (this.hasCircularDependencies(tasks)) {
      risks.push({
        riskType: 'Circular Dependency',
        description: 'Circular task dependency paths detected within collaboration graph.',
        severity: 'high'
      });
    }

    // 4. Security-sensitive action
    const codingTasks = tasks.filter(t => t.title.toLowerCase().includes('code') || t.title.toLowerCase().includes('patch'));
    if (codingTasks.length > 0) {
      risks.push({
        riskType: 'Security-sensitive Action',
        description: 'Plan includes code generation/patching operations requiring strict sandboxing.',
        severity: 'high'
      });
    }

    return risks;
  }

  private hasCircularDependencies(tasks: AgentTask[]): boolean {
    const adj: Map<string, string[]> = new Map();
    for (const t of tasks) {
      adj.set(t.taskId, t.dependencies);
    }

    const visited: Set<string> = new Set();
    const recStack: Set<string> = new Set();

    const isCyclic = (u: string): boolean => {
      if (!visited.has(u)) {
        visited.add(u);
        recStack.add(u);

        const neighbors = adj.get(u) || [];
        for (const neighbor of neighbors) {
          if (!visited.has(neighbor) && isCyclic(neighbor)) {
            return true;
          } else if (recStack.has(neighbor)) {
            return true;
          }
        }
      }
      recStack.delete(u);
      return false;
    };

    for (const t of tasks) {
      if (isCyclic(t.taskId)) {
        return true;
      }
    }

    return false;
  }
}

export const collaborationRiskAnalyzer = new CollaborationRiskAnalyzer();
export default collaborationRiskAnalyzer;
