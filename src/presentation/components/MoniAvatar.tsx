import React from 'react';

export interface MoniAvatarProps {
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

export const MoniAvatar: React.FC<MoniAvatarProps> = ({
  status,
  isSpeaking: _isSpeaking,
  audioLevel: _audioLevel = 0,
  mood = 'neutral',
  avatarType = 'image',
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
        return '/avatar_woman_green.png'; // default / green-glowing
    }
  };

  // Determine glow intensity opacity modifiers
  const getGlowOpacity = (baseVal: number) => {
    if (effectsIntensity === 'low') return baseVal * 0.3;
    if (effectsIntensity === 'high') return baseVal * 1.6;
    return baseVal;
  };

  // Resolve SVG colors based on eyeColor prop
  let pupilFill = 'var(--accent-cyan)';
  let bgFill = 'rgba(0, 240, 255, 0.08)';
  let pupilStroke = 'none';
  let pupilStrokeWidth = '0';

  switch (eyeColor) {
    case 'black':
      pupilFill = '#12141c';
      bgFill = 'rgba(255, 255, 255, 0.04)';
      pupilStroke = 'rgba(255, 255, 255, 0.35)';
      pupilStrokeWidth = '1';
      break;
    case 'purple':
      pupilFill = 'var(--accent-purple)';
      bgFill = 'rgba(157, 78, 221, 0.12)';
      break;
    case 'green':
    case 'green-glowing':
      pupilFill = 'var(--accent-green)';
      bgFill = 'rgba(57, 255, 20, 0.12)';
      break;
    case 'gold':
      pupilFill = '#ffd700';
      bgFill = 'rgba(255, 215, 0, 0.12)';
      break;
    case 'blue':
    default:
      pupilFill = 'var(--accent-cyan)';
      bgFill = 'rgba(0, 240, 255, 0.08)';
      break;
  }

  // Adjust pupil color under error state for SVG Robot
  if (status === 'error') {
    pupilFill = 'var(--accent-red)';
    bgFill = 'rgba(255, 56, 56, 0.15)';
  } else if (status === 'thinking') {
    pupilFill = '#ffd700';
    bgFill = 'rgba(255, 215, 0, 0.15)';
  }

  // Eyebrow SVG paths based on Mood for Robot
  const getEyebrowPaths = () => {
    switch (mood) {
      case 'happy':
        // Angled up at outer edges, friendly
        return {
          left: 'M54 75 Q68 64 80 70',
          right: 'M120 70 Q132 64 146 75'
        };
      case 'focused':
        // Determined, angled down towards center
        return {
          left: 'M56 68 Q68 74 80 75',
          right: 'M120 75 Q132 74 144 68'
        };
      case 'thinking':
        // One skeptical eyebrow raised, one lowered
        return {
          left: 'M54 64 Q68 60 80 66',
          right: 'M120 74 Q132 72 144 76'
        };
      case 'alert':
        // Surprised, arched high
        return {
          left: 'M56 62 Q68 56 80 62',
          right: 'M120 62 Q132 56 144 62'
        };
      case 'neutral':
      default:
        // Flat normal
        return {
          left: 'M56 72 Q68 68 80 72',
          right: 'M120 72 Q132 68 144 72'
        };
    }
  };

  // Mouth SVG path based on Status and Mood for Robot
  const renderRobotMouth = () => {
    if (status === 'speaking' && mouthAnimationEnabled) {
      return (
        <path
          d="M-25 0 C-12 -8, -4 8, 0 0 C4 -8, 12 8, 25 0"
          stroke={eyeColor === 'purple' ? 'var(--accent-purple)' : '#ffd700'}
          strokeWidth="2.5"
          fill="none"
          filter="url(#neonGlow)"
          className="talking-mouth"
        />
      );
    }

    // Default static mouths based on mood
    switch (mood) {
      case 'happy':
        // Wide smiling curve
        return <path d="M72 118 Q100 134 128 118" stroke="var(--accent-green)" strokeWidth="2" fill="none" filter="url(#neonGlow)" />;
      case 'focused':
        // Flat determined line
        return <path d="M80 122 L120 122" stroke="rgba(255, 255, 255, 0.7)" strokeWidth="2" fill="none" />;
      case 'alert':
        // Open O shape
        return <circle cx="100" cy="122" r="5" stroke="var(--accent-cyan)" strokeWidth="2" fill="none" filter="url(#neonGlow)" />;
      case 'thinking':
        // Slightly skewed line
        return <path d="M82 120 Q100 124 118 120" stroke="rgba(255, 255, 255, 0.5)" strokeWidth="1.5" fill="none" />;
      case 'neutral':
      default:
        return <path d="M75 120 Q100 128 125 120" stroke="rgba(255, 255, 255, 0.6)" strokeWidth="1.5" fill="none" />;
    }
  };

