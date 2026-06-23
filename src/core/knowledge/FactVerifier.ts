export interface VerificationResult {
  isVerified: boolean;
  confidenceScore: number; // 0.0 - 1.0
  sourceTrustScore: number; // 0.0 - 1.0
  requiresUserConfirmation: boolean;
  notes: string;
}

export class FactVerifier {
  /**
   * Verify facts based on source and content
   */
  public verifyFact(factContent: string, source: 'user' | 'memory' | 'internet' | 'system'): VerificationResult {
    let sourceTrustScore = 0.5;
    let requiresUserConfirmation = false;
    let notes = '';

    switch (source) {
      case 'user':
        sourceTrustScore = 1.0;
        requiresUserConfirmation = false;
        notes = 'Kullanıcı beyanı; doğrudan güvenilir.';
        break;
      case 'system':
        sourceTrustScore = 0.95;
        requiresUserConfirmation = false;
        notes = 'Sistem iç tespiti veya teşhis verisi.';
        break;
      case 'memory':
        sourceTrustScore = 0.85;
        requiresUserConfirmation = false;
        notes = 'Uzun vadeli hafıza kaydı.';
        break;
      case 'internet':
        sourceTrustScore = 0.65;
        requiresUserConfirmation = true; // MUST require confirmation for internet source
        notes = 'İnternet kaynaklı bilgi. Kaydetmeden önce kullanıcı onayı gereklidir.';
        break;
    }

    // Adjust trust if information looks suspicious or empty
    let confidenceScore = sourceTrustScore;
    if (!factContent || factContent.trim().length < 5) {
      confidenceScore *= 0.5;
      notes += ' İçerik yetersiz veya çok kısa.';
    }

    return {
      isVerified: confidenceScore >= 0.5,
      confidenceScore,
      sourceTrustScore,
      requiresUserConfirmation,
      notes
    };
  }
}
