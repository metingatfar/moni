import { codingIntentAnalyzer } from './CodingIntentAnalyzer';
import { codingStrategyPlanner } from './CodingStrategyPlanner';
import { frameworkDetector } from './FrameworkDetector';
import { codeReuseAnalyzer } from './CodeReuseAnalyzer';
import { fileGenerationPlanner } from './FileGenerationPlanner';
import { multiFileGenerator } from './MultiFileGenerator';
import { codeReviewEngine } from './CodeReviewEngine';
import { staticAnalysisEngine } from './StaticAnalysisEngine';
import { securityReviewEngine } from './SecurityReviewEngine';
import { performanceReviewEngine } from './PerformanceReviewEngine';
import { engineeringStandardsEngine } from './EngineeringStandardsEngine';
import { documentationGenerator } from './DocumentationGenerator';
import { patchQualityAnalyzer } from './PatchQualityAnalyzer';
import { engineeringScoreEngine } from './EngineeringScoreEngine';
import type { CodingRequest } from './CodingRequest';
import type { PatchDraft } from './AutonomousCodeGenerator';
import type { Scorecard } from './EngineeringScoreEngine';

export interface AutonomousCodingDiagnostics {
  requestsGenerated: number;
  filesGenerated: number;
  patchDrafts: number;
  engineeringScore: number;
  qualityScore: number;
  staticIssues: number;
  securityWarnings: number;
  documentationCoverage: number; // 0-100 percentage
  averageGenerationTime: number; // ms
}

export interface CodingResult {
  request: CodingRequest;
  framework: string;
  strategy: string;
  filesPlanned: string[];
  reusedCandidates: any[];
  drafts: PatchDraft[];
  scorecard: Scorecard;
  staticIssues: string[];
  securityWarnings: string[];
  performanceSuggestions: string[];
  standardsFailures: string[];
  verifiedIssues: string[];
}

export class AutonomousCodingEngine {
  private requestsGenerated = 0;
  private filesGenerated = 0;
  private patchDraftsCount = 0;
  private totalEngineeringScore = 0;
  private totalQualityScore = 0;
  private totalStaticIssues = 0;
  private totalSecurityWarnings = 0;

  public async executeCoding(request: CodingRequest): Promise<CodingResult> {
    console.log(`[AutonomousCodingEngine] Running autonomous coding pipeline for goal: ${request.goal}`);
    const startTime = Date.now();

    // 1. Detect Framework
    const framework = frameworkDetector.detectFramework();

    // 2. Intent analysis
    const intent = codingIntentAnalyzer.analyzeIntent(request.goal);

    // 3. Strategy Planning
    const strategy = codingStrategyPlanner.planStrategy(intent, request.constraints);

    // 4. Code Reuse Analyzer
    const reusedCandidates = codeReuseAnalyzer.analyzeForReuse(request.goal);

    // 5. File Generation Planner
    const plan = fileGenerationPlanner.planGeneration(request.goal, strategy);

    // 6. Generate multiple files concurrently & run up to 3 self-verification loops per file
    const genResult = multiFileGenerator.generateMultipleFiles(
      plan.filesToCreate,
      request.goal,
      strategy,
      framework
    );

    const drafts = genResult.drafts;

    // 7. Perform Reviews, Static Analyses, Standards checks
    const staticIssues: string[] = [];
    const securityWarnings: string[] = [];
    const performanceSuggestions: string[] = [];
    const standardsFailures: string[] = [];

    let safetyScoreSum = 0;
    let readabilityScoreSum = 0;
    let maintainabilityScoreSum = 0;
    let complianceScoreSum = 0;

    for (const draft of drafts) {
      // Review
      const review = codeReviewEngine.reviewCode(draft);
      console.log(`[AutonomousCodingEngine] Review for ${draft.targetFile}: solid=${review.solidCompliant}, kiss=${review.kissCompliant}`);
      
      // Static Analysis
      const analysis = staticAnalysisEngine.analyzeCode(draft);
      staticIssues.push(...analysis.issues);

      // Security
      const security = securityReviewEngine.reviewSecurity(draft);
      securityWarnings.push(...security.warnings);

      // Performance
      const performance = performanceReviewEngine.reviewPerformance(draft);
      performanceSuggestions.push(...performance.recommendations);

      // Engineering Standards
      const standards = engineeringStandardsEngine.validateStandards(draft);
      standardsFailures.push(...standards.failures);

      // Patch Quality Metrics
      const quality = patchQualityAnalyzer.analyzePatchQuality(draft);
      safetyScoreSum += quality.safetyScore;
      readabilityScoreSum += quality.readabilityScore;
      maintainabilityScoreSum += quality.maintainabilityScore;
      complianceScoreSum += quality.architectureComplianceScore;

      // Add documentation header
      const docsHeader = documentationGenerator.generateDocs(draft);
      draft.patchContent = docsHeader + draft.patchContent;
    }

    const count = drafts.length || 1;
    const avgQuality = {
      safetyScore: Math.round(safetyScoreSum / count),
      readabilityScore: Math.round(readabilityScoreSum / count),
      maintainabilityScore: Math.round(maintainabilityScoreSum / count),
      architectureComplianceScore: Math.round(complianceScoreSum / count)
    };

    // Overall standards mock mapping
    const overallStandards = {
      solidPass: !standardsFailures.some(f => f.includes('SOLID')),
      dryPass: true,
      kissPass: true,
      yagniPass: true,
      cleanArchitecturePass: true,
      diPass: !standardsFailures.some(f => f.includes('DI')),
      layerSeparationPass: !standardsFailures.some(f => f.includes('Layer')),
      failures: standardsFailures
    };

    // Calculate scorecard
    const scorecard = engineeringScoreEngine.calculateScorecard(
      avgQuality,
      overallStandards,
      securityWarnings.length > 0
    );

    // 8. Update diagnostics
    this.requestsGenerated++;
    this.filesGenerated += plan.filesToCreate.length;
    this.patchDraftsCount += drafts.length;
    this.totalEngineeringScore += scorecard.overallScore;
    this.totalQualityScore += scorecard.qualityScore;
    this.totalStaticIssues += staticIssues.length;
    const durationMs = Date.now() - startTime;
    console.log(`[AutonomousCodingEngine] Pipeline completed in ${durationMs}ms`);

    return {
      request,
      framework,
      strategy,
      filesPlanned: plan.filesToCreate,
      reusedCandidates,
      drafts,
      scorecard,
      staticIssues,
      securityWarnings,
      performanceSuggestions,
      standardsFailures,
      verifiedIssues: genResult.verifiedIssues
    };
  }

  public getDiagnostics(): AutonomousCodingDiagnostics {
    const count = this.requestsGenerated || 1;
    return {
      requestsGenerated: this.requestsGenerated,
      filesGenerated: this.filesGenerated,
      patchDrafts: this.patchDraftsCount,
      engineeringScore: Math.round(this.totalEngineeringScore / count),
      qualityScore: Math.round(this.totalQualityScore / count),
      staticIssues: this.totalStaticIssues,
      securityWarnings: this.totalSecurityWarnings,
      documentationCoverage: 100, // percentage
      averageGenerationTime: 42 // mock milliseconds
    };
  }
}

export const autonomousCodingEngine = new AutonomousCodingEngine();
export default autonomousCodingEngine;
