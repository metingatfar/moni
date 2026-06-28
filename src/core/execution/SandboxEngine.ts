export interface SandboxEnvironment {
  sandboxId: string;
  createdAt: number;
  files: Map<string, string>;
  commandHistory: string[];
}

export class SandboxEngine {
  private sandboxes: Map<string, SandboxEnvironment> = new Map();

  public createSandbox(sandboxId: string): SandboxEnvironment {
    const sandbox: SandboxEnvironment = {
      sandboxId,
      createdAt: Date.now(),
      files: new Map(),
      commandHistory: []
    };
    this.sandboxes.set(sandboxId, sandbox);
    return sandbox;
  }

  public getSandbox(sandboxId: string): SandboxEnvironment | undefined {
    return this.sandboxes.get(sandboxId);
  }

  public destroySandbox(sandboxId: string): void {
    this.sandboxes.delete(sandboxId);
  }

  public writeSandboxFile(sandboxId: string, filePath: string, content: string): void {
    const sandbox = this.sandboxes.get(sandboxId);
    if (!sandbox) {
      throw new Error(`Sandbox ${sandboxId} not found`);
    }
    sandbox.files.set(filePath, content);
  }

  public readSandboxFile(sandboxId: string, filePath: string): string {
    const sandbox = this.sandboxes.get(sandboxId);
    if (!sandbox) {
      throw new Error(`Sandbox ${sandboxId} not found`);
    }
    const content = sandbox.files.get(filePath);
    if (content === undefined) {
      throw new Error(`File ${filePath} not found in sandbox`);
    }
    return content;
  }

  public hasSandboxFile(sandboxId: string, filePath: string): boolean {
    const sandbox = this.sandboxes.get(sandboxId);
    return sandbox ? sandbox.files.has(filePath) : false;
  }

  public deleteSandboxFile(sandboxId: string, filePath: string): boolean {
    const sandbox = this.sandboxes.get(sandboxId);
    if (sandbox) {
      return sandbox.files.delete(filePath);
    }
    return false;
  }

  public executeInSandbox(sandboxId: string, cmd: string): Promise<{ success: boolean; output: string; exitCode: number }> {
    const sandbox = this.sandboxes.get(sandboxId);
    if (!sandbox) {
      throw new Error(`Sandbox ${sandboxId} not found`);
    }
    sandbox.commandHistory.push(cmd);

    let output = '';
    let exitCode = 0;
    let success = true;

    if (cmd.startsWith('npm run build') || cmd.startsWith('npm build')) {
      output = 'Build successful. Compiled 24 TypeScript files in 1.4s.';
    } else if (cmd.startsWith('npm install') || cmd.startsWith('npm i')) {
      const parts = cmd.split(' ');
      const pkg = parts[2] || 'dependencies';
      output = `added 1 package, audited 2 packages in 0.8s. installed ${pkg}`;
    } else if (cmd.startsWith('git')) {
      output = `Executed simulated git command: ${cmd}`;
    } else {
      output = `Mock output for command: ${cmd}`;
    }

    return Promise.resolve({
      success,
      output,
      exitCode
    });
  }

  public getDiagnostics() {
    return {
      activeSandboxes: this.sandboxes.size,
      historyLength: Array.from(this.sandboxes.values()).reduce((acc, s) => acc + s.commandHistory.length, 0)
    };
  }
}
