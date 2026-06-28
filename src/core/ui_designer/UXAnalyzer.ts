import type { UIDesignRequest } from './UIDesignRequest';

export interface UXAnalysisResult {
  navigationPattern: string;
  interactionDepth: number;
  complexityIndex: 'Low' | 'Medium' | 'High';
  usabilityScore: number;
  userFlowSteps: string[];
  recommendations: string[];
}

export class UXAnalyzer {
  public analyzeRequest(request: UIDesignRequest): UXAnalysisResult {
    const isMobile = request.platform === 'mobile' || request.platform === 'foldable';
    const navigationPattern = isMobile ? 'Bottom Navigation + Drawer' : 'Sidebar + Header Breadcrumbs';
    const complexityIndex = request.designConstraints.length > 3 ? 'High' : (request.targetUsers.length > 2 ? 'Medium' : 'Low');
    const interactionDepth = complexityIndex === 'High' ? 4 : (complexityIndex === 'Medium' ? 3 : 2);
    
    // Base Usability Score calculation
    let usabilityScore = 85;
    if (request.accessibilityLevel === 'AAA') usabilityScore += 10;
    if (complexityIndex === 'High') usabilityScore -= 8;
    usabilityScore = Math.min(100, Math.max(0, usabilityScore));

    const recommendations: string[] = [
      `Use the '${navigationPattern}' pattern optimized for ${request.platform} screens.`,
      `Keep critical actions at an interaction depth under ${interactionDepth} clicks.`,
      'Implement keyboard shortcuts to support expert workflows.',
      'Ensure standard interactive elements have at least a 44x44px touch target.'
    ];

    const userFlowSteps: string[] = [
      'Enter Application screen',
      'Interact with Main Navigation',
      'Trigger primary call to action',
      'Verify execution response',
      'Return or complete flow'
    ];

    return {
      navigationPattern,
      interactionDepth,
      complexityIndex,
      usabilityScore,
      userFlowSteps,
      recommendations
    };
  }
}
