export interface GitOpPlan {
  command: string;
  args: string[];
  safeToRun: boolean;
  dryRunOutput: string;
}

export class GitExecutionEngine {
  public planCommit(message: string): GitOpPlan {
    return {
      command: 'git commit',
      args: ['-m', message],
      safeToRun: true,
      dryRunOutput: `[main ${Math.random().toString(16).substr(2, 7)}] ${message}\n 1 file changed, 1 insertion(+)`
    };
  }

  public planBranch(name: string): GitOpPlan {
    return {
      command: 'git checkout',
      args: ['-b', name],
      safeToRun: true,
      dryRunOutput: `Switched to a new branch '${name}'`
    };
  }

  public planMerge(source: string, target: string): GitOpPlan {
    return {
      command: 'git merge',
      args: [source],
      safeToRun: true,
      dryRunOutput: `Updating branch ${target} with ${source}.. Fast-forward\n src/index.ts | 2 +-`
    };
  }

  public planTag(name: string): GitOpPlan {
    return {
      command: 'git tag',
      args: [name],
      safeToRun: true,
      dryRunOutput: `Created tag '${name}' locally`
    };
  }

  public planRevert(commitHash: string): GitOpPlan {
    return {
      command: 'git revert',
      args: [commitHash],
      safeToRun: true,
      dryRunOutput: `[main ${Math.random().toString(16).substr(2, 7)}] Revert "${commitHash}"`
    };
  }
}
