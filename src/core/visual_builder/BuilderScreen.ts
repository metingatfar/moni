import type { BuilderComponent } from './BuilderComponent';

export interface ScreenInteraction {
  triggerEvent: string; // e.g. 'onClick'
  sourceComponentId: string;
  action: 'navigate' | 'openModal' | 'closeModal' | 'submitForm' | 'toggleDrawer';
  targetRoute?: string;
  targetComponentId?: string;
}

export interface BuilderScreen {
  screenId: string;
  name: string;
  route: string;
  viewport: { width: number; height: number };
  layoutMode: 'flex' | 'grid' | 'absolute';
  components: BuilderComponent[];
  interactions: ScreenInteraction[];
  metadata: Record<string, any>;
}
