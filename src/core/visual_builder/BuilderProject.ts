import type { BuilderScreen } from './BuilderScreen';

export interface BuilderProject {
  projectId: string;
  name: string;
  screens: BuilderScreen[];
  designSystemId: string;
  targetPlatform: 'web' | 'mobile' | 'desktop' | 'universal';
  framework: 'React' | 'Next.js' | 'Flutter' | 'React Native' | 'SwiftUI' | 'Jetpack Compose' | 'Vue' | 'Angular';
  version: string;
  status: 'draft' | 'review' | 'ready';
}
