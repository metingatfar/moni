export interface TestScenario {
  id: string;
  name: string;
  description: string;
  module: string;
  expected: string;
  timeout: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
}
