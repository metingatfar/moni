export type ClassifiedFailureType = 
  | 'TypeScript Error'
  | 'Import Error'
  | 'Missing Symbol'
  | 'Test Failure'
  | 'Assertion Failure'
  | 'Runtime Exception'
  | 'Dependency Error'
  | 'Security Warning'
  | 'Performance Regression'
  | 'Architecture Violation'
  | 'Unknown';

export class FailureClassifier {
  public classify(message: string, errorType?: string): ClassifiedFailureType {
    const combined = `${errorType || ''} ${message}`.toLowerCase();
    
    if (combined.includes('ts6133') || combined.includes('ts2304') || combined.includes('cannot find name')) {
      return 'TypeScript Error';
    }
    if (combined.includes('cannot find module') || combined.includes('import')) {
      return 'Import Error';
    }
    if (combined.includes('missing symbol') || combined.includes('not a function')) {
      return 'Missing Symbol';
    }
    if (combined.includes('assertion') || combined.includes('expect')) {
      return 'Assertion Failure';
    }
    if (combined.includes('test') || combined.includes('failed')) {
      return 'Test Failure';
    }
    if (combined.includes('security') || combined.includes('unsafe')) {
      return 'Security Warning';
    }
    if (combined.includes('performance') || combined.includes('timeout')) {
      return 'Performance Regression';
    }
    if (combined.includes('architecture') || combined.includes('layer')) {
      return 'Architecture Violation';
    }
    
    return 'Runtime Exception';
  }
}

export const failureClassifier = new FailureClassifier();
export default failureClassifier;
