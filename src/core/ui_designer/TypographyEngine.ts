export interface FontSetting {
  family: string;
  size: string;
  weight: string;
  lineHeight: string;
}

export interface TypographicHierarchy {
  fontFamilyList: string[];
  h1: FontSetting;
  h2: FontSetting;
  h3: FontSetting;
  body: FontSetting;
  caption: FontSetting;
  readabilityRating: 'Excellent' | 'Good' | 'Fair';
}

export class TypographyEngine {
  public planTypography(brandStyle: string): TypographicHierarchy {
    const fonts = (brandStyle === 'minimalist' || brandStyle === 'glassmorphism') ? ['Inter', 'sans-serif'] : ['Outfit', 'Roboto', 'sans-serif'];
    
    return {
      fontFamilyList: fonts,
      h1: { family: fonts[0], size: '2.25rem', weight: '700', lineHeight: '1.2' },
      h2: { family: fonts[0], size: '1.75rem', weight: '600', lineHeight: '1.25' },
      h3: { family: fonts[0], size: '1.25rem', weight: '600', lineHeight: '1.3' },
      body: { family: fonts[0], size: '1rem', weight: '400', lineHeight: '1.5' },
      caption: { family: fonts.length > 1 ? fonts[1] : fonts[0], size: '0.75rem', weight: '400', lineHeight: '1.4' },
      readabilityRating: 'Excellent'
    };
  }
}
