export interface InteractionDetail {
  animationType: string;
  durationMs: number;
  easing: string;
  trigger: string;
}

export interface StateDesign {
  loadingStatePlaceholder: string;
  emptyStateGraphic: string;
  errorStateAlert: string;
}

export class InteractionDesigner {
  public planInteractions(): { transitions: InteractionDetail[]; states: StateDesign } {
    return {
      transitions: [
        {
          animationType: 'Slide-in Panel',
          durationMs: 250,
          easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
          trigger: 'Route transition / Side drawer open'
        },
        {
          animationType: 'Fade-in Fade-out',
          durationMs: 150,
          easing: 'ease-in-out',
          trigger: 'Modal overlay backdrop or toast notification fade'
        },
        {
          animationType: 'Micro-scale scaleUp',
          durationMs: 100,
          easing: 'ease-out',
          trigger: 'Button click tap feedback scale(0.97)'
        }
      ],
      states: {
        loadingStatePlaceholder: 'Shimmer skeleton loader cards matching grid dimensions.',
        emptyStateGraphic: 'Minimalist illustration with a clear call-to-action button.',
        errorStateAlert: 'Toast alert banner detailing error recovery options with a Retry button.'
      }
    };
  }
}
