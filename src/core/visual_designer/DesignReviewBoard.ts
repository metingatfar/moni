export interface ReviewCriteria {
  usability: number;
  consistency: number;
  accessibility: number;
  responsiveness: number;
  branding: number;
}

export class DesignReviewBoard {
  public evaluateProject(criteria: ReviewCriteria): { overallScore: number; passed: boolean; details: string } {
    const sum = criteria.usability + criteria.consistency + criteria.accessibility + criteria.responsiveness + criteria.branding;
    const overallScore = Math.round(sum / 5);
    const passed = overallScore >= 70;

    return {
      overallScore,
      passed,
      details: passed ? 'Design Project meets enterprise quality criteria.' : 'Quality standards failed. Needs improvement.'
    };
  }
}
