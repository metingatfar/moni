import { OCRPipeline } from './OCRPipeline';
import { ImageAnalyzer } from './ImageAnalyzer';
import { DocumentVision } from './DocumentVision';
import { ObjectVision } from './ObjectVision';
import { VisionPrivacyGuard } from './VisionPrivacyGuard';
import { VisionContextBuilder } from './VisionContextBuilder';
import type { VisionInput } from './VisionInput';
import type { VisionResult } from './VisionResult';
import type { VisionContext } from './VisionContextBuilder';

export class VisionEngine {
  private ocr = new OCRPipeline();
  private analyzer = new ImageAnalyzer();
  private docVision = new DocumentVision();
  private objVision = new ObjectVision();
  private privacy = new VisionPrivacyGuard();
  private contextBuilder = new VisionContextBuilder();

  // Diagnostics counters
  private ocrRuns = 0;
  private documentsAnalyzed = 0;
  private objectsDetected = 0;
  private privacyWarningsCount = 0;
  private cloudAnalysisRequests = 0;
  private lastVisionSummary = 'Hiçbir görsel analiz edilmedi.';
  private lastImageType = 'Yok';
  private totalVisionTimeMs = 0;
  private totalRuns = 0;

  /**
   * Main entry point to analyze any incoming visual input
   */
  public async analyzeImage(input: VisionInput): Promise<VisionResult> {
    const start = Date.now();
    this.totalRuns++;
    this.lastImageType = input.source;

    // 1. Analyze general attributes
    const attributes = this.analyzer.analyze(input);

    // 2. Extract OCR Text locally
    let extractedText = '';
    if (attributes.hasText) {
      this.ocrRuns++;
      extractedText = this.ocr.extractText(input);
    }

    // 3. Classify document properties
    const docClass = this.docVision.classify(input);
    if (docClass.documentType !== 'none') {
      this.documentsAnalyzed++;
    }

    // 4. Classify object properties
    const objClass = this.objVision.classify(input);
    if (objClass.detectedObjects.length > 0) {
      this.objectsDetected += objClass.detectedObjects.length;
    }

    // 5. Enforce privacy and safety guard checks
    const privacyCheck = this.privacy.checkPrivacy(input, extractedText);
    if (privacyCheck.isSensitive) {
      this.privacyWarningsCount += privacyCheck.warnings.length;
    }
    if (privacyCheck.requiresCloudAnalysis) {
      this.cloudAnalysisRequests++;
    }

    // 6. Assemble the VisionResult output
    const result: VisionResult = {
      inputId: input.id,
      detectedObjects: objClass.detectedObjects,
      extractedText,
      documentType: docClass.documentType,
      confidence: docClass.documentType !== 'none' ? docClass.readability : 0.90,
      summary: docClass.documentType !== 'none' ? docClass.summary : objClass.summary,
      riskFlags: privacyCheck.warnings,
      suggestedActions: docClass.isOcrRecommended ? ['run_ocr'] : [],
      requiresCloudAnalysis: privacyCheck.requiresCloudAnalysis,
      requiresUserConfirmation: privacyCheck.requiresUserConfirmation
    };

    if (result.documentType === 'id_card' || result.documentType === 'passport') {
      result.suggestedActions.push('update_personal_identity');
    }

    this.lastVisionSummary = result.summary;
    this.totalVisionTimeMs += (Date.now() - start);

    return result;
  }

  /**
   * Direct document analysis helper
   */
  public async analyzeDocument(input: VisionInput): Promise<VisionResult> {
    return this.analyzeImage(input);
  }

  /**
   * Direct OCR helper
   */
  public extractText(input: VisionInput): string {
    this.ocrRuns++;
    return this.ocr.extractText(input);
  }

  /**
   * Direct classification helper
   */
  public classifyVisual(input: VisionInput): { docType: string; objects: string[] } {
    const docClass = this.docVision.classify(input);
    const objClass = this.objVision.classify(input);
    return {
      docType: docClass.documentType,
      objects: objClass.detectedObjects
    };
  }

  /**
   * Format results into engine contexts
   */
  public buildVisionContext(input: VisionInput, result: VisionResult): VisionContext {
    return this.contextBuilder.build(input, result);
  }

  /**
   * Get diagnostics for MONI's dashboard
   */
  public getDiagnostics() {
    const avgTime = this.totalRuns > 0 ? Math.round(this.totalVisionTimeMs / this.totalRuns) : 0;
    return {
      visionStatus: 'Active',
      lastImageType: this.lastImageType,
      ocrRuns: this.ocrRuns,
      documentsAnalyzed: this.documentsAnalyzed,
      objectsDetected: this.objectsDetected,
      privacyWarnings: this.privacyWarningsCount,
      cloudAnalysisRequests: this.cloudAnalysisRequests,
      avgVisionTime: avgTime,
      lastVisionSummary: this.lastVisionSummary
    };
  }
}

export const visionEngine = new VisionEngine();
export default visionEngine;
