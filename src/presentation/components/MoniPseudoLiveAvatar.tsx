import React from 'react';
import '../../styles/moni-pseudo-live-avatar.css';

export interface MoniPseudoLiveAvatarProps {
  status: 'idle' | 'listening' | 'thinking' | 'speaking' | 'error';
  isSpeaking: boolean;
  audioLevel?: number;
  mood?: 'neutral' | 'happy' | 'focused' | 'thinking' | 'alert';
  avatarType?: 'image' | 'svg';
  eyeColor?: string;
  animationsEnabled?: boolean;
  mouthAnimationEnabled?: boolean;
  effectsIntensity?: 'low' | 'medium' | 'high';
}

export const MoniPseudoLiveAvatar: React.FC<MoniPseudoLiveAvatarProps> = ({
  status,
  isSpeaking: _isSpeaking,
  audioLevel: _audioLevel = 0,
  mood: _mood = 'neutral',
  avatarType: _avatarType = 'image',
  eyeColor = 'green-glowing',
  animationsEnabled = true,
  mouthAnimationEnabled = true,
  effectsIntensity = 'medium'
}) => {
  // Resolve image source based on eyeColor
  const getImageSrc = () => {
    switch (eyeColor) {
      case 'blue':
        return '/avatar_woman_blue.png';
      case 'black':
        return '/avatar_woman_black.png';
      case 'purple':
        return '/avatar_woman_purple.png';
      case 'gold':
        return '/avatar_woman_gold.png';
      case 'green':
        return '/avatar_woman.png';
      default:
        return '/avatar_woman_green.png';
    }
  };

  // Determine glow intensity opacity modifiers
  const getGlowOpacity = (baseVal: number) => {
    if (effectsIntensity === 'low') return baseVal * 0.3;
    if (effectsIntensity === 'high') return baseVal * 1.6;
    return baseVal;
  };

  return (
    <div
      className={`moni-pseudo-avatar-container ${status} ${animationsEnabled ? 'animated' : 'paused'}`}
      style={{
        boxShadow: status === 'listening'
          ? `0 0 25px rgba(0, 240, 255, ${getGlowOpacity(0.55)})`
          : status === 'thinking'
            ? `0 0 25px rgba(255, 215, 0, ${getGlowOpacity(0.55)})`
            : status === 'speaking'
              ? `0 0 25px rgba(157, 78, 221, ${getGlowOpacity(0.55)})`
              : status === 'error'
                ? `0 0 35px rgba(255, 56, 56, ${getGlowOpacity(0.75)})`
                : 'none'
      }}
    >
      {/* 1. Base Static Image (fixed, no motion) */}
      <img
        src={getImageSrc()}
        alt="Moni Avatar Base"
        className="moni-pseudo-bg-image"
        style={{
          filter: status === 'error' ? 'grayscale(30%)' : 'none'
        }}
      />

      {/* 2. Cyberneck Light Lines Overlay */}
      {animationsEnabled && <div className="moni-pseudo-neck-light" />}

      {/* 4. Listening Radar Expansion Rings */}
      {status === 'listening' && animationsEnabled && (
        <>
          <div className="moni-pseudo-radar-ring ring-1" style={{ opacity: getGlowOpacity(0.5) }} />
          <div className="moni-pseudo-radar-ring ring-2" style={{ opacity: getGlowOpacity(0.3) }} />
        </>
      )}

      {/* 5. Head Rotating Halo */}
      {status === 'thinking' && animationsEnabled && (
        <div className="moni-pseudo-head-halo" style={{ opacity: getGlowOpacity(0.5) }} />
      )}

      {/* 6. Speaking Holographic Wave Overlay at Mouth Level */}
      {status === 'speaking' && mouthAnimationEnabled && (
        <div
          className="moni-pseudo-mouth-wave"
          style={{
            filter: `drop-shadow(0 0 ${effectsIntensity === 'high' ? '8px' : '4px'} var(--accent-cyan))`
          }}
        >
          <svg width="100%" height="100%" viewBox="0 0 70 24">
            <ellipse
              cx="35"
              cy="12"
              rx="18"
              ry="6"
              fill="none"
              stroke="var(--accent-cyan)"
              strokeWidth="2.5"
              className="moni-pseudo-mouth-ellipse"
            />
            <line
              x1="15"
              y1="12"
              x2="55"
              y2="12"
              stroke="var(--accent-cyan)"
              strokeWidth="2"
              className="moni-pseudo-mouth-line"
            />
          </svg>
        </div>
      )}

      {/* 7. Glow Color Tint overlays */}
      {effectsIntensity !== 'low' && <div className="moni-pseudo-glow-tint" />}

      {/* 8. Speaking Audio Visualizer bars */}
      {status === 'speaking' && (
        <div className="moni-pseudo-wave-bars" style={{ opacity: getGlowOpacity(1) }}>
          {[1, 2, 3, 4, 5].map((idx) => (
            <div key={idx} className={`moni-pseudo-bar bar-${idx}`} />
          ))}
        </div>
      )}
    </div>
  );
};
