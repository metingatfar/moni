export interface KnowledgeItem {
  id: string;
  title: string;
  section: 'ADR' | 'SprintHistory' | 'TechDebt' | 'Architecture';
  content: string;
}

export class KnowledgeWorkspace {
  private items: KnowledgeItem[] = [
    { id: 'adr-01', title: 'ADR 01: Service container patterns', section: 'ADR', content: 'Bootstrap all modular services in container registries.' },
    { id: 'sprint-4.9', title: 'Sprint 4.9: AI UI/UX Designer Agent', section: 'SprintHistory', content: 'Autonomous interface design proposals added.' },
    { id: 'tech-01', title: 'Tech Debt list', section: 'TechDebt', content: 'Keep abstractions decoupled between layers.' }
  ];

  public getItems(): KnowledgeItem[] {
    return this.items;
  }

  public registerItem(item: KnowledgeItem): void {
    this.items.push(item);
  }

  public getBySection(section: KnowledgeItem['section']): KnowledgeItem[] {
    return this.items.filter(i => i.section === section);
  }
}