  const eyebrows = getEyebrowPaths();

  return (
    <div className={`moni-avatar-wrapper ${animationsEnabled ? 'animated' : 'paused'} ${status} intensity-${effectsIntensity}`}>
      {/* 1. Image Avatar Layout */}
      {avatarType === 'image' ? (
        <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          
          {/* Radar Ring 1 (Only when listening) */}
          {status === 'listening' && animationsEnabled && (
            <div style={{
              position: 'absolute',
              width: '105%',
              height: '105%',
              borderRadius: '30px',
              border: `2px solid var(--accent-cyan)`,
              animation: 'radar-ripple 1.5s infinite linear',
              pointerEvents: 'none',
              opacity: getGlowOpacity(0.5)
            }} />
          )}

          {/* Radar Ring 2 (Outer Ripple) */}
          {status === 'listening' && animationsEnabled && (
            <div style={{
              position: 'absolute',
              width: '112%',
              height: '112%',
              borderRadius: '36px',
              border: `1px dashed var(--accent-cyan)`,
              animation: 'radar-ripple-delay 2s infinite linear',
              pointerEvents: 'none',
              opacity: getGlowOpacity(0.3)
            }} />
          )}

          {/* Speaking Pulsating Halo */}
          {status === 'speaking' && animationsEnabled && (
            <div style={{
              position: 'absolute',
              width: '102%',
              height: '102%',
              borderRadius: '26px',
              border: `3px solid var(--accent-purple)`,
              animation: 'speak-halo-pulse 1s infinite alternate ease-in-out',
              pointerEvents: 'none',
              filter: 'blur(3px)',
              opacity: getGlowOpacity(0.4)
            }} />
          )}

          {/* Thinking Concentric Glow Halo */}
          {status === 'thinking' && animationsEnabled && (
            <div style={{
              position: 'absolute',
              width: '102%',
              height: '102%',
              borderRadius: '26px',
              border: `2px solid #ffd700`,
              animation: 'thinking-halo-rotate 3s infinite linear',
              pointerEvents: 'none',
              opacity: getGlowOpacity(0.5)
            }} />
          )}

          <img
            src={getImageSrc()}
            alt="Moni Avatar"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: '24px',
              transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
              boxShadow: status === 'listening'
                ? `0 0 25px rgba(0, 240, 255, ${getGlowOpacity(0.55)})`
                : status === 'thinking'
                  ? `0 0 25px rgba(255, 215, 0, ${getGlowOpacity(0.55)})`
                  : status === 'speaking'
                    ? `0 0 25px rgba(157, 78, 221, ${getGlowOpacity(0.55)})`
                    : status === 'error'
                      ? `0 0 35px rgba(255, 56, 56, ${getGlowOpacity(0.75)})`
                      : 'none',
              animation: !animationsEnabled 
                ? 'none' 
                : status === 'listening'
                  ? 'avatar-pulse-scale 1.5s infinite ease-in-out'
                  : status === 'thinking'
                    ? 'avatar-pulse-opacity 2s infinite ease-in-out'
                    : status === 'speaking'
                      ? 'avatar-speak-scale 0.4s infinite alternate ease-in-out'
                      : status === 'error'
                        ? 'avatar-shake 0.3s infinite linear'
                        : 'avatar-float 6s infinite ease-in-out'
            }}
          />

          {/* Premium overlay tint gradient inside the card */}
          {effectsIntensity !== 'low' && (
            <div style={{
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              borderRadius: '24px',
              pointerEvents: 'none',
              transition: 'all 0.5s ease',
              background: status === 'listening'
                ? `radial-gradient(circle, rgba(0, 240, 255, ${getGlowOpacity(0.08)}) 0%, transparent 80%)`
                : status === 'thinking'
                  ? `radial-gradient(circle, rgba(255, 215, 0, ${getGlowOpacity(0.08)}) 0%, transparent 80%)`
                  : status === 'speaking'
                    ? `radial-gradient(circle, rgba(157, 78, 221, ${getGlowOpacity(0.08)}) 0%, transparent 80%)`
                    : status === 'error'
                      ? `radial-gradient(circle, rgba(255, 56, 56, ${getGlowOpacity(0.12)}) 0%, transparent 80%)`
                      : 'none'
            }} />
          )}

          {/* Holographic Mouth Speaking Wave Overlay for Woman Avatar */}
          {status === 'speaking' && mouthAnimationEnabled && (
            <div style={{
              position: 'absolute',
              top: '68%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '70px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
              filter: `drop-shadow(0 0 ${effectsIntensity === 'high' ? '8px' : '4px'} var(--accent-cyan))`
            }}>
              <svg width="100%" height="100%" viewBox="0 0 70 24">
                <ellipse
                  cx="35"
                  cy="12"
                  rx="18"
                  ry="6"
                  fill="none"
                  stroke="var(--accent-cyan)"
                  strokeWidth="2.5"
                  style={{
                    transformOrigin: 'center',
                    animation: animationsEnabled ? 'mouth-scale 0.25s infinite ease-in-out' : 'none'
                  }}
                />
                <line
                  x1="15"
                  y1="12"
                  x2="55"
                  y2="12"
                  stroke="var(--accent-cyan)"
                  strokeWidth="2"
                  style={{
                    transformOrigin: 'center',
                    animation: animationsEnabled ? 'mouth-line-pulse 0.25s infinite ease-in-out' : 'none'
                  }}
                />
              </svg>
            </div>
          )}

          {/* Speaking Audio wave bars on top of image */}
          {status === 'speaking' && (
            <div style={{
              position: 'absolute',
              bottom: '15px',
              display: 'flex',
              alignItems: 'flex-end',
              gap: '3px',
              height: '30px',
              background: 'rgba(7, 8, 13, 0.6)',
              padding: '6px 12px',
              borderRadius: '12px',
              backdropFilter: 'blur(4px)',
              border: '1px solid rgba(157, 78, 221, 0.2)',
              opacity: getGlowOpacity(1)
            }}>
              {[1, 2, 3, 4, 5].map((bar) => (
                <div
                  key={bar}
                  style={{
                    width: '3px',
                    backgroundColor: 'var(--accent-purple)',
                    boxShadow: effectsIntensity !== 'low' ? '0 0 8px var(--accent-purple)' : 'none',
                    borderRadius: '3px',
                    height: '100%',
                    transformOrigin: 'bottom',
                    animation: animationsEnabled ? `speak-wave-${bar} 0.5s infinite alternate ease-in-out` : 'none'
                  }}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        /* 2. SVG Robot Avatar Layout */
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ overflow: 'visible' }}
        >
          <defs>
            <radialGradient id="faceGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={status === 'error' ? 'rgba(255, 56, 56, 0.15)' : status === 'thinking' ? 'rgba(255, 215, 0, 0.15)' : 'rgba(0, 240, 255, 0.12)'} />
              <stop offset="100%" stopColor="rgba(157, 78, 221, 0.0)" />
            </radialGradient>
            <linearGradient id="cyberBorder" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={status === 'error' ? 'var(--accent-red)' : 'var(--accent-cyan)'} />
              <stop offset="50%" stopColor={status === 'error' ? 'var(--accent-red)' : '#ffd700'} />
              <stop offset="100%" stopColor={status === 'error' ? 'var(--accent-red)' : 'var(--accent-purple)'} />
            </linearGradient>
            <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation={effectsIntensity === 'high' ? '8' : effectsIntensity === 'low' ? '3' : '5'} result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Outer glowing pulsing rings when active */}
          {animationsEnabled && (
            <>
              <circle
                cx="100"
                cy="100"
                r="95"
                stroke={status === 'error' ? 'var(--accent-red)' : status === 'listening' ? 'var(--accent-cyan)' : 'rgba(255, 255, 255, 0.1)'}
                strokeWidth="1.5"
                strokeDasharray={status === 'listening' ? '5 5' : '15 15'}
                className="orbit-pulse"
                opacity={getGlowOpacity(status === 'listening' ? 0.7 : 0.25)}
                filter={status === 'listening' || status === 'error' ? 'url(#neonGlow)' : 'none'}
              />
              <circle
                cx="100"
                cy="100"
                r="88"
                stroke={status === 'error' ? 'var(--accent-red)' : status === 'speaking' ? 'var(--accent-purple)' : 'rgba(255, 255, 255, 0.05)'}
                strokeWidth="1"
                strokeDasharray="10 4"
                className="orbit-pulse-reverse"
                opacity={getGlowOpacity(0.3)}
              />
            </>
          )}

          {/* Base Face Glow plate */}
          <circle cx="100" cy="100" r="75" fill="url(#faceGlow)" />
          <circle cx="100" cy="100" r="75" stroke="url(#cyberBorder)" strokeWidth="1.5" opacity={getGlowOpacity(0.6)} />

          {/* Robot head plate panel lines */}
          <path d="M60 50 C80 40, 120 40, 140 50" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="1" fill="none" />
          <path d="M50 100 C50 140, 150 140, 150 100" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1" fill="none" />
          <path d="M100 45 L100 65" stroke={status === 'listening' ? 'var(--accent-cyan)' : status === 'thinking' ? '#ffd700' : 'rgba(0, 240, 255, 0.25)'} strokeWidth="1.5" fill="none" />

          {/* Eyes & Blinking */}
          <g className="avatar-eyes">
            {/* Left Eye */}
            <g transform="translate(68, 85)">
              <ellipse cx="0" cy="0" rx="10" ry="10" fill={bgFill} />
              <ellipse
                cx="0"
                cy="0"
                rx={mood === 'focused' ? '4' : mood === 'alert' ? '7' : '6'}
                ry={mood === 'focused' ? '4' : mood === 'alert' ? '7' : '6'}
                fill={pupilFill}
                stroke={pupilStroke}
                strokeWidth={pupilStrokeWidth}
                filter="url(#neonGlow)"
                className="eye-pupil"
                style={{
                  transformOrigin: 'center',
                  animation: animationsEnabled
                    ? status === 'listening'
                      ? 'eyeScan 2.5s infinite ease-in-out'
                      : status === 'thinking'
                        ? 'eyeThink 2s infinite ease-in-out'
                        : 'eyeBlink 5s infinite ease-in-out'
                    : 'none'
                }}
              />
              <path d="M-12 -12 L12 -12" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1" fill="none" />
            </g>

            {/* Right Eye */}
            <g transform="translate(132, 85)">
              <ellipse cx="0" cy="0" rx="10" ry="10" fill={bgFill} />
              <ellipse
                cx="0"
                cy="0"
                rx={mood === 'focused' ? '4' : mood === 'alert' ? '7' : '6'}
                ry={mood === 'focused' ? '4' : mood === 'alert' ? '7' : '6'}
                fill={pupilFill}
                stroke={pupilStroke}
                strokeWidth={pupilStrokeWidth}
                filter="url(#neonGlow)"
                className="eye-pupil"
                style={{
                  transformOrigin: 'center',
                  animation: animationsEnabled
                    ? status === 'listening'
                      ? 'eyeScan 2.5s infinite ease-in-out'
                      : status === 'thinking'
                        ? 'eyeThink 2s infinite ease-in-out'
                        : 'eyeBlink 5s infinite ease-in-out'
                    : 'none'
                }}
              />
              <path d="M-12 -12 L12 -12" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1" fill="none" />
            </g>
          </g>

          {/* Eyebrows */}
          <path d={eyebrows.left} stroke="rgba(255, 255, 255, 0.45)" strokeWidth="1.5" fill="none" className="eyebrow eyebrow-left" />
          <path d={eyebrows.right} stroke="rgba(255, 255, 255, 0.45)" strokeWidth="1.5" fill="none" className="eyebrow eyebrow-right" />

          {/* Mouth */}
          <g transform="translate(0, 0)">
            {renderRobotMouth()}
          </g>

          {/* Cheek status lights */}
          <circle cx="50" cy="110" r="2" fill={status === 'error' ? 'var(--accent-red)' : status === 'speaking' ? 'var(--accent-purple)' : status === 'listening' ? 'var(--accent-cyan)' : status === 'thinking' ? '#ffd700' : 'rgba(255,255,255,0.2)'} />
          <circle cx="150" cy="110" r="2" fill={status === 'error' ? 'var(--accent-red)' : status === 'speaking' ? 'var(--accent-purple)' : status === 'listening' ? 'var(--accent-cyan)' : status === 'thinking' ? '#ffd700' : 'rgba(255,255,255,0.2)'} />

        </svg>
      )}

      {/* Styled component scoped animations */}
      <style>{`
        .moni-avatar-wrapper {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justifyContent: center;
          position: relative;
        }

        .moni-avatar-wrapper.animated {
          animation: avatarFloat 5s infinite ease-in-out;
        }
        
        .moni-avatar-wrapper.error.animated {
          animation: avatarShakeMini 0.2s infinite linear;
        }

        /* Eye blink animation */
        .eye-pupil {
          transform-origin: center;
        }

        /* Talking mouth dynamic waveform */
        .talking-mouth {
          animation: speakingWave 0.22s infinite ease-in-out;
          transform-origin: center;
        }

        /* Listening rotating orbit rings */
        .orbit-pulse {
          animation: rotateOrbit 15s infinite linear;
          transform-origin: 100px 100px;
        }
        .moni-avatar-wrapper.error .orbit-pulse {
          animation: rotateOrbit 2s infinite linear !important;
        }
        
        .orbit-pulse-reverse {
          animation: rotateOrbitRev 10s infinite linear;
          transform-origin: 100px 100px;
        }

        @keyframes avatarFloat {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-6px) scale(1.01); }
        }

        @keyframes avatarShakeMini {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(-1px, 0.5px) rotate(-0.3deg); }
          75% { transform: translate(1px, -0.5px) rotate(0.3deg); }
        }

        @keyframes eyeBlink {
          0%, 90%, 100% { transform: scaleY(1); }
          95% { transform: scaleY(0.08); }
        }

        @keyframes speakingWave {
          0%, 100% { transform: scaleY(0.6) scaleX(0.95); opacity: 0.85; }
          50% { transform: scaleY(2.0) scaleX(1.05); opacity: 1; }
        }

        @keyframes rotateOrbit {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes rotateOrbitRev {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }

        /* Scan logic for listening */
        @keyframes eyeScan {
          0%, 100% { transform: translateX(0px) scaleY(1); }
          25% { transform: translateX(-2px) scaleY(0.9); }
          75% { transform: translateX(2px) scaleY(0.9); }
        }

        /* Eye movement during thinking */
        @keyframes eyeThink {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          33% { transform: translateY(-1.5px) translateX(-1px); }
          66% { transform: translateY(1px) translateX(1px); }
        }

        /* Eyebrows response under speaking */
        .speaking .eyebrow-left {
          animation: browMoveLeft 0.6s infinite ease-in-out;
        }
        .speaking .eyebrow-right {
          animation: browMoveRight 0.6s infinite ease-in-out;
        }

        @keyframes browMoveLeft {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-1.2px) rotate(-1deg); }
        }
        @keyframes browMoveRight {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-1.2px) rotate(1deg); }
        }

        /* Image-based avatar animations */
        @keyframes avatar-float {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-5px) scale(1.015); }
        }

        @keyframes avatar-pulse-scale {
          0%, 100% { transform: scale(1); filter: brightness(1.0); }
          50% { transform: scale(1.02); filter: brightness(1.08); }
        }

        @keyframes avatar-pulse-opacity {
          0%, 100% { filter: brightness(0.95) contrast(0.98); }
          50% { filter: brightness(1.06) contrast(1.02); }
        }

        @keyframes avatar-speak-scale {
          0% { transform: scale(1.01); }
          100% { transform: scale(1.045); }
        }

        @keyframes avatar-shake {
          0%, 100% { transform: translate(0, 0); }
          20% { transform: translate(-1.5px, 1px); }
          40% { transform: translate(1.5px, -1px); }
          60% { transform: translate(-1px, -1.5px); }
          80% { transform: translate(1px, 1.5px); }
        }

        @keyframes radar-ripple {
          0% { transform: scale(0.98); opacity: 0.7; }
          100% { transform: scale(1.08); opacity: 0; }
        }

        @keyframes radar-ripple-delay {
          0% { transform: scale(0.95); opacity: 0.5; }
          100% { transform: scale(1.15); opacity: 0; }
        }

        @keyframes speak-halo-pulse {
          0% { transform: scale(0.99); opacity: 0.2; box-shadow: 0 0 10px rgba(157, 78, 221, 0.2); }
          100% { transform: scale(1.03); opacity: 0.6; box-shadow: 0 0 25px rgba(157, 78, 221, 0.6); }
        }

        @keyframes thinking-halo-rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
