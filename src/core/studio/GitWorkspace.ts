export interface GitCommit {
  hash: string;
  author: string;
  message: string;
  timestamp: string;
}

export class GitWorkspace {
  private commits: GitCommit[] = [
    { hash: 'a8f3b21', author: 'Moni Studio', message: 'sprint 5.0 visual designer complete', timestamp: new Date().toISOString() }
  ];
  private branch = 'main';
  private stashedChanges: string[] = [];

  public getHistory(): GitCommit[] {
    return this.commits;
  }

  public getActiveBranch(): string {
    return this.branch;
  }

  public createBranch(name: string): void {
    this.branch = name;
  }

  public stashChange(path: string): void {
    this.stashedChanges.push(path);
  }

  public getStash(): string[] {
    return this.stashedChanges;
  }
}
