export interface DesignTokenBinding {
  color?: string;       // Token name: e.g., 'PrimaryColor'
  background?: string;  // Token name: e.g., 'BgBody'
  padding?: string;     // Token name: e.g., 'SpacingMedium'
  margin?: string;      // Token name: e.g., 'SpacingSmall'
  typography?: string;  // Token name: e.g., 'TypographyHeading'
  radius?: string;      // Token name: e.g., 'RadiusMedium'
}

export interface ComponentProperties {
  label?: string;
  placeholder?: string;
  src?: string;
  visibility?: boolean;
  boundTokens: DesignTokenBinding;
}

export interface ComponentConstraints {
  widthMode: 'fixed' | 'fill' | 'hug' | 'responsive';
  heightMode: 'fixed' | 'fill' | 'hug' | 'responsive';
  widthVal?: number;
  heightVal?: number;
  pinnedEdges: string[]; // e.g. ['left', 'top']
}

export interface ComponentEventBinding {
  onClick?: string;
  onSubmit?: string;
  onChange?: string;
  onFocus?: string;
  onBlur?: string;
  onNavigate?: string;
}

export interface ComponentDataBinding {
  targetVariable?: string;
  targetApiUrl?: string;
  targetStateKey?: string;
  targetDbField?: string;
}

export interface BuilderComponent {
  id: string; // Unique permanent ID, e.g. btn_login
  type: 'Button' | 'Input' | 'Card' | 'Text' | 'Image' | 'List' | 'Table' | 'Chart' | 'Form' | 'Modal' | 'Navigation' | 'Sidebar' | 'Tabs' | 'AIWidget' | 'Calendar' | 'FitnessCard';
  x: number;
  y: number;
  properties: ComponentProperties;
  constraints: ComponentConstraints;
  events: ComponentEventBinding;
  dataBinding: ComponentDataBinding;
}
