export type LogLevel = 'TRACE' | 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL';

export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  message: string;
  context?: string;
}

export class Logger {
  private static instance: Logger;
  private logs: LogEntry[] = [];
  private maxLogs: number = 200;

  private constructor() {}

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  public log(level: LogLevel, message: string, context?: string): void {
    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      message,
      context
    };
    this.logs.push(entry);
    console.log(`[${entry.timestamp.toISOString()}] [${level}]${context ? ` [${context}]` : ''} ${message}`);
    
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
  }

  public trace(message: string, context?: string): void { this.log('TRACE', message, context); }
  public debug(message: string, context?: string): void { this.log('DEBUG', message, context); }
  public info(message: string, context?: string): void { this.log('INFO', message, context); }
  public warn(message: string, context?: string): void { this.log('WARN', message, context); }
  public error(message: string, context?: string): void { this.log('ERROR', message, context); }
  public fatal(message: string, context?: string): void { this.log('FATAL', message, context); }

  public getLogs(): LogEntry[] {
    return this.logs;
  }

  public clearLogs(): void {
    this.logs = [];
  }
}

export const logger = Logger.getInstance();
