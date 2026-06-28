export interface KnowledgeRule {
  id: string;
  category: 'architecture' | 'coding' | 'guidelines' | 'best_practices';
  rule: string;
  description: string;
}

export class SharedKnowledgeBase {
  private rules: KnowledgeRule[] = [
    {
      id: 'arch-1',
      category: 'architecture',
      rule: 'Clean Architecture Decoupling',
      description: 'The domain model layer must not import classes or types from presentation or data layers.'
    },
    {
      id: 'code-1',
      category: 'coding',
      rule: 'ESModules strict imports',
      description: 'Use explicit TS module imports and verify types using verbatimModuleSyntax rule flags.'
    },
    {
      id: 'guide-1',
      category: 'guidelines',
      rule: 'Zero Production Mutations',
      description: 'Workflows must run under Dry-Run constraints without changing database schema rows automatically.'
    },
    {
      id: 'best-1',
      category: 'best_practices',
      rule: 'Constructor injection',
      description: 'Constructors should resolve interface bindings instead of hardcoding service singleton lookups.'
    }
  ];

  public getRules(): KnowledgeRule[] {
    return this.rules;
  }

  public getRulesByCategory(category: KnowledgeRule['category']): KnowledgeRule[] {
    return this.rules.filter(r => r.category === category);
  }

  public addRule(category: KnowledgeRule['category'], rule: string, description: string): KnowledgeRule {
    const newRule: KnowledgeRule = {
      id: `rule-${Math.random().toString(36).substr(2, 9)}`,
      category,
      rule,
      description
    };
    this.rules.push(newRule);
    return newRule;
  }
}
