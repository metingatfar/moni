export type ErrorCategory =
  | 'syntax'
  | 'logic'
  | 'runtime'
  | 'dependency'
  | 'architecture'
  | 'security'
  | 'performance'
  | 'ai_workflow';

export interface ClassifiedError {
  category: ErrorCategory;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export class ErrorClassifier {
  public classify(message: string, stackTrace: string): ClassifiedError {
    const combined = `${message} ${stackTrace}`.toLowerCase();

    if (combined.includes('syntaxerror') || combined.includes('unexpected token')) {
      return { category: 'syntax', description: 'Syntax compilation error or malformed code structure.', severity: 'critical' };
    }
    if (combined.includes('layer violation') || combined.includes('circular dependency') || combined.includes('clean architecture')) {
      return { category: 'architecture', description: 'Architectural layer validation failure.', severity: 'high' };
    }
    if (combined.includes('owasp') || combined.includes('unauthorized') || combined.includes('jwt') || combined.includes('access control')) {
      return { category: 'security', description: 'Security gate validation error or authentication bypass.', severity: 'critical' };
    }
    if (combined.includes('timeout') || combined.includes('memory leak') || combined.includes('slow query') || combined.includes('cpu bottleneck')) {
      return { category: 'performance', description: 'Performance degradation or rendering issue.', severity: 'high' };
    }
    if (combined.includes('cannot find module') || combined.includes('npm install') || combined.includes('missing reference')) {
      return { category: 'dependency', description: 'Missing dependency or library mismatch.', severity: 'high' };
    }
    if (combined.includes('hallucination') || combined.includes('ai response') || combined.includes('plan invalid')) {
      return { category: 'ai_workflow', description: 'AI Reasoning validation failure or plan inconsistency.', severity: 'medium' };
    }
    if (combined.includes('assertion') || combined.includes('test failed') || combined.includes('expected')) {
      return { category: 'logic', description: 'Logical error or assertion violation.', severity: 'medium' };
    }

    return { category: 'runtime', description: 'Runtime execution crash or uncaught exception.', severity: 'high' };
  }
}
