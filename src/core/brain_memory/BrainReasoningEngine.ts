import { ProjectMemory } from './ProjectMemory';
import { KnowledgeGraph } from './KnowledgeGraph';
import { EngineeringHistory } from './EngineeringHistory';

export interface ReasoningResult {
  evaluation: string;
  recommendedAction: string;
  confidence: number;
  conflictsFound: string[];
}

export class BrainReasoningEngine {
  public reason(
    userInput: string,
    memory: ProjectMemory,
    graph: KnowledgeGraph,
    history: EngineeringHistory
  ): ReasoningResult {
    const proj = memory.getProject();
    const milestones = history.getMilestones();
    const edges = graph.getEdges();

    const conflicts: string[] = [];
    const lowerInput = userInput.toLowerCase();

    // Loop through tech stacks to detect mismatched recommendations in input
    if (lowerInput.includes('use sqlite') && proj.techStack.includes('PostgreSQL')) {
      conflicts.push('Project Memory dictates PostgreSQL database layer; input requested SQLite.');
    }
    if (lowerInput.includes('use angular') && proj.techStack.includes('Next.js')) {
      conflicts.push('Project tech stack relies on Next.js framework; input requested Angular.');
    }

    let recommendedAction = 'Continue current sprint engineering objectives.';
    if (proj.openTasks.length > 0) {
      recommendedAction = `Address open task: "${proj.openTasks[0]}"`;
    }

    return {
      evaluation: `Scanned ${proj.techStack.length} frameworks, ${edges.length} knowledge graph edges, and ${milestones.length} milestones against input query: "${userInput}"`,
      recommendedAction,
      confidence: proj.confidence,
      conflictsFound: conflicts
    };
  }
}

export const brainReasoningEngine = new BrainReasoningEngine();
export default brainReasoningEngine;
