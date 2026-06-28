export interface UIDesignRequest {
  id: string;
  screenType: string;
  platform: 'desktop' | 'mobile' | 'tablet' | 'responsive' | 'foldable';
  targetUsers: string[];
  branding: {
    primaryColor?: string;
    logoUrl?: string;
    styleMode: 'flat' | 'skeuomorphic' | 'glassmorphism' | 'neo-brutalism' | 'minimalist';
  };
  accessibilityLevel: 'A' | 'AA' | 'AAA';
  deviceTargets: string[];
  designConstraints: string[];
  timestamp: string;
}
