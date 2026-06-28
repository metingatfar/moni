import { symbolIndexer } from './SymbolIndexer';
import { callGraphBuilder } from './CallGraphBuilder';
import { classHierarchyAnalyzer } from './ClassHierarchyAnalyzer';
import { complexityAnalyzer } from './ComplexityAnalyzer';
import { duplicateCodeDetector } from './DuplicateCodeDetector';
import { deadCodeDetector } from './DeadCodeDetector';
import { documentationAnalyzer } from './DocumentationAnalyzer';

export interface CodeContext {
  symbolCount: number;
  classCount: number;
  functionCount: number;
  callGraphSize: number;
  complexityScore: number;
  duplicateCount: number;
  deadCodeCount: number;
  documentationCoverage: number;
  lastAnalysisTime: string;
  cacheStatus: string;
}

export class CodeIntelligenceEngine {
  public getCodeContext(): CodeContext {
    const symbolCount = symbolIndexer.getIndexedSymbolsCount();
    const classCount = classHierarchyAnalyzer.analyzeClassHierarchy().length;
    const functionCount = callGraphBuilder.buildCallGraph().length;
    const callGraphSize = callGraphBuilder.getCallGraphSize();
    const complexityScore = complexityAnalyzer.getAverageComplexity();
    const duplicateCount = duplicateCodeDetector.getDuplicateCount();
    const deadCodeCount = deadCodeDetector.getDeadCodeCount();
    const documentationCoverage = documentationAnalyzer.getCoveragePercentage();

    return {
      symbolCount,
      classCount,
      functionCount,
      callGraphSize,
      complexityScore,
      duplicateCount,
      deadCodeCount,
      documentationCoverage,
      lastAnalysisTime: new Date().toISOString(),
      cacheStatus: 'Active'
    };
  }

  public getDiagnostics() {
    return this.getCodeContext();
  }
}

export const codeIntelligenceEngine = new CodeIntelligenceEngine();
export default codeIntelligenceEngine;
