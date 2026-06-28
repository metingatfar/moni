import { container } from '../container/ServiceContainer';

export interface ProjResult {
  success: boolean;
  projectName: string;
  templateUsed: string;
  outputPath: string;
  timestamp: number;
}

export interface ModuleResult {
  success: boolean;
  moduleName: string;
  installedVersion: string;
  timestamp: number;
}

export interface DependencyResult {
  success: boolean;
  commandExecuted: string;
  exitCode: number;
  output: string;
}

export class ProjectExecutionEngine {
  private getSandbox(): any {
    try {
      return container.resolve<any>('SandboxEngine');
    } catch (_) {
      return null;
    }
  }

  public async generateProject(name: string, template: string, path: string): Promise<ProjResult> {
    const sb = this.getSandbox();
    if (sb) {
      const sid = 'project-sandbox';
      if (!sb.getSandbox(sid)) {
        sb.createSandbox(sid);
      }
      sb.writeSandboxFile(sid, `${path}/package.json`, JSON.stringify({ name, version: '1.0.0', dependencies: {} }, null, 2));
      sb.writeSandboxFile(sid, `${path}/src/index.ts`, '// Hello ' + name);
    }

    return {
      success: true,
      projectName: name,
      templateUsed: template,
      outputPath: path,
      timestamp: Date.now()
    };
  }

  public async updateProject(path: string, changes: any): Promise<ProjResult> {
    const sb = this.getSandbox();
    if (sb) {
      const sid = 'project-sandbox';
      if (sb.getSandbox(sid)) {
        sb.writeSandboxFile(sid, `${path}/package.json`, JSON.stringify({ name: 'updated-project', version: '1.1.0', dependencies: changes }, null, 2));
      }
    }

    return {
      success: true,
      projectName: 'updated-project',
      templateUsed: 'update',
      outputPath: path,
      timestamp: Date.now()
    };
  }

  public async installModule(moduleName: string, _path: string): Promise<ModuleResult> {
    const sb = this.getSandbox();
    if (sb) {
      const sid = 'project-sandbox';
      if (!sb.getSandbox(sid)) {
        sb.createSandbox(sid);
      }
      await sb.executeInSandbox(sid, `npm install ${moduleName}`);
    }

    return {
      success: true,
      moduleName,
      installedVersion: 'latest',
      timestamp: Date.now()
    };
  }

  public async runDependencyExecution(cmd: string, path: string): Promise<DependencyResult> {
    const sb = this.getSandbox();
    if (sb) {
      const sid = 'project-sandbox';
      if (!sb.getSandbox(sid)) {
        sb.createSandbox(sid);
      }
      const execution = await sb.executeInSandbox(sid, cmd);
      return {
        success: execution.success,
        commandExecuted: cmd,
        exitCode: execution.exitCode,
        output: execution.output
      };
    }

    return {
      success: true,
      commandExecuted: cmd,
      exitCode: 0,
      output: `Mock project command execution of: ${cmd} at ${path}`
    };
  }
}
