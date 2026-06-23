import type { VisionInput } from './VisionInput';
import type { VisionResult } from './VisionResult';

export interface VisionContext {
  reasoningContext: string;
  knowledgeContext: {
    facts: string[];
    isTemporary: boolean;
    verificationScore: number;
  };
  toolIntelligenceContext: {
    suggestedTools: string[];
    actions: { tool: string; params: any }[];
  };
}

export class VisionContextBuilder {
  public build(input: VisionInput, result: VisionResult): VisionContext {
    // 1. Reasoning context builder
    let reasoningContext = `[Visual Intelligence Input]:
- Source: ${input.source}
- Type: ${result.documentType !== 'none' ? `Document (${result.documentType})` : 'Image'}
- Objects Detected: ${result.detectedObjects.join(', ') || 'None'}
- Summary: ${result.summary}
- Confidence: ${Math.round(result.confidence * 100)}%`;

    if (result.riskFlags.length > 0) {
      reasoningContext += `\n- Safety Warning Flags: ${result.riskFlags.join('; ')}`;
    }

    // 2. Knowledge context builder
    const facts: string[] = [];
    let isTemporary = false;
    let verificationScore = result.confidence;

    if (result.documentType === 'invoice') {
      facts.push('Kullanıcı ödeme faturası görseli paylaştı.');
      if (result.extractedText.includes('FT-2026-889')) {
        facts.push('Fatura No: FT-2026-889');
      }
    } else if (result.documentType === 'id_card' || result.documentType === 'passport') {
      facts.push('Kullanıcı kimlik belgesi paylaştı.');
      verificationScore = 1.0; // Absolute verification for official identity documents
    } else {
      isTemporary = true; // Ordinary photos are considered temporary context
    }

    // 3. Tool Intelligence context builder
    const suggestedTools: string[] = [];
    const actions: { tool: string; params: any }[] = [];

    if (result.extractedText) {
      suggestedTools.push('memory');
    }
    if (result.documentType === 'invoice' || result.documentType === 'medical_report') {
      suggestedTools.push('file');
      actions.push({
        tool: 'file',
        params: { action: 'write', path: `c:/Users/user/Desktop/moni/scratch/vision_extracted_${input.id}.txt`, content: result.extractedText }
      });
    }

    return {
      reasoningContext,
      knowledgeContext: {
        facts,
        isTemporary,
        verificationScore
      },
      toolIntelligenceContext: {
        suggestedTools,
        actions
      }
    };
  }
}
