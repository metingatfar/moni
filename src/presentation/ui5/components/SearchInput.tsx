import React from 'react';
import { colors } from '../tokens/colors';

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onShortcutClick?: () => void;
}

export const SearchInput: React.FC<SearchInputProps> = ({ onShortcutClick, style, ...props }) => {
  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <input
        style={{
          background: 'rgba(0, 0, 0, 0.3)',
          border: `1px solid ${colors.border.input}`,
          borderRadius: '12px',
          color: '#ffffff',
          padding: '10px 40px 10px 14px',
          fontSize: '0.82rem',
          outline: 'none',
          width: '100%',
          boxSizing: 'border-box',
          transition: 'all 0.2s ease',
          ...style
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = colors.accent.purple;
          e.currentTarget.style.boxShadow = '0 0 10px rgba(139, 92, 246, 0.2)';
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = colors.border.input;
          e.currentTarget.style.boxShadow = 'none';
        }}
        {...props}
      />
      <div 
        onClick={onShortcutClick}
        style={{
          position: 'absolute',
          right: '12px',
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'rgba(255, 255, 255, 0.08)',
          color: colors.text.secondary,
          padding: '2px 6px',
          borderRadius: '4px',
          fontSize: '0.62rem',
          fontWeight: 600,
          cursor: 'pointer',
          userSelect: 'none'
        }}
      >
        Ctrl + P
      </div>
    </div>
  );
};
export default SearchInput;
