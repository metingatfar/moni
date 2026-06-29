import React from 'react';
import { colors } from '../tokens/colors';

interface MoniAvatarProps {
  state: 'idle' | 'listening' | 'thinking' | 'speaking' | 'happy' | 'success' | 'error' | 'offline';
  size?: number;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export const MoniAvatar: React.FC<MoniAvatarProps> = ({ 
  state, 
  size = 150, 
  onClick, 
  style 
}) => {
  
  const getGlowColor = () => {
    switch (state) {
      case 'listening': return 'rgba(16, 185, 129, 0.6)'; // Emerald
      case 'thinking': return 'rgba(6, 182, 212, 0.6)';  // Cyan
      case 'speaking': return 'rgba(139, 92, 246, 0.6)'; // Purple
      case 'happy': return 'rgba(236, 72, 153, 0.6)';    // Pink/Rose
      case 'success': return 'rgba(16, 185, 129, 0.6)';   // Emerald
      case 'error': return 'rgba(239, 68, 68, 0.6)';      // Red
      case 'offline': return 'rgba(107, 114, 128, 0.3)';  // Gray
      default: return 'rgba(139, 92, 246, 0.3)';
    }
  };

  const glowColor = getGlowColor();

  const inlineStyles = `
    @keyframes avatar-breathe {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.02); }
    }
    @keyframes avatar-nod {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(5px); }
    }
    @keyframes avatar-blink {
      0%, 94%, 98%, 100% { transform: scaleY(0); }
      96% { transform: scaleY(1); }
    }
    @keyframes neck-pulse {
      0%, 100% { opacity: 0.3; transform: translate(-50%, -50%) scale(0.8); }
      50% { opacity: 1; transform: translate(-50%, -50%) scale(1.2); }
    }
    @keyframes speak-bar-bounce {
      0%, 100% { height: 4px; }
      50% { height: 16px; }
    }
    @keyframes outer-ripple {
      0% { transform: scale(0.95); opacity: 0.8; }
      100% { transform: scale(1.25); opacity: 0; }
    }
  `;

  // Filter styles depending on status
  const getFilterStyle = (): string => {
    if (state === 'offline') return 'grayscale(90%) contrast(90%)';
    if (state === 'error') return 'sepia(30%) hue-rotate(320deg) saturate(120%)';
    if (state === 'happy') return 'saturate(110%) brightness(105%)';
    return 'none';
  };

  // State-specific wrapper animation classes
  const getAnimationName = (): string => {
    if (state === 'offline') return 'none';
    if (state === 'success') return 'avatar-nod 0.8s ease-in-out';
    return 'avatar-breathe 4s infinite ease-in-out';
  };

  const isBlinkingEnabled = state !== 'offline' && state !== 'thinking';

  return (
    <div 
      onClick={onClick}
      style={{
        position: 'relative',
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        cursor: onClick ? 'pointer' : 'default',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(6, 182, 212, 0.05))',
        border: `2px solid ${state === 'offline' ? 'rgba(255,255,255,0.1)' : 'rgba(255, 255, 255, 0.15)'}`,
        boxShadow: `0 8px 32px 0 ${glowColor}`,
        transition: 'all 0.5s ease-in-out',
        ...style
      }}
    >
      <style>{inlineStyles}</style>

      {/* Ripple Sound Waves (Listening State) */}
      {state === 'listening' && (
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: '50%',
            border: `2px solid ${colors.accent.emerald}`,
            animation: 'outer-ripple 1.5s infinite ease-out',
            pointerEvents: 'none'
          }}
        />
      )}

      {/* Thinking Morphing Background Glow */}
      {state === 'thinking' && (
        <div 
          style={{
            position: 'absolute',
            top: '-5%',
            left: '-5%',
            right: '-5%',
            bottom: '-5%',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(6, 182, 212, 0.3) 0%, transparent 70%)',
            filter: 'blur(10px)',
            animation: 'outer-ripple 2.5s infinite ease-in-out',
            pointerEvents: 'none'
          }}
        />
      )}

      {/* Inner Avatar Image Container */}
      <div
        style={{
          width: '94%',
          height: '94%',
          borderRadius: '50%',
          overflow: 'hidden',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: getAnimationName(),
          transform: state === 'thinking' ? 'rotate(2.5deg)' : 'none',
          transition: 'transform 0.4s ease-in-out'
        }}
      >
        <img 
          src="/moni_avatar.png" 
          alt="MONI Avatar"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: getFilterStyle(),
            transition: 'filter 0.5s ease-in-out'
          }}
        />

        {/* Eyes Blinking Layer */}
        {isBlinkingEnabled && (
          <>
            {/* Left Eye Blink Line */}
            <div 
              style={{
                position: 'absolute',
                top: '38%',
                left: '42.5%',
                width: '6.5%',
                height: '4px',
                background: '#4a3728', // Skin shadow/lid color
                borderRadius: '50%',
                transformOrigin: 'center',
                animation: 'avatar-blink 5s infinite ease-in-out',
                opacity: 0.95
              }}
            />
            {/* Right Eye Blink Line */}
            <div 
              style={{
                position: 'absolute',
                top: '38%',
                left: '51%',
                width: '6.5%',
                height: '4px',
                background: '#4a3728',
                borderRadius: '50%',
                transformOrigin: 'center',
                animation: 'avatar-blink 5s infinite ease-in-out',
                opacity: 0.95
              }}
            />
          </>
        )}

        {/* Glowing Neck Light LED (Listening State) */}
        {state === 'listening' && (
          <div 
            style={{
              position: 'absolute',
              top: '73%',
              left: '49.8%',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: colors.accent.emerald,
              boxShadow: `0 0 10px ${colors.accent.emerald}, 0 0 20px ${colors.accent.emerald}`,
              animation: 'neck-pulse 1s infinite ease-in-out',
              transform: 'translate(-50%, -50%)',
              zIndex: 10
            }}
          />
        )}
      </div>

      {/* Lip Sync EQ Visualizer Bars (Speaking State Overlay) */}
      {state === 'speaking' && (
        <div 
          style={{
            position: 'absolute',
            bottom: '22%',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            alignItems: 'flex-end',
            gap: '3px',
            height: '20px',
            zIndex: 20,
            background: 'rgba(0,0,0,0.4)',
            padding: '2px 6px',
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.1)'
          }}
        >
          {[0.6, 1.2, 0.8, 1.4, 0.5].map((delay, index) => (
            <div 
              key={index}
              style={{
                width: '3px',
                background: colors.accent.purpleLight,
                borderRadius: '2px',
                animation: `speak-bar-bounce 0.6s infinite ease-in-out`,
                animationDelay: `${delay}s`
              }}
            />
          ))}
        </div>
      )}

      {/* Offline Status Badge */}
      {state === 'offline' && (
        <div 
          style={{
            position: 'absolute',
            bottom: '8px',
            background: 'rgba(31, 41, 55, 0.85)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '6px',
            padding: '2px 8px',
            fontSize: '0.58rem',
            color: '#9ca3af',
            fontWeight: 700,
            whiteSpace: 'nowrap',
            letterSpacing: '0.05em',
            zIndex: 30
          }}
        >
          Bağlantı bekleniyor...
        </div>
      )}
    </div>
  );
};

export default MoniAvatar;
