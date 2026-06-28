export interface TestRequest {
  requestId: string;
  targetModule: string;
  targetFiles: string[];
  framework: string;
  testScope: 'unit' | 'integration' | 'api' | 'ui' | 'regression' | 'full';
  acceptanceCriteria: string[];
}
