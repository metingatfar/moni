import type { VisionInput } from './VisionInput';

export interface PrivacyCheckResult {
  isSensitive: boolean;
  requiresCloudAnalysis: boolean;
  requiresUserConfirmation: boolean;
  warnings: string[];
}

export class VisionPrivacyGuard {
  public checkPrivacy(input: VisionInput, extractedText: string): PrivacyCheckResult {
    const fileName = input.fileName.toLowerCase();
    const text = extractedText.toLowerCase();
    const warnings: string[] = [];
    let isSensitive = false;

    // Check for ID/Passport indicators
    if (
      fileName.includes('kimlik') ||
      fileName.includes('id_card') ||
      fileName.includes('pasaport') ||
      fileName.includes('passport') ||
      text.includes('t.c. kimlik') ||
      text.includes('tcokn') ||
      text.includes('nationality') ||
      text.includes('passport')
    ) {
      isSensitive = true;
      warnings.push('Kişisel kimlik belgesi tespiti: Görsel TC Kimlik Kartı veya Pasaport içerebilir.');
    }

    // Check for Medical/Prescription indicators
    if (
      fileName.includes('recete') ||
      fileName.includes('prescription') ||
      fileName.includes('saglik') ||
      fileName.includes('medical') ||
      text.includes('reçete') ||
      text.includes('hastane') ||
      text.includes('ilaç')
    ) {
      isSensitive = true;
      warnings.push('Sağlık evrakı tespiti: Görsel tıbbi reçete veya sağlık verileri içerebilir.');
    }

    // Check for private chat or licenses
    if (
      fileName.includes('mesaj') ||
      fileName.includes('chat') ||
      fileName.includes('yazisma') ||
      fileName.includes('plaka') ||
      fileName.includes('ehliyet') ||
      text.includes('ehliyet') ||
      text.includes('plaka')
    ) {
      isSensitive = true;
      warnings.push('Özel yazışma, ehliyet veya plaka bilgisi tespiti.');
    }

    // Checking if face is detected (mock condition based on filename)
    if (fileName.includes('yuz') || fileName.includes('face') || fileName.includes('selfie') || fileName.includes('profil')) {
      isSensitive = true;
      warnings.push('Yüz görüntüsü tespiti.');
    }

    // If it is sensitive, or contains privacy risks, it requires user confirmation for cloud analysis
    const requiresCloudAnalysis = isSensitive;
    const requiresUserConfirmation = isSensitive;

    return {
      isSensitive,
      requiresCloudAnalysis,
      requiresUserConfirmation,
      warnings
    };
  }
}
