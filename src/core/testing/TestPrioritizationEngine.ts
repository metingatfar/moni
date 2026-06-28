export type TestPriority = 'Critical' | 'High' | 'Medium' | 'Low';

export interface PrioritizedTest {
  testSuiteName: string;
  priority: TestPriority;
  reason: string;
}

export class TestPrioritizationEngine {
  public classifyPriority(testSuiteName: string, category: string): PrioritizedTest {
    let priority: TestPriority = 'Medium';
    let reason = 'Standard verification coverage.';

    const lowerName = testSuiteName.toLowerCase();
    const lowerCategory = category.toLowerCase();

    if (lowerName.includes('auth') || lowerName.includes('login') || lowerCategory.includes('security')) {
      priority = 'Critical';
      reason = 'Governs application boundary authentication and security controls.';
    } else if (lowerName.includes('api') || lowerName.includes('route') || lowerCategory.includes('integration')) {
      priority = 'High';
      reason = 'Handles critical network and service communication paths.';
    } else if (lowerName.includes('ui') || lowerName.includes('render') || lowerCategory.includes('ui')) {
      priority = 'Medium';
      reason = 'Validates client layout render structures.';
    } else if (lowerName.includes('perf') || lowerCategory.includes('performance')) {
      priority = 'Low';
      reason = 'Measures auxiliary efficiency metrics.';
    }

    return {
      testSuiteName,
      priority,
      reason
    };
  }
}

export const testPrioritizationEngine = new TestPrioritizationEngine();
export default testPrioritizationEngine;
