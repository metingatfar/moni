export interface TestResult {
  testName: string;
  module: string;
  status: 'passed' | 'failed' | 'skipped';
  expected: string;
  actual: string;
  durationMs: number;
  error?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
}
