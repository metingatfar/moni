export class GitCommitGenerator {
  public generateCommitMessage(projectName: string, changesCount: number): string {
    return `feat(${projectName}): autonomous code generation scaffolding\n\n- Generated ${changesCount} source files structure\n- Resolved ast declarations imports\n- Validated syntax conventions`;
  }
}
