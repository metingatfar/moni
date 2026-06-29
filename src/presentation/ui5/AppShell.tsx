import React, { useEffect, useState } from 'react';
import { ThemeProvider } from './providers/ThemeProvider';
import { LayoutProvider, useLayout } from './providers/LayoutProvider';
import { WorkspaceProvider, useWorkspace } from './providers/WorkspaceProvider';
import { ChatProvider } from './providers/ChatProvider';
import { useChat } from './providers/ChatContext';
import { DesktopLayout, MobileLayout } from './layouts/Layouts';
import { colors } from './tokens/colors';

// Desktop parts
import { Header, Sidebar, AssistantPanel, BottomDashboard, StatusBar, CommandPalette } from './components/DesktopPanels';
import { HomeView, ChatView, WorkspaceView, ProjectsView, TaskView, MemoryView, SettingsView, HelpView } from './views/DesktopViews';

// Mobile parts
import { MobileHome, MobileChat, MobileVoice, MobileTasks, MobileSettings, MobileMemory } from './views/MobileViews';
import { Dock } from './components/Indicators';
import { GlassButton } from './components/GlassComponents';

import { moniRuntime } from '../../core/runtime/MoniRuntime';

const AppShellInner: React.FC = () => {
  const { isMobile } = useLayout();
  const { activeView, setActiveView, refreshData } = useWorkspace();
  const { 
    currentLanguage,
    autoSpeakEnabled,
    speechRate,
    speechVolume,
    selectedSystemVoiceName,
    selectedProviderName,
    setOffline
  } = useChat();

  const [runtimeState, setRuntimeState] = useState(() => moniRuntime.getState());
  const [pendingSecretary, setPendingSecretary] = useState<any | null>(null);

  // Subscribe to moniRuntime state updates
  useEffect(() => {
    const unsubscribe = moniRuntime.subscribe((state) => {
      setRuntimeState(state);
    });
    return unsubscribe;
  }, []);

  // Sync settings dynamically with moniRuntime
  useEffect(() => {
    moniRuntime.setLanguage(currentLanguage);
    moniRuntime.setAutoSpeakEnabled(autoSpeakEnabled);
    moniRuntime.setSpeechRate(speechRate);
    moniRuntime.setSpeechVolume(speechVolume);
    moniRuntime.setSystemVoice(selectedSystemVoiceName || undefined);
    moniRuntime.setProvider(selectedProviderName || 'gemini');
  }, [currentLanguage, autoSpeakEnabled, speechRate, speechVolume, selectedSystemVoiceName, selectedProviderName]);

  // Sync workspace refresh and pending secretary actions with moniRuntime
  useEffect(() => {
    moniRuntime.setRefreshDashboardData(refreshData);
    moniRuntime.setPendingSecretaryHandlers(
      () => pendingSecretary,
      (val) => setPendingSecretary(val)
    );
  }, [refreshData, pendingSecretary]);

  // Handle initial runtime start on mount
  useEffect(() => {
    moniRuntime.start();
    return () => {
      moniRuntime.stop();
    };
  }, []);

  // Hook for simulating transcript "Moni" manually
  useEffect(() => {
    (window as any).simulateMoniWakeWord = () => {
      console.log('Manual wake word simulation triggered');
      moniRuntime.simulateWake();
    };
    return () => {
      delete (window as any).simulateMoniWakeWord;
    };
  }, []);

  // Handle online/offline events
  useEffect(() => {
    const updateOnline = () => setOffline(!navigator.onLine);
    window.addEventListener('online', updateOnline);
    window.addEventListener('offline', updateOnline);
    return () => {
      window.removeEventListener('online', updateOnline);
      window.removeEventListener('offline', updateOnline);
    };
  }, [setOffline]);

  const debugBar = (
    <div style={{
      position: 'fixed',
      bottom: '36px',
      left: '20px',
      background: 'rgba(15, 23, 42, 0.95)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '12px',
      padding: '12px 16px',
      zIndex: 99999,
      fontSize: '0.76rem',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
      backdropFilter: 'blur(10px)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      minWidth: '240px',
      pointerEvents: 'auto'
    }}>
      <div style={{ fontWeight: 800, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '4px', color: colors.accent.purpleLight }}>
        WAKE WORD DEBUG PANEL
      </div>
      <div><strong>State Machine State:</strong> {runtimeState.runtimeState}</div>
      <div><strong>Wake Listener State:</strong> {runtimeState.wakeStatus}</div>
      <div><strong>Mic Permission:</strong> {runtimeState.micPermission}</div>
      <div><strong>Speech API Supported:</strong> {runtimeState.speechApiSupported ? 'Supported' : 'Unsupported'}</div>
      <div style={{ wordBreak: 'break-all' }}><strong>Last Transcript:</strong> {runtimeState.lastTranscript || 'None'}</div>
      <div style={{ wordBreak: 'break-all' }}><strong>Last Error:</strong> {runtimeState.lastError || 'None'}</div>
      <div><strong>TTS Active:</strong> {runtimeState.isSpeaking ? 'Yes' : 'No'}</div>
      <div><strong>Recognition Running:</strong> {runtimeState.runtimeState === 'WAITING_WAKE' || runtimeState.runtimeState === 'WAITING_COMMAND' ? 'Yes' : 'No'}</div>
      <div><strong>Duplicate Listener Count:</strong> 0</div>

      {runtimeState.micPermission !== 'Granted' && (
        <button
          onClick={async () => {
            console.log('WAKE_DEBUG_MIC_PERMISSION_REQUEST (Manual Gesture)');
            await moniRuntime.activateVoice();
          }}
          style={{
            marginTop: '6px',
            background: colors.accent.purple,
            border: 'none',
            color: '#fff',
            padding: '6px 12px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 700,
            fontSize: '0.74rem'
          }}
        >
          Mikrofonu Etkinleştir
        </button>
      )}
    </div>
  );

  if (isMobile) {
    const renderMobileView = () => {
      switch (activeView) {
        case 'chat': return <MobileChat />;
        case 'voice': return <MobileVoice onNavigate={setActiveView} />;
        case 'tasks': return <MobileTasks />;
        case 'memory': return <MobileMemory onNavigate={setActiveView} />;
        case 'settings': return <MobileSettings />;
        default: return <MobileHome onNavigate={setActiveView} />;
      }
    };

    return (
      <MobileLayout
        nav={
          <Dock>
            <GlassButton onClick={() => setActiveView('home')}>🏠</GlassButton>
            <GlassButton onClick={() => setActiveView('chat')}>💬</GlassButton>
            <GlassButton onClick={() => setActiveView('voice')}>🎙️</GlassButton>
            <GlassButton onClick={() => setActiveView('tasks')}>✅</GlassButton>
            <GlassButton onClick={() => setActiveView('settings')}>⚙️</GlassButton>
          </Dock>
        }
      >
        {renderMobileView()}
        {debugBar}
      </MobileLayout>
    );
  }

  const renderDesktopView = () => {
    switch (activeView) {
      case 'chat': return <ChatView />;
      case 'workspace': return <WorkspaceView />;
      case 'projects': return <ProjectsView />;
      case 'tasks': return <TaskView />;
      case 'memory': return <MemoryView />;
      case 'help': return <HelpView />;
      case 'settings': return <SettingsView />;
      default: return <HomeView />;
    }
  };

  return (
    <>
      <DesktopLayout
        left={<Sidebar />}
        header={<Header />}
        center={renderDesktopView()}
        right={<AssistantPanel />}
        bottom={<BottomDashboard />}
        footer={<StatusBar />}
      />
      <CommandPalette />
      {debugBar}
    </>
  );
};

export const AppShell: React.FC = () => {
  return (
    <ThemeProvider>
      <LayoutProvider>
        <WorkspaceProvider>
          <ChatProvider>
            <AppShellInner />
          </ChatProvider>
        </WorkspaceProvider>
      </LayoutProvider>
    </ThemeProvider>
  );
};

export default AppShell;
