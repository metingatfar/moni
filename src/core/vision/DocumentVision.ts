import type { VisionInput } from './VisionInput';

export interface DocumentClassification {
  documentType: 'none' | 'invoice' | 'id_card' | 'passport' | 'medical_report' | 'technical_doc' | 'general_text';
  fieldsDetected: string[];
  readability: number; // 0.0 - 1.0
  isOcrRecommended: boolean;
  summary: string;
}

export class DocumentVision {
  public classify(input: VisionInput): DocumentClassification {
    const fileName = input.fileName.toLowerCase();

    if (fileName.includes('fatura') || fileName.includes('invoice')) {
      return {
        documentType: 'invoice',
        fieldsDetected: ['Fatura No', 'Tarih', 'Toplam Tutar', 'Müşteri'],
        readability: 0.95,
        isOcrRecommended: true,
        summary: 'Fatura veya Ödeme Makbuzu Belgesi.'
      };
    }

    if (fileName.includes('kimlik') || fileName.includes('id_card')) {
      return {
        documentType: 'id_card',
        fieldsDetected: ['TCKN', 'Ad', 'Soyad', 'Doğum Tarihi'],
        readability: 0.92,
        isOcrRecommended: true,
        summary: 'T.C. Kimlik Kartı.'
      };
    }

    if (fileName.includes('pasaport') || fileName.includes('passport')) {
      return {
        documentType: 'passport',
        fieldsDetected: ['Passport No', 'Name', 'Surname', 'Nationality'],
        readability: 0.90,
        isOcrRecommended: true,
        summary: 'Pasaport Kimlik Sayfası.'
      };
    }

    if (fileName.includes('recete') || fileName.includes('prescription') || fileName.includes('medical')) {
      return {
        documentType: 'medical_report',
        fieldsDetected: ['Doktor', 'Hasta Adı', 'Tanı/İlaçlar'],
        readability: 0.85,
        isOcrRecommended: true,
        summary: 'Tıbbi Reçete veya Sağlık Raporu.'
      };
    }

    if (fileName.includes('sartname') || fileName.includes('spec') || fileName.includes('doc')) {
      return {
        documentType: 'technical_doc',
        fieldsDetected: ['Başlık', 'Bölüm', 'İçerik'],
        readability: 0.98,
        isOcrRecommended: true,
        summary: 'Teknik Doküman veya Rapor.'
      };
    }

    // Checking if the input is a screenshot
    if (input.source === 'screenshot') {
      return {
        documentType: 'general_text',
        fieldsDetected: ['Ekran Metni'],
        readability: 0.99,
        isOcrRecommended: true,
        summary: 'Ekran Görüntüsü Metni.'
      };
    }

    return {
      documentType: 'none',
      fieldsDetected: [],
      readability: 0.5,
      isOcrRecommended: false,
      summary: 'Döküman veya resmi evrak tespit edilmedi.'
    };
  }
}
