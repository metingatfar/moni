import React from 'react';
import { colors } from '../tokens/colors';

interface CardProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  onClick?: () => void;
  className?: string;
}

export const GlassCard: React.FC<CardProps> = ({ children, style, onClick, className }) => (
  <div
    onClick={onClick}
    className={className}
    style={{
      background: colors.background.card,
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      border: `1px solid ${colors.border.glass}`,
      borderRadius: '16px',
      padding: '16px',
      boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      cursor: onClick ? 'pointer' : 'default',
      ...style
    }}
  >
    {children}
  </div>
);

export const GlassPanel: React.FC<CardProps> = ({ children, style, className }) => (
  <div
    className={className}
    style={{
      background: colors.background.panel,
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: `1px solid ${colors.border.glass}`,
      borderRadius: '24px',
      padding: '24px',
      boxShadow: '0 12px 40px 0 rgba(0, 0, 0, 0.4)',
      ...style
    }}
  >
    {children}
  </div>
);

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'danger';
  children: React.ReactNode;
}

export const GlassButton: React.FC<ButtonProps> = ({ children, variant = 'secondary', style, ...props }) => {
  const getBg = () => {
    switch (variant) {
      case 'primary': return `linear-gradient(135deg, ${colors.accent.purple}, ${colors.accent.purpleLight})`;
      case 'accent': return colors.accent.cyan;
      case 'danger': return colors.accent.rose;
      default: return 'rgba(255, 255, 255, 0.05)';
    }
  };

  return (
    <button
      style={{
        background: getBg(),
        border: `1px solid ${colors.border.glass}`,
        borderRadius: '12px',
        color: '#ffffff',
        padding: '8px 16px',
        fontSize: '0.85rem',
        fontWeight: 600,
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        transition: 'transform 0.15s ease, opacity 0.15s ease',
        outline: 'none',
        ...style
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'scale(1.03)';
        e.currentTarget.style.opacity = '0.9';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.opacity = '1';
      }}
      {...props}
    >
      {children}
    </button>
  );
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const GlassInput: React.FC<InputProps> = ({ style, ...props }) => (
  <input
    style={{
      background: colors.background.input,
      border: `1px solid ${colors.border.input}`,
      borderRadius: '12px',
      color: '#ffffff',
      padding: '10px 14px',
      fontSize: '0.88rem',
      outline: 'none',
      width: '100%',
      boxSizing: 'border-box',
      transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
      ...style
    }}
    onFocus={(e) => {
      e.currentTarget.style.borderColor = colors.accent.purple;
      e.currentTarget.style.boxShadow = '0 0 8px rgba(139, 92, 246, 0.3)';
    }}
    onBlur={(e) => {
      e.currentTarget.style.borderColor = colors.border.input;
      e.currentTarget.style.boxShadow = 'none';
    }}
    {...props}
  />
);

export const FloatingButton: React.FC<ButtonProps> = ({ children, style, ...props }) => (
  <GlassButton
    style={{
      position: 'absolute',
      borderRadius: '50%',
      width: '40px',
      height: '40px',
      padding: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
      ...style
    }}
    {...props}
  >
    {children}
  </GlassButton>
);

export const EmptyState: React.FC<{ title: string; desc: string; icon?: string }> = ({ title, desc, icon = '📂' }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', textAlign: 'center', color: colors.text.secondary }}>
    <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>{icon}</div>
    <div style={{ fontSize: '0.95rem', fontWeight: 600, color: colors.text.primary, marginBottom: '4px' }}>{title}</div>
    <div style={{ fontSize: '0.8rem', maxWidth: '300px' }}>{desc}</div>
  </div>
);
