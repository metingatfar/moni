export interface ClassRelationship {
  className: string;
  extendsFrom?: string;
  implementsInterfaces?: string[];
}

export class ClassHierarchyAnalyzer {
  private classes: ClassRelationship[] = [
    {
      className: 'ExecutiveBrain',
      implementsInterfaces: []
    },
    {
      className: 'ShortTermMemory',
      implementsInterfaces: ['MemoryStorage']
    },
    {
      className: 'LongTermMemory',
      implementsInterfaces: ['MemoryStorage']
    }
  ];

  public analyzeClassHierarchy(): ClassRelationship[] {
    return [...this.classes];
  }

  public getClassRelationship(className: string): ClassRelationship | undefined {
    return this.classes.find(c => c.className === className);
  }

  public getSubclasses(baseClassName: string): string[] {
    return this.classes
      .filter(c => c.extendsFrom === baseClassName)
      .map(c => c.className);
  }
}

export const classHierarchyAnalyzer = new ClassHierarchyAnalyzer();
export default classHierarchyAnalyzer;
