import React from 'react';
import { useLayout } from '../providers/LayoutProvider';
import { colors } from '../tokens/colors';

interface LayoutProps {
  left: React.ReactNode;
  header: React.ReactNode;
  center: React.ReactNode;
  right: React.ReactNode;
  bottom: React.ReactNode;
  footer: React.ReactNode;
}

export const DesktopLayout: React.FC<LayoutProps> = ({
  left,
  header,
  center,
  right,
  bottom,
  footer
}) => {
  const { isSidebarCollapsed } = useLayout();

  return (
    <div 
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: colors.background.base,
        color: colors.text.primary,
        boxSizing: 'border-box'
      }}
    >
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left Sidebar */}
        <aside 
          style={{
            width: isSidebarCollapsed ? '72px' : '260px',
            transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            borderRight: `1px solid ${colors.border.glass}`,
            backgroundColor: colors.background.nav,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxSizing: 'border-box'
          }}
        >
          {left}
        </aside>

        {/* Core Workspace Area */}
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          {/* Header */}
          <header 
            style={{
              height: '56px',
              borderBottom: `1px solid ${colors.border.glass}`,
              display: 'flex',
              alignItems: 'center',
              padding: '0 20px',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              boxSizing: 'border-box',
              zIndex: 50
            }}
          >
            {header}
          </header>

          {/* Main Views Panel */}
          <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>
            {/* Center View */}
            <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '20px', boxSizing: 'border-box' }}>
              <div style={{ flex: 1, overflowY: 'auto' }}>
                {center}
              </div>
              
              {/* Bottom Dashboard Drawer */}
              <section 
                style={{
                  height: '220px',
                  borderTop: `1px solid ${colors.border.glass}`,
                  background: 'rgba(17, 24, 39, 0.4)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  marginTop: '12px',
                  borderRadius: '16px 16px 0 0',
                  boxSizing: 'border-box'
                }}
              >
                {bottom}
              </section>
            </main>

            {/* Right Assistant Panel */}
            <aside 
              style={{
                width: '320px',
                borderLeft: `1px solid ${colors.border.glass}`,
                backgroundColor: 'rgba(17, 24, 39, 0.3)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                boxSizing: 'border-box'
              }}
            >
              {right}
            </aside>
          </div>
        </div>
      </div>

      {/* Footer Status Bar */}
      <footer 
        style={{
          height: '26px',
          borderTop: `1px solid ${colors.border.glass}`,
          backgroundColor: colors.background.nav,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 12px',
          fontSize: '0.68rem',
          color: colors.text.muted,
          boxSizing: 'border-box',
          zIndex: 100
        }}
      >
        {footer}
      </footer>
    </div>
  );
};

export const MobileLayout: React.FC<{
  children: React.ReactNode;
  nav: React.ReactNode;
}> = ({ children, nav }) => (
  <div 
    style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      backgroundColor: colors.background.base,
      color: colors.text.primary,
      overflow: 'hidden',
      boxSizing: 'border-box'
    }}
  >
    {/* Screen content area */}
    <div style={{ flex: 1, overflowY: 'auto', padding: '16px', paddingBottom: '80px', boxSizing: 'border-box' }}>
      {children}
    </div>

    {/* Navigation Dock */}
    <div 
      style={{
        position: 'fixed',
        bottom: '16px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000
      }}
    >
      {nav}
    </div>
  </div>
);

export const SplitLayout: React.FC<{ left: React.ReactNode; right: React.ReactNode }> = ({ left, right }) => (
  <div style={{ display: 'flex', gap: '20px', height: '100%', boxSizing: 'border-box' }}>
    <div style={{ flex: 1, overflowY: 'auto' }}>{left}</div>
    <div style={{ width: '300px', display: 'flex', flexDirection: 'column', gap: '16px' }}>{right}</div>
  </div>
);

export const WorkspaceLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%', boxSizing: 'border-box' }}>
    {children}
  </div>
);
