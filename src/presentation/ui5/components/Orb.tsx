import React from 'react';
import { colors } from '../tokens/colors';

interface OrbProps {
  state: 'idle' | 'listening' | 'thinking' | 'speaking' | 'working' | 'happy' | 'warning' | 'offline';
  size?: number;
  onClick?: () => void;
}

export const Orb: React.FC<OrbProps> = ({ state, size = 100, onClick }) => {
  const getColors = () => {
    switch (state) {
      case 'listening': return { base: colors.accent.emerald, glow: 'rgba(16, 185, 129, 0.4)' };
      case 'thinking': return { base: colors.accent.cyan, glow: 'rgba(6, 182, 212, 0.4)' };
      case 'speaking': return { base: colors.accent.purple, glow: 'rgba(139, 92, 246, 0.4)' };
      case 'working': return { base: colors.accent.blue, glow: 'rgba(59, 130, 246, 0.4)' };
      case 'warning': return { base: colors.accent.amber, glow: 'rgba(245, 158, 11, 0.4)' };
      case 'offline': return { base: colors.accent.rose, glow: 'rgba(244, 63, 94, 0.4)' };
      case 'happy': return { base: '#ec4899', glow: 'rgba(236, 72, 153, 0.4)' };
      default: return { base: 'rgba(139, 92, 246, 0.8)', glow: 'rgba(139, 92, 246, 0.2)' };
    }
  };

  const currentColors = getColors();

  // Define unique keyframes
  const styleString = `
    @keyframes orb-pulse {
      0% { transform: scale(1); filter: drop-shadow(0 0 10px ${currentColors.glow}); }
      50% { transform: scale(1.08); filter: drop-shadow(0 0 25px ${currentColors.glow}); }
      100% { transform: scale(1); filter: drop-shadow(0 0 10px ${currentColors.glow}); }
    }
    @keyframes orb-wave {
      0% { border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%; }
      34% { border-radius: 70% 30% 50% 50% / 30% 60% 40% 70%; }
      67% { border-radius: 50% 60% 30% 70% / 60% 30% 60% 40%; }
      100% { border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%; }
    }
    @keyframes orb-rotate {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `;

  return (
    <div 
      onClick={onClick}
      style={{
        position: 'relative',
        width: `${size}px`,
        height: `${size}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: onClick ? 'pointer' : 'default'
      }}
    >
      <style>{styleString}</style>

      {/* Outer Glow Halo */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(circle, ${currentColors.glow} 0%, transparent 70%)`,
          borderRadius: '50%',
          transform: 'scale(1.4)',
          transition: 'all 0.4s ease-in-out',
          opacity: state === 'idle' ? 0.3 : 1
        }}
      />

      {/* Main Fluid Orb Body */}
      <div 
        style={{
          width: '80%',
          height: '80%',
          background: `linear-gradient(135deg, ${currentColors.base}, ${currentColors.base}88)`,
          borderRadius: '50%',
          boxShadow: `0 8px 32px 0 ${currentColors.glow}`,
          transition: 'all 0.5s ease-in-out',
          animation: state === 'idle' 
            ? 'orb-pulse 3s infinite ease-in-out' 
            : state === 'listening'
              ? 'orb-pulse 1.2s infinite ease-in-out, orb-wave 2.5s infinite linear'
              : state === 'thinking'
                ? 'orb-rotate 4s infinite linear, orb-wave 3s infinite linear'
                : state === 'speaking'
                  ? 'orb-pulse 0.8s infinite ease-in-out, orb-wave 2s infinite linear'
                  : 'orb-pulse 2s infinite ease-in-out, orb-wave 4s infinite linear'
        }}
      />

      {/* Center Specular Highlight Reflection */}
      <div 
        style={{
          position: 'absolute',
          top: '20%',
          left: '20%',
          width: '20%',
          height: '20%',
          background: 'rgba(255, 255, 255, 0.4)',
          borderRadius: '50%',
          filter: 'blur(2px)'
        }}
      />
    </div>
  );
};
export default Orb;
