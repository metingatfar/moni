import React from 'react';

interface MoniAvatarProps {
  isSpeaking: boolean;
  isListening: boolean;
  eyeColor?: string;
}

export const MoniAvatar: React.FC<MoniAvatarProps> = ({ isSpeaking, isListening, eyeColor = 'blue' }) => {
  // Resolve colors based on eyeColor prop
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
  return (
    <div className={`moni-avatar-wrapper ${isListening ? 'listening' : ''} ${isSpeaking ? 'speaking' : ''}`}>
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
            <stop offset="0%" stopColor="rgba(0, 240, 255, 0.12)" />
            <stop offset="100%" stopColor="rgba(157, 78, 221, 0.0)" />
          </radialGradient>
          <linearGradient id="cyberBorder" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--accent-cyan)" />
            <stop offset="50%" stopColor="#ffd700" />
            <stop offset="100%" stopColor="var(--accent-purple)" />
          </linearGradient>
          <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Outer glowing pulsing ring when listening */}
        {isListening && (
          <>
            <circle cx="100" cy="100" r="95" stroke="var(--accent-cyan)" strokeWidth="1.5" strokeDasharray="5 5" className="orbit-pulse" opacity="0.6" filter="url(#neonGlow)" />
            <circle cx="100" cy="100" r="88" stroke="var(--accent-purple)" strokeWidth="1" strokeDasharray="10 4" className="orbit-pulse-reverse" opacity="0.4" />
          </>
        )}

        {/* Base Face Glow plate */}
        <circle cx="100" cy="100" r="75" fill="url(#faceGlow)" />
        <circle cx="100" cy="100" r="75" stroke="url(#cyberBorder)" strokeWidth="1.5" opacity="0.6" />

        {/* Robot head plate lines */}
        <path d="M60 50 C80 40, 120 40, 140 50" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="1" fill="none" />
        <path d="M50 100 C50 140, 150 140, 150 100" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1" fill="none" />
        <path d="M100 45 L100 65" stroke="rgba(0, 240, 255, 0.25)" strokeWidth="1.5" fill="none" />

        {/* Eyes & Blinking */}
        <g className="avatar-eyes">
          {/* Left Eye */}
          <g transform="translate(68, 85)">
            <ellipse cx="0" cy="0" rx="10" ry="10" fill={bgFill} />
            <ellipse cx="0" cy="0" rx="6" ry="6" fill={pupilFill} stroke={pupilStroke} strokeWidth={pupilStrokeWidth} filter="url(#neonGlow)" className="eye-pupil" />
            <path d="M-12 -12 L12 -12" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="1" fill="none" />
          </g>

          {/* Right Eye */}
          <g transform="translate(132, 85)">
            <ellipse cx="0" cy="0" rx="10" ry="10" fill={bgFill} />
            <ellipse cx="0" cy="0" rx="6" ry="6" fill={pupilFill} stroke={pupilStroke} strokeWidth={pupilStrokeWidth} filter="url(#neonGlow)" className="eye-pupil" />
            <path d="M-12 -12 L12 -12" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="1" fill="none" />
          </g>
        </g>

        {/* Eyebrows */}
        <path d="M56 72 Q68 66 80 72" stroke="rgba(255, 255, 255, 0.35)" strokeWidth="1.5" fill="none" className="eyebrow eyebrow-left" />
        <path d="M120 72 Q132 66 144 72" stroke="rgba(255, 255, 255, 0.35)" strokeWidth="1.5" fill="none" className="eyebrow eyebrow-right" />

        {/* Mouth */}
        {isSpeaking ? (
          /* Talking wave mouth */
          <g transform="translate(100, 122)">
            <path d="M-25 0 C-12 -8, -4 8, 0 0 C4 -8, 12 8, 25 0" stroke="#ffd700" strokeWidth="2.5" fill="none" filter="url(#neonGlow)" className="talking-mouth" />
          </g>
        ) : (
          /* Calm breathing/smiling mouth */
          <path d="M75 120 Q100 128 125 120" stroke="rgba(255, 255, 255, 0.6)" strokeWidth="1.5" fill="none" className="calm-mouth" />
        )}

        {/* Cheek status lights */}
        <circle cx="50" cy="110" r="2" fill={isSpeaking ? "#ffd700" : isListening ? "var(--accent-cyan)" : "rgba(255,255,255,0.2)"} />
        <circle cx="150" cy="110" r="2" fill={isSpeaking ? "#ffd700" : isListening ? "var(--accent-cyan)" : "rgba(255,255,255,0.2)"} />

      </svg>

      <style>{`
        .moni-avatar-wrapper {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: avatarFloat 4s infinite ease-in-out;
        }

        /* Eye blink animation */
        .eye-pupil {
          animation: eyeBlink 5s infinite ease-in-out;
          transform-origin: center;
        }

        /* Talking mouth dynamic waveform */
        .talking-mouth {
          animation: speakingWave 0.2s infinite ease-in-out;
          transform-origin: center;
        }

        /* Listening rotating orbit rings */
        .orbit-pulse {
          animation: rotateOrbit 12s infinite linear;
          transform-origin: 100px 100px;
        }
        .orbit-pulse-reverse {
          animation: rotateOrbitRev 8s infinite linear;
          transform-origin: 100px 100px;
        }

        @keyframes avatarFloat {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-5px) scale(1.01); }
        }

        @keyframes eyeBlink {
          0%, 90%, 100% { transform: scaleY(1); }
          95% { transform: scaleY(0.08); }
        }

        @keyframes speakingWave {
          0%, 100% { transform: scaleY(0.5) scaleX(1); opacity: 0.9; }
          50% { transform: scaleY(2.2) scaleX(1.05); opacity: 1; }
        }

        @keyframes rotateOrbit {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes rotateOrbitRev {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }

        /* Listen mode additions */
        .listening .eye-pupil {
          animation: eyeScan 2.5s infinite ease-in-out;
        }

        @keyframes eyeScan {
          0%, 100% { transform: translateX(0px); }
          25% { transform: translateX(-1.5px); }
          75% { transform: translateX(1.5px); }
        }

        .speaking .eyebrow-left {
          animation: browMoveLeft 0.5s infinite ease-in-out;
        }
        .speaking .eyebrow-right {
          animation: browMoveRight 0.5s infinite ease-in-out;
        }

        @keyframes browMoveLeft {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-1.5px) rotate(-2deg); }
        }
        @keyframes browMoveRight {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-1.5px) rotate(2deg); }
        }
      `}</style>
    </div>
  );
};
