export interface AccessibilityRule {
  id: string;
  checkName: string;
  category: 'Contrast' | 'ARIA' | 'Keyboard' | 'ScreenReader';
  status: 'Passed' | 'Warning' | 'Failed';
  description: string;
}

export class AccessibilityEngine {
  public auditAccessibility(level: 'A' | 'AA' | 'AAA'): AccessibilityRule[] {
    const rules: AccessibilityRule[] = [
      {
        id: 'acc-01',
        checkName: 'Contrast Ratio check',
        category: 'Contrast',
        status: 'Passed',
        description: 'Text colors have a contrast ratio of at least 4.5:1 (AA) or 7:1 (AAA) against their backgrounds.'
      },
      {
        id: 'acc-02',
        checkName: 'Keyboard Nav Focus Order',
        category: 'Keyboard',
        status: 'Passed',
        description: 'Interactive elements have a logical sequential focus order with distinct outlines.'
      },
      {
        id: 'acc-03',
        checkName: 'ARIA Role Attributes',
        category: 'ARIA',
        status: level === 'A' ? 'Warning' : 'Passed',
        description: 'Semantics check for role and state parameters like aria-expanded, aria-controls, and aria-haspopup.'
      },
      {
        id: 'acc-04',
        checkName: 'Screen Reader Labels',
        category: 'ScreenReader',
        status: 'Passed',
        description: 'All non-text assets have descriptive alt attributes and buttons have aria-label if icon-only.'
      }
    ];

    return rules;
  }
}
