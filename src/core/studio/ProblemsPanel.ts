export interface ProblemItem {
  id: string;
  filePath: string;
  line: number;
  severity: 'error' | 'warning' | 'info';
  message: string;
  proposal?: string;
}

export class ProblemsPanel {
  private problems: ProblemItem[] = [];

  public addProblem(item: ProblemItem): void {
    this.problems.push(item);
  }

  public getProblems(): ProblemItem[] {
    return this.problems;
  }

  public resolveProblem(id: string): void {
    this.problems = this.problems.filter(p => p.id !== id);
  }

  public clear(): void {
    this.problems = [];
  }
}
