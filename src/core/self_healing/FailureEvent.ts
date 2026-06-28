export interface FailureEvent {
  failureId: string;
  source: 'build' | 'test' | 'runtime' | 'lint' | 'security' | 'performance' | 'validation' | 'sandbox';
  errorType: string;
  message: string;
  stackTrace: string;
  affectedFiles: string[];
  relatedTest?: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}
