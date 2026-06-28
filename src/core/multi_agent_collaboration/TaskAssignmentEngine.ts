import { agentRegistry } from './AgentRegistry';
import type { AgentTask } from './AgentTask';
import type { AgentProfile } from './AgentProfile';

export class TaskAssignmentEngine {
  public assignTask(task: AgentTask): AgentProfile | undefined {
    const agents = agentRegistry.getAllAgents().filter(a => a.availability);
    if (agents.length === 0) return undefined;

    let bestAgent: AgentProfile | undefined = undefined;
    let highestScore = -1;

    for (const agent of agents) {
      let score = 0;

      // 1. Role match
      if (this.isRoleMatch(task, agent)) {
        score += 50;
      }

      // 2. Capability matches
      const matchedCapabilities = agent.capabilities.filter(cap => 
        task.title.toLowerCase().includes(cap.toLowerCase()) || 
        task.description.toLowerCase().includes(cap.toLowerCase())
      );
      score += matchedCapabilities.length * 10;

      // 3. Confidence score additions
      score += agent.confidence * 0.2;

      // 4. Priority alignment
      if (task.priority === agent.priority) {
        score += 10;
      }

      if (score > highestScore) {
        highestScore = score;
        bestAgent = agent;
      }
    }

    if (bestAgent) {
      task.assignedAgent = bestAgent.agentId;
      task.status = 'assigned';
      bestAgent.currentTask = task.taskId;
      bestAgent.availability = false;
    }

    return bestAgent;
  }

  private isRoleMatch(task: AgentTask, agent: AgentProfile): boolean {
    const title = task.title.toLowerCase();
    const desc = task.description.toLowerCase();
    
    if (agent.role === 'ProjectManager' && (title.includes('plan') || title.includes('decompose') || desc.includes('roadmap'))) return true;
    if (agent.role === 'Developer' && (title.includes('developer') || title.includes('manifest') || desc.includes('design'))) return true;
    if (agent.role === 'Coder' && (title.includes('code') || title.includes('patch') || title.includes('coding') || desc.includes('write'))) return true;
    if (agent.role === 'Tester' && (title.includes('test') || title.includes('qa') || desc.includes('assertion'))) return true;
    if (agent.role === 'SelfHealer' && (title.includes('heal') || title.includes('repair') || desc.includes('fix'))) return true;
    if (agent.role === 'Reviewer' && (title.includes('review') || title.includes('consensus') || desc.includes('agree'))) return true;
    if (agent.role === 'Knowledge' && (title.includes('knowledge') || desc.includes('search'))) return true;
    if (agent.role === 'Architect' && (title.includes('architect') || title.includes('dependency') || desc.includes('scan'))) return true;

    return false;
  }
}

export const taskAssignmentEngine = new TaskAssignmentEngine();
export default taskAssignmentEngine;
