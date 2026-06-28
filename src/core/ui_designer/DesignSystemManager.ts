export interface SpacingTokens {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

export interface RadiusTokens {
  sm: string;
  md: string;
  lg: string;
  full: string;
}

export interface ElevationTokens {
  low: string;
  medium: string;
  high: string;
}

export interface DesignSystem {
  name: string;
  spacing: SpacingTokens;
  radius: RadiusTokens;
  elevation: ElevationTokens;
  activeIcons: string[];
}

export class DesignSystemManager {
  public getDesignSystem(brandName: string): DesignSystem {
    return {
      name: `${brandName} Design Tokens`,
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px'
      },
      radius: {
        sm: '4px',
        md: '8px',
        lg: '12px',
        full: '9999px'
      },
      elevation: {
        low: '0 1px 3px rgba(0,0,0,0.12)',
        medium: '0 4px 6px rgba(0,0,0,0.15)',
        high: '0 10px 15px rgba(0,0,0,0.2)'
      },
      activeIcons: ['Home', 'Search', 'Settings', 'User', 'ChevronRight', 'ChevronDown', 'Info', 'Menu', 'Close']
    };
  }
}
