import React from 'react';
import { colors } from '../tokens/colors';

interface SidebarItemProps {
  label: string;
  icon: string;
  active?: boolean;
  onClick: () => void;
  collapsed?: boolean;
}

export const SidebarItem: React.FC<SidebarItemProps> = ({ 
  label, 
  icon, 
  active = false, 
  onClick,
  collapsed = false
}) => {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: collapsed ? '0' : '12px',
        padding: '10px 14px',
        borderRadius: '12px',
        cursor: 'pointer',
        background: active ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
        color: active ? colors.accent.cyan : colors.text.secondary,
        fontWeight: active ? 600 : 400,
        transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        justifyContent: collapsed ? 'center' : 'flex-start',
        border: active ? `1px solid ${colors.border.glass}` : '1px solid transparent',
        boxSizing: 'border-box'
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.color = '#ffffff';
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.color = colors.text.secondary;
          e.currentTarget.style.background = 'transparent';
        }
      }}
    >
      <span style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center' }}>{icon}</span>
      {!collapsed && (
        <span style={{ fontSize: '0.86rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{label}</span>
      )}
    </div>
  );
};
export default SidebarItem;
