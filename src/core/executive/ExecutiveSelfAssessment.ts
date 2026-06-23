export interface AssessmentResult {
  correctDecision: boolean;
  alternativePossible: boolean;
  riskTaken: 'None' | 'Low' | 'Medium' | 'High';
  userSatisfied: boolean;
  score: number; // 0-100
}

export class ExecutiveSelfAssessment {
  private lastAssessment: AssessmentResult = {
    correctDecision: true,
    alternativePossible: false,
    riskTaken: 'None',
    userSatisfied: true,
    score: 100
  };

  public assess(userInput: string, _response: string, userFeedback: 'like' | 'dislike' | 'none'): AssessmentResult {
    const isNegative = userFeedback === 'dislike';
    const isPositive = userFeedback === 'like';
    
    this.lastAssessment = {
      correctDecision: !isNegative,
      alternativePossible: isNegative,
      riskTaken: userInput.toLowerCase().includes('risk') ? 'Low' : 'None',
      userSatisfied: !isNegative,
      score: isNegative ? 60 : (isPositive ? 100 : 95)
    };
    
    return { ...this.lastAssessment };
  }

  public getLastAssessment(): AssessmentResult {
    return { ...this.lastAssessment };
  }
}
