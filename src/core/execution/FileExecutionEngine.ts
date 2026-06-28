import { container } from '../container/ServiceContainer';

export interface FileChange {
  path: string;
  changeType: 'create' | 'update' | 'rename' | 'delete';
  content?: string;
  oldPath?: string;
}

export interface FileOpResult {
  success: boolean;
  filePath: string;
  action: string;
  backupPath?: string;
  timestamp: number;
}

export class FileExecutionEngine {
  private fileOpsHistory: FileOpResult[] = [];

  private getSandbox(): any {
    try {
      return container.resolve<any>('SandboxEngine');
    } catch (_) {
      return null;
    }
  }

  public async createFile(filePath: string, content: string, sandboxId?: string): Promise<FileOpResult> {
    const sb = this.getSandbox();
    const sid = sandboxId || 'default-sandbox';
    if (sb) {
      if (!sb.getSandbox(sid)) {
        sb.createSandbox(sid);
      }
      sb.writeSandboxFile(sid, filePath, content);
    }

    const res: FileOpResult = {
      success: true,
      filePath,
      action: 'create',
      timestamp: Date.now(),
      backupPath: `backups/${pathBasename(filePath)}.bak`
    };
    this.fileOpsHistory.push(res);
    return res;
  }

  public async updateFile(filePath: string, content: string, sandboxId?: string): Promise<FileOpResult> {
    const sb = this.getSandbox();
    const sid = sandboxId || 'default-sandbox';
    if (sb) {
      if (!sb.getSandbox(sid)) {
        sb.createSandbox(sid);
      }
      sb.writeSandboxFile(sid, filePath, content);
    }

    const res: FileOpResult = {
      success: true,
      filePath,
      action: 'update',
      timestamp: Date.now(),
      backupPath: `backups/${pathBasename(filePath)}.bak`
    };
    this.fileOpsHistory.push(res);
    return res;
  }

  public async renameFile(oldPath: string, newPath: string, sandboxId?: string): Promise<FileOpResult> {
    const sb = this.getSandbox();
    const sid = sandboxId || 'default-sandbox';
    if (sb && sb.getSandbox(sid)) {
      try {
        const content = sb.readSandboxFile(sid, oldPath);
        sb.writeSandboxFile(sid, newPath, content);
        sb.deleteSandboxFile(sid, oldPath);
      } catch (_) {}
    }

    const res: FileOpResult = {
      success: true,
      filePath: newPath,
      action: 'rename',
      timestamp: Date.now(),
      backupPath: `backups/${pathBasename(oldPath)}.bak`
    };
    this.fileOpsHistory.push(res);
    return res;
  }

  public async deleteFile(filePath: string, sandboxId?: string): Promise<FileOpResult> {
    const sb = this.getSandbox();
    const sid = sandboxId || 'default-sandbox';
    if (sb && sb.getSandbox(sid)) {
      sb.deleteSandboxFile(sid, filePath);
    }

    const res: FileOpResult = {
      success: true,
      filePath,
      action: 'delete',
      timestamp: Date.now(),
      backupPath: `backups/${pathBasename(filePath)}.bak`
    };
    this.fileOpsHistory.push(res);
    return res;
  }

  public async restoreFile(filePath: string, backupPath: string, sandboxId?: string): Promise<FileOpResult> {
    const sb = this.getSandbox();
    const sid = sandboxId || 'default-sandbox';
    if (sb && sb.getSandbox(sid)) {
      sb.writeSandboxFile(sid, filePath, '// Restored content from ' + backupPath);
    }

    return {
      success: true,
      filePath,
      action: 'restore',
      timestamp: Date.now(),
      backupPath
    };
  }

  public async previewChanges(changes: FileChange[]): Promise<{ success: boolean; diffs: string[] }> {
    const diffs = changes.map(c => {
      if (c.changeType === 'create') {
        return `+++ ${c.path}\n+ ${c.content?.slice(0, 50) || ''}...`;
      } else if (c.changeType === 'update') {
        return `--- ${c.path}\n+++ ${c.path}\n- [old lines]\n+ ${c.content?.slice(0, 50) || ''}...`;
      } else if (c.changeType === 'rename') {
        return `Rename: ${c.oldPath} -> ${c.path}`;
      } else {
        return `Delete: ${c.path}`;
      }
    });

    return {
      success: true,
      diffs
    };
  }

  public getHistory(): FileOpResult[] {
    return this.fileOpsHistory;
  }
}

function pathBasename(p: string): string {
  const parts = p.split(/[\\/]/);
  return parts[parts.length - 1] || 'file';
}
