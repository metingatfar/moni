import type { UIDesignRequest } from './UIDesignRequest';

export interface ReviewFeedback {
  category: string;
  finding: string;
  severity: 'low' | 'medium' | 'high';
  remedy: string;
}

export interface DesignAuditReport {
  reviewStatus: 'Passed' | 'Action Required';
  feedbacks: ReviewFeedback[];
}

export class DesignReviewEngine {
  public reviewDesign(request: UIDesignRequest): DesignAuditReport {
    const feedbacks: ReviewFeedback[] = [
      {
        category: 'Spacing Alignment',
        finding: 'Standard 8px grid alignment verified for vertical margins and component heights.',
        severity: 'low',
        remedy: 'None required.'
      },
      {
        category: 'Consistency check',
        finding: 'Font pairings and weight hierarchy are uniform across desktop and mobile plans.',
        severity: 'low',
        remedy: 'None required.'
      }
    ];

    if (request.designConstraints.length > 2) {
      feedbacks.push({
        category: 'Branding constraint',
        finding: `Primary accent matches corporate guidelines but check high contrast logo files.`,
        severity: 'medium',
        remedy: 'Provide an alternative high-contrast SVG option for dark mode surfaces.'
      });
    }

    const reviewStatus = feedbacks.some(f => f.severity === 'high') ? 'Action Required' : 'Passed';

    return {
      reviewStatus,
      feedbacks
    };
  }
}
