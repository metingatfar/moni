import React from 'react';
import { colors } from '../tokens/colors';
import { GlassCard } from './GlassComponents';

export const StatusDot: React.FC<{ state: 'healthy' | 'rate_limited' | 'cooldown' | 'offline' | 'unknown' }> = ({ state }) => {
  const getBg = () => {
    switch (state) {
      case 'healthy': return '#10b981';
      case 'rate_limited':
      case 'cooldown': return '#f59e0b';
      case 'offline': return '#ef4444';
      default: return '#9ca3af';
    }
  };

  return (
    <span 
      style={{
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        backgroundColor: getBg(),
        display: 'inline-block',
        boxShadow: `0 0 8px ${getBg()}`
      }}
    />
  );
};

export const ProviderBadge: React.FC<{ name: string; state: 'healthy' | 'rate_limited' | 'cooldown' | 'offline' | 'unknown' }> = ({ name, state }) => (
  <div 
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      background: 'rgba(255, 255, 255, 0.03)',
      padding: '4px 10px',
      borderRadius: '8px',
      border: `1px solid ${colors.border.glass}`
    }}
  >
    <StatusDot state={state} />
    <span style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'capitalize' }}>{name}</span>
  </div>
);

export const ProgressRing: React.FC<{ percent: number; size?: number; stroke?: number; color?: string }> = ({ 
  percent, 
  size = 40, 
  stroke = 4, 
  color = colors.accent.purple 
}) => {
  const radius = (size - stroke) / 2;
  const circum = radius * 2 * Math.PI;
  const strokeDashoffset = circum - (percent / 100) * circum;

  return (
    <svg width={size} height={size}>
      <circle
        stroke="rgba(255,255,255,0.05)"
        fill="transparent"
        strokeWidth={stroke}
        r={radius}
        cx={size / 2}
        cy={size / 2}
      />
      <circle
        stroke={color}
        fill="transparent"
        strokeWidth={stroke}
        strokeDasharray={circum + ' ' + circum}
        style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.35s', transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
        r={radius}
        cx={size / 2}
        cy={size / 2}
      />
    </svg>
  );
};

export const Avatar: React.FC<{ size?: number; name?: string; isMoni?: boolean }> = ({ 
  size = 32, 
  name = 'User', 
  isMoni = false 
}) => (
  <div
    style={{
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: '50%',
      background: isMoni 
        ? `linear-gradient(135deg, ${colors.accent.purple}, ${colors.accent.cyan})` 
        : 'rgba(255, 255, 255, 0.1)',
      border: `1px solid ${isMoni ? colors.accent.cyan : 'rgba(255,255,255,0.15)'}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#ffffff',
      fontSize: `${size * 0.4}px`,
      fontWeight: 'bold',
      boxShadow: isMoni ? '0 0 10px rgba(6, 182, 212, 0.3)' : 'none'
    }}
  >
    {isMoni ? 'M' : (name.substring(0, 1) || 'U')}
  </div>
);

export const MetricCard: React.FC<{ title: string; value: string; percent: number; color?: string }> = ({ 
  title, 
  value, 
  percent, 
  color = colors.accent.purple 
}) => (
  <GlassCard style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minWidth: '150px' }}>
    <div>
      <div style={{ fontSize: '0.72rem', color: colors.text.secondary }}>{title}</div>
      <div style={{ fontSize: '1.2rem', fontWeight: 700, marginTop: '4px', color: '#fff' }}>{value}</div>
    </div>
    <ProgressRing percent={percent} size={36} stroke={3} color={color} />
  </GlassCard>
);

export const SectionTitle: React.FC<{ title: string; actionText?: string; onAction?: () => void }> = ({ title, actionText, onAction }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', marginTop: '12px' }}>
    <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: colors.text.secondary }}>{title}</span>
    {actionText && onAction && (
      <span onClick={onAction} style={{ fontSize: '0.72rem', color: colors.accent.cyan, cursor: 'pointer', fontWeight: 600 }}>{actionText}</span>
    )}
  </div>
);

export const InfoCard: React.FC<{ children: React.ReactNode; type?: 'info' | 'warning' | 'success' }> = ({ children, type = 'info' }) => {
  const getBorderColor = () => {
    switch (type) {
      case 'warning': return colors.accent.amber;
      case 'success': return colors.accent.emerald;
      default: return colors.accent.blue;
    }
  };

  return (
    <div
      style={{
        borderLeft: `3px solid ${getBorderColor()}`,
        background: 'rgba(255, 255, 255, 0.02)',
        padding: '10px 14px',
        borderRadius: '0 8px 8px 0',
        fontSize: '0.76rem',
        lineHeight: 1.4,
        color: colors.text.secondary
      }}
    >
      {children}
    </div>
  );
};

export const CommandButton: React.FC<{ label: string; shortcut: string; onClick: () => void }> = ({ label, shortcut, onClick }) => (
  <div 
    onClick={onClick}
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '8px 12px',
      borderRadius: '8px',
      cursor: 'pointer',
      background: 'rgba(255, 255, 255, 0.02)',
      border: '1px solid transparent',
      transition: 'all 0.15s ease'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
      e.currentTarget.style.borderColor = 'transparent';
    }}
  >
    <span style={{ fontSize: '0.78rem', fontWeight: 500 }}>{label}</span>
    <kbd style={{ background: 'rgba(255,255,255,0.1)', color: colors.text.secondary, padding: '2px 6px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 600 }}>{shortcut}</kbd>
  </div>
);

export const Dock: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div 
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      background: 'rgba(17, 24, 39, 0.7)',
      padding: '8px 16px',
      borderRadius: '20px',
      border: `1px solid ${colors.border.glass}`,
      boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      maxWidth: 'fit-content',
      margin: '0 auto'
    }}
  >
    {children}
  </div>
);
