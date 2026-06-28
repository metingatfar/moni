import type { ParsedError } from './ErrorLogParser';

export interface RootCause {
  probableCause: string;
  recommendedAction: string;
  confidenceScore: number; // 0-100
  origin: string;
  dependencyChain: string[];
  affectedModules: string[];
  failurePropagation: string;
}

export class RootCauseAnalyzer {
  public analyze(errors: ParsedError[]): RootCause {
    if (errors.length === 0) {
      return {
        probableCause: 'No parsing errors detected.',
        recommendedAction: 'Verify compilation logs are populated.',
        confidenceScore: 100,
        origin: 'Unknown',
        dependencyChain: [],
        affectedModules: [],
        failurePropagation: 'None'
      };
    }

    const first = errors[0];
    const origin = first.file || 'unknown_module';
    const affectedModules = [origin];
    const dependencyChain = [origin, 'main.ts'];

    if (first.errorCode === 'TS2304') {
      return {
        probableCause: `Missing type or variable identifier: '${first.symbol}' in ${first.file}`,
        recommendedAction: `Declare variable or import missing module/symbol '${first.symbol}' inside ${first.file}`,
        confidenceScore: 95,
        origin,
        dependencyChain,
        affectedModules,
        failurePropagation: `Missing symbol '${first.symbol}' propagates downstream to all imports of ${first.file}`
      };
    }

    if (first.errorCode === 'TS6133') {
      return {
        probableCause: `Unused local variable or declaration: '${first.symbol}' in ${first.file}`,
        recommendedAction: `Prefix with underscore or remove unused variable '${first.symbol}' in ${first.file}`,
        confidenceScore: 98,
        origin,
        dependencyChain,
        affectedModules,
        failurePropagation: 'No propagation; isolated unused identifier.'
      };
    }

    if (first.probableCause && first.probableCause.toLowerCase().includes('cannot find module')) {
      return {
        probableCause: `Missing module dependency or incorrect import file path reference inside ${first.file}`,
        recommendedAction: `Verify imports or run npm install for missing module dependencies.`,
        confidenceScore: 90,
        origin,
        dependencyChain,
        affectedModules,
        failurePropagation: `Missing module breaks compilation for ${first.file} and its entrypoints.`
      };
    }

    return {
      probableCause: first.probableCause || 'Unknown compilation error',
      recommendedAction: 'Inspect stack trace trace logs for target module contract misalignments.',
      confidenceScore: 70,
      origin,
      dependencyChain,
      affectedModules,
      failurePropagation: 'Downstream impacts undetermined; review target module contracts.'
    };
  }
}

export const rootCauseAnalyzer = new RootCauseAnalyzer();
export default rootCauseAnalyzer;
