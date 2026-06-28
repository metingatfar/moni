export interface DesignProject {
  id: string;
  name: string;
  screens: string[];
  designSystem: string;
  targetPlatform: 'desktop' | 'laptop' | 'tablet' | 'foldable' | 'phone';
  targetFramework: 'React' | 'Flutter' | 'React Native' | 'HTML' | 'Vue' | 'Angular' | 'SwiftUI' | 'Jetpack Compose';
  metadata: Record<string, any>;
  version: string;
}
