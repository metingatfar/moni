import type { VisionInput } from './VisionInput';

export class OCRPipeline {
  /**
   * Run local OCR text extraction
   */
  public extractText(input: VisionInput): string {
    const fileName = input.fileName.toLowerCase();
    const source = input.source;

    // Simulate different OCR contents based on filename/source triggers
    if (fileName.includes('fatura') || fileName.includes('invoice')) {
      return 'FATURA NO: FT-2026-889\nTarih: 23.06.2026\nToplam Tutar: 1250.00 TL\nÖdeme Yapan: Metin GATFAR';
    }
    if (fileName.includes('kimlik') || fileName.includes('id_card') || fileName.includes('passport')) {
      return 'T.C. KİMLİK KARTI / REPUBLIC OF TURKEY IDENTITY CARD\nSoyadı: GATFAR\nAdı: Metin\nDoğum Tarihi: 01.01.1985\nTCKN: 12345678901';
    }
    if (fileName.includes('reçete') || fileName.includes('medical') || fileName.includes('saglik')) {
      return 'BOLU DEVLET HASTANESİ REÇETE\nHasta: Metin GATFAR\nİlaç: Parol 500mg, Günde 2 kez';
    }
    if (fileName.includes('sartname') || fileName.includes('spec') || fileName.includes('doc')) {
      return 'MONI AI OS TEKNİK ŞARTNAMESİ\nSprint 3.4 Vision Engine entegrasyonu ve OCR altyapısı kurumu.';
    }
    if (source === 'screenshot') {
      return '[Ekran Görüntüsü İçeriği]: Moni Dashboard aktif. CPU: %12, RAM: 4.2GB, Telemetry tracing ok.';
    }

    return 'Görselden okunan örnek metin: Spor ve teknoloji bir arada çalışıyor.';
  }
}
