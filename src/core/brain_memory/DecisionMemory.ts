export interface DecisionLogEntry {
  id: string;
  category: string;
  decision: string;
  justification: string;
  confidence: number;
  timestamp: number;
}

export class DecisionMemory {
  private decisions: DecisionLogEntry[] = [
    {
      id: 'dec-1',
      category: 'Framework',
      decision: 'Flutter selected',
      justification: 'Enables cross-platform performance with unified widget layout definitions',
      confidence: 85,
      timestamp: Date.now()
    },
    {
      id: 'dec-2',
      category: 'API Backend',
      decision: 'FastAPI selected',
      justification: 'High performance async Python layer with integrated validation structures',
      confidence: 90,
      timestamp: Date.now()
    },
    {
      id: 'dec-3',
      category: 'Database',
      decision: 'PostgreSQL selected',
      justification: 'Robust transactional capabilities and mature integration with ORMs',
      confidence: 95,
      timestamp: Date.now()
    },
    {
      id: 'dec-4',
      category: 'State Management',
      decision: 'Riverpod selected',
      justification: 'Compile-safe dependency injection and robust lifecycle controllers logic',
      confidence: 88,
      timestamp: Date.now()
    }
  ];

  public getDecisions(): DecisionLogEntry[] {
    return this.decisions;
  }

  public recordDecision(category: string, decision: string, justification: string, confidence: number): DecisionLogEntry {
    const entry: DecisionLogEntry = {
      id: 'dec-' + Math.random().toString(36).substr(2, 9),
      category,
      decision,
      justification,
      confidence,
      timestamp: Date.now()
    };
    this.decisions.push(entry);
    return entry;
  }

  public getDecision(id: string): DecisionLogEntry | undefined {
    return this.decisions.find(d => d.id === id);
  }
}

export const decisionMemory = new DecisionMemory();
export default decisionMemory;
