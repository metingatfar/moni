export interface AnimationProperties {
  transition: string;
  transformHover: string;
  opacityActive: number;
}

export class MotionDesignEngine {
  public getMicroInteractions(): Record<string, AnimationProperties> {
    return {
      buttonClick: {
        transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
        transformHover: 'scale(1.02)',
        opacityActive: 0.95
      },
      hoverPulse: {
        transition: 'all 0.2s ease-in-out',
        transformHover: 'scale(1.05)',
        opacityActive: 1.0
      },
      switchSlide: {
        transition: 'transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1), opacity 0.3s ease',
        transformHover: 'none',
        opacityActive: 0.8
      }
    };
  }
}
export const motionDesignEngine = new MotionDesignEngine();
export default motionDesignEngine;
