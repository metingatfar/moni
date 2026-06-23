import type { VisionInput } from './VisionInput';

export interface ImageAttributes {
  type: 'document' | 'screenshot' | 'photo' | 'unknown';
  blurriness: 'low' | 'medium' | 'high';
  hasText: boolean;
  predictedSubject: string;
}

export class ImageAnalyzer {
  public analyze(input: VisionInput): ImageAttributes {
    const fileName = input.fileName.toLowerCase();
    const source = input.source;

    let type: ImageAttributes['type'] = 'photo';
    let predictedSubject = 'Genel Fotoğraf';
    let hasText = false;

    if (source === 'screenshot') {
      type = 'screenshot';
      predictedSubject = 'Ekran Görüntüsü';
      hasText = true;
    } else if (
      fileName.includes('pdf') ||
      fileName.includes('doc') ||
      fileName.includes('invoice') ||
      fileName.includes('fatura') ||
      fileName.includes('kimlik') ||
      fileName.includes('kart') ||
      fileName.includes('recete')
    ) {
      type = 'document';
      predictedSubject = 'Evrak / Belge';
      hasText = true;
    } else if (fileName.includes('bitki') || fileName.includes('plant') || fileName.includes('cicek')) {
      predictedSubject = 'Bitki / Doğa';
    } else if (fileName.includes('araba') || fileName.includes('car') || fileName.includes('gosterge') || fileName.includes('vehicle')) {
      predictedSubject = 'Araç / Cihaz Göstergesi';
    }

    return {
      type,
      blurriness: 'low',
      hasText,
      predictedSubject
    };
  }
}
