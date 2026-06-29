export const animations = {
  fade: 'transition: opacity 0.2s ease-in-out;',
  scale: 'transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);',
  hover: {
    transform: 'scale(1.02)',
    boxShadow: '0 0 15px rgba(139, 92, 246, 0.15)',
  },
  orb: {
    keyframesPulse: `
      @keyframes orbPulse {
        0% { transform: scale(1); filter: drop-shadow(0 0 10px rgba(139, 92, 246, 0.4)); }
        50% { transform: scale(1.08); filter: drop-shadow(0 0 25px rgba(139, 92, 246, 0.7)); }
        100% { transform: scale(1); filter: drop-shadow(0 0 10px rgba(139, 92, 246, 0.4)); }
      }
    `,
    keyframesThinking: `
      @keyframes orbThinking {
        0% { transform: rotate(0deg) scale(1); }
        50% { transform: rotate(180deg) scale(1.05); filter: drop-shadow(0 0 20px rgba(6, 182, 212, 0.6)); }
        100% { transform: rotate(360deg) scale(1); }
      }
    `,
    keyframesListening: `
      @keyframes orbListening {
        0% { transform: scale(1); filter: brightness(1); }
        30% { transform: scale(1.12); filter: brightness(1.2) drop-shadow(0 0 30px rgba(16, 186, 129, 0.8)); }
        100% { transform: scale(1); filter: brightness(1); }
      }
    `
  }
};
export default animations;
