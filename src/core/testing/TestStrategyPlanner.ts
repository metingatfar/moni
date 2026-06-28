export type TestStrategy = 'unit' | 'integration' | 'api' | 'ui' | 'regression' | 'performance' | 'security' | 'smoke' | 'e2e';

export class TestStrategyPlanner {
  public planStrategy(scope: string, targetFiles: string[]): TestStrategy {
    const fileList = targetFiles.map(f => f.toLowerCase());
    
    if (scope === 'api' || fileList.some(f => f.includes('api') || f.includes('route') || f.includes('controller'))) {
      return 'api';
    }
    if (scope === 'ui' || fileList.some(f => f.includes('tsx') || f.includes('jsx') || f.includes('view') || f.includes('component') || f.includes('screen'))) {
      return 'ui';
    }
    if (scope === 'integration') {
      return 'integration';
    }
    if (scope === 'regression') {
      return 'regression';
    }
    
    return 'unit';
  }
}

export const testStrategyPlanner = new TestStrategyPlanner();
export default testStrategyPlanner;
