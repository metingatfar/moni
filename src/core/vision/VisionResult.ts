export interface VisionResult {
  inputId: string;
  detectedObjects: string[];
  extractedText: string;
  documentType: 'none' | 'invoice' | 'id_card' | 'passport' | 'medical_report' | 'screenshot' | 'technical_doc' | 'general_text';
  confidence: number; // 0.0 - 1.0
  summary: string;
  riskFlags: string[];
  suggestedActions: string[];
  requiresCloudAnalysis: boolean;
  requiresUserConfirmation: boolean;
}
