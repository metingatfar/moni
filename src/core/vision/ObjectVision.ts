import type { VisionInput } from './VisionInput';

export interface ObjectClassification {
  detectedObjects: string[];
  candidateClass: 'plant' | 'vehicle' | 'device' | 'sport_equipment' | 'unknown';
  summary: string;
}

export class ObjectVision {
  public classify(input: VisionInput): ObjectClassification {
    const fileName = input.fileName.toLowerCase();

    if (fileName.includes('bitki') || fileName.includes('plant') || fileName.includes('cicek') || fileName.includes('yaprak')) {
      return {
        detectedObjects: ['Yaprak', 'Çiçek', 'Bitki Gövdesi'],
        candidateClass: 'plant',
        summary: 'Doğa/Bitki görseli tespit edildi.'
      };
    }

    if (fileName.includes('araba') || fileName.includes('car') || fileName.includes('vehicle') || fileName.includes('plaka')) {
      return {
        detectedObjects: ['Otomobil', 'Tekerlek', 'Far'],
        candidateClass: 'vehicle',
        summary: 'Araç/Taşıt görseli tespit edildi.'
      };
    }

    if (fileName.includes('gosterge') || fileName.includes('device') || fileName.includes('panel')) {
      return {
        detectedObjects: ['Ekran', 'Kadran', 'Gösterge Paneli'],
        candidateClass: 'device',
        summary: 'Cihaz veya gösterge paneli görseli tespit edildi.'
      };
    }

    if (fileName.includes('badminton') || fileName.includes('raket') || fileName.includes('tuy') || fileName.includes('top') || fileName.includes('hedef')) {
      return {
        detectedObjects: ['Raket', 'Badminton Topu', 'Spor Ekipmanı'],
        candidateClass: 'sport_equipment',
        summary: 'Spor ekipmanı veya badminton malzemesi tespit edildi.'
      };
    }

    return {
      detectedObjects: [],
      candidateClass: 'unknown',
      summary: 'Belirli bir nesne sınıflandırması yapılamadı.'
    };
  }
}
