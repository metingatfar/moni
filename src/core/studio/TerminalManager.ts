export interface TerminalLog {
  line: string;
  stream: 'stdout' | 'stderr' | 'system';
  timestamp: string;
}

export class TerminalManager {
  private logs: TerminalLog[] = [];

  public writeLog(line: string, stream: TerminalLog['stream'] = 'stdout'): void {
    this.logs.push({
      line,
      stream,
      timestamp: new Date().toISOString()
    });
  }

  public getLogs(): TerminalLog[] {
    return this.logs;
  }

  public runTask(command: string): void {
    this.writeLog(`$ ${command}`, 'system');
    if (command.includes('build')) {
      this.writeLog('=== Building application bundle ===', 'stdout');
      this.writeLog('✓ Compiled successfully in 140ms', 'stdout');
    } else if (command.includes('test')) {
      this.writeLog('=== Executing test suite ===', 'stdout');
      this.writeLog('✓ All checks passed (100%)', 'stdout');
    } else {
      this.writeLog('Starting dev local server on port 3000...', 'stdout');
    }
  }

  public clear(): void {
    this.logs = [];
  }
}
