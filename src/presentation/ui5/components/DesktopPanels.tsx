import React, { useState, useEffect } from 'react';
import { useWorkspace } from '../providers/WorkspaceProvider';
import { useChat } from '../providers/ChatContext';
import { moniRuntime } from '../../../core/runtime/MoniRuntime';
import { useLayout } from '../providers/LayoutProvider';
import { colors } from '../tokens/colors';
import { GlassButton, GlassInput } from './GlassComponents';
import { Avatar, ProgressRing } from './Indicators';
import { Orb } from './Orb';
import { providerHealthMonitor } from '../../../core/knowledge/ProviderHealthMonitor';
import { databaseService } from '../../../data/db/LocalDatabase';

// ============================================================
// HEADER
// ============================================================
export const Header: React.FC = () => {
  const { currentLanguage, setCurrentLanguage } = useChat();
  const { setShowCommandPalette } = useLayout();
  const { setActiveView } = useWorkspace();

  return (
    <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
      {/* Brand logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '1.2rem', fontWeight: 800, background: `linear-gradient(135deg, ${colors.accent.purple}, ${colors.accent.cyan})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '0.05em' }}>
          M <span>MONI</span>
        </span>
        <span style={{ fontSize: '0.72rem', color: colors.text.muted, background: 'rgba(255,255,255,0.04)', padding: '2px 6px', borderRadius: '4px' }}>Workspace X</span>
      </div>

      {/* Global search launcher */}
      <div 
        onClick={() => setShowCommandPalette(true)}
        style={{
          width: '380px',
          background: 'rgba(0,0,0,0.3)',
          border: `1px solid ${colors.border.input}`,
          borderRadius: '10px',
          padding: '6px 14px',
          fontSize: '0.78rem',
          color: colors.text.secondary,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer'
        }}
      >
        <span>Ara (Ctrl + P) veya komut yazın...</span>
        <kbd style={{ background: 'rgba(255,255,255,0.08)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.62rem', color: colors.text.secondary }}>⌘ K</kbd>
      </div>

      {/* Quick utility controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Executive Mode switch badge */}
        <div style={{ background: 'rgba(124, 58, 237, 0.1)', border: `1px solid rgba(124, 58, 237, 0.25)`, borderRadius: '8px', padding: '5px 10px', fontSize: '0.74rem', color: colors.accent.purpleLight, fontWeight: 700 }}>
          👑 Executive Mode
        </div>

        {/* Action icons */}
        <button style={{ background: 'transparent', border: 'none', color: colors.text.secondary, fontSize: '1.1rem', cursor: 'pointer' }}>🔔</button>
        <button onClick={() => setActiveView('settings')} style={{ background: 'transparent', border: 'none', color: colors.text.secondary, fontSize: '1.1rem', cursor: 'pointer' }}>⚙️</button>

        {/* Language switch */}
        <button 
          onClick={() => {
            const next = currentLanguage === 'tr' ? 'en' : 'tr';
            setCurrentLanguage(next);
            localStorage.setItem('moni_language', next);
          }}
          style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 600 }}
        >
          {currentLanguage === 'tr' ? 'TR 🌐' : 'EN 🌐'}
        </button>

        <Avatar size={28} name="Metin" />
      </div>
    </div>
  );
};

// ============================================================
// SIDEBAR
// ============================================================
export const Sidebar: React.FC = () => {
  const { activeView, setActiveView } = useWorkspace();
  const { isSidebarCollapsed, setSidebarCollapsed } = useLayout();
  const { moniStatus } = useChat();

  const menuItems = [
    { id: 'home', label: 'Ana Sayfa', icon: '🏠' },
    { id: 'chat', label: 'Sohbet', icon: '💬' },
    { id: 'workspace', label: 'Çalışma Alanı', icon: '📝' },
    { id: 'projects', label: 'Projeler', icon: '📁' },
    { id: 'tasks', label: 'Görevler', icon: '✅' },
    { id: 'memory', label: 'Bellek', icon: '🧠' },
    { id: 'help', label: 'Araçlar', icon: '🛠️' },
    { id: 'settings', label: 'Ayarlar', icon: '⚙️' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '16px 12px', justifyContent: 'space-between', boxSizing: 'border-box' }}>
      {/* Upper menu */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {/* Logo at top */}
        {!isSidebarCollapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', paddingLeft: '6px' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 800, background: `linear-gradient(135deg, ${colors.accent.purple}, ${colors.accent.cyan})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '0.05em' }}>
              M MONI
            </span>
          </div>
        )}

        {/* Toggle Collapse */}
        <div 
          onClick={() => setSidebarCollapsed(!isSidebarCollapsed)}
          style={{ alignSelf: isSidebarCollapsed ? 'center' : 'flex-end', cursor: 'pointer', padding: '4px', color: colors.text.muted }}
        >
          {isSidebarCollapsed ? '▶' : '◀'}
        </div>

        {menuItems.map(item => {
          const active = activeView === item.id;
          return (
            <div
              key={item.id}
              onClick={() => setActiveView(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: isSidebarCollapsed ? '0' : '12px',
                padding: '10px 14px',
                borderRadius: '12px',
                cursor: 'pointer',
                background: active ? 'rgba(124, 58, 237, 0.15)' : 'transparent',
                color: active ? colors.accent.purpleLight : colors.text.secondary,
                fontWeight: active ? 600 : 400,
                transition: 'all 0.2s ease',
                justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
                border: active ? `1px solid rgba(124, 58, 237, 0.25)` : '1px solid transparent'
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.color = '#fff';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.color = colors.text.secondary;
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <span style={{ fontSize: '1rem' }}>{item.icon}</span>
              {!isSidebarCollapsed && <span style={{ fontSize: '0.85rem' }}>{item.label}</span>}
            </div>
          );
        })}
      </div>

      {/* Center Orb Card */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.01)', padding: '12px', borderRadius: '14px', border: `1px solid ${colors.border.glass}` }}>
        <Orb state={moniStatus} size={isSidebarCollapsed ? 36 : 60} />
        {!isSidebarCollapsed && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
            <span style={{ fontSize: '0.7rem', color: '#fff', fontWeight: 700 }}>MONI Orb</span>
            <span style={{ fontSize: '0.62rem', color: colors.accent.cyan, textTransform: 'uppercase' }}>{moniStatus}</span>
          </div>
        )}
      </div>

      {/* User profile card at bottom */}
      {!isSidebarCollapsed && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px' }}>
          <Avatar size={28} name="Metin" />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.78rem', color: '#fff', fontWeight: 600 }}>Metin</span>
            <span style={{ fontSize: '0.62rem', color: colors.text.muted }}>Executive Mode</span>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================
// ASSISTANT PANEL (RIGHT SIDE)
// ============================================================
export const AssistantPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'today' | 'memory' | 'voice' | 'suggestions' | 'tasks' | 'system'>('today');
  const { memories, todos, refreshData } = useWorkspace();
  const { 
    moniStatus, 
    currentLanguage, 
    selectedProviderName, 
    isWakeWordListening, 
    autoSpeakEnabled,
    speechRate,
    setSpeechRate,
    speechVolume,
    setSpeechVolume,
    selectedSystemVoiceName,
    sendMessage 
  } = useChat();
  const [providerStatuses, setProviderStatuses] = useState(() => providerHealthMonitor.getStatusList());
  const [newTodo, setNewTodo] = useState('');
  const [memorySearch, setMemorySearch] = useState('');

  useEffect(() => {
    return providerHealthMonitor.subscribe(() => {
      setProviderStatuses(providerHealthMonitor.getStatusList());
    });
  }, []);

  const handleSuggestionClick = async (prompt: string) => {
    await sendMessage(prompt);
  };

  const handleQuickAddTodo = async () => {
    if (!newTodo.trim()) return;
    await databaseService.saveTodo({
      id: 'todo-' + Date.now(),
      task: newTodo,
      isCompleted: false,
      dateTime: new Date(),
      priority: 'medium'
    });
    setNewTodo('');
    refreshData();
  };

  const tabs = [
    { id: 'today', label: 'Bugün', icon: '📅' },
    { id: 'memory', label: 'Hafıza', icon: '🧠' },
    { id: 'voice', label: 'Ses', icon: '🎙️' },
    { id: 'suggestions', label: 'Öneriler', icon: '💡' },
    { id: 'tasks', label: 'Görevler', icon: '✅' },
    { id: 'system', label: 'Sistem', icon: '⚙️' }
  ];

  const completedCount = todos.filter((t: any) => t.isCompleted).length;
  const taskCompletionRate = todos.length > 0 ? Math.round((completedCount / todos.length) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box', overflow: 'hidden' }}>
      
      {/* 1. Header Tab Strip */}
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.06)', overflowX: 'auto', background: 'rgba(0,0,0,0.1)' }}>
        {tabs.map(t => {
          const active = activeTab === t.id;
          return (
            <div
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '10px 4px',
                cursor: 'pointer',
                fontSize: '0.64rem',
                color: active ? colors.accent.purpleLight : colors.text.secondary,
                background: active ? 'rgba(124, 58, 237, 0.05)' : 'transparent',
                borderBottom: active ? `2px solid ${colors.accent.purple}` : '2px solid transparent',
                transition: 'all 0.2s ease',
                minWidth: '50px'
              }}
            >
              <span style={{ fontSize: '0.9rem', marginBottom: '2px' }}>{t.icon}</span>
              <span>{t.label}</span>
            </div>
          );
        })}
      </div>

      {/* 2. Scrollable Glass Content Panel */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        
        {/* TODAY VIEW */}
        {activeTab === 'today' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ fontSize: '0.74rem', color: colors.text.muted, fontWeight: 700 }}>BUGÜNÜN DETAYI</div>
            <div style={{ background: 'rgba(255,255,255,0.01)', border: `1px solid ${colors.border.glass}`, borderRadius: '10px', padding: '10px' }}>
              <div style={{ fontSize: '0.7rem', color: colors.text.muted }}>28 Haziran 2026</div>
              <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#fff', marginTop: '2px' }}>Günaydın, Metin! 👋</div>
              <div style={{ fontSize: '0.76rem', color: colors.text.secondary, marginTop: '6px', lineHeight: '1.4' }}>
                Bugün planlanmış <strong>{todos.filter((t: any) => !t.isCompleted).length} aktif göreviniz</strong> bulunuyor. Sisteminiz şu anda tam kapasiteyle çalışıyor.
              </div>
            </div>

            {/* Productivity Ring widget */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.01)', border: `1px solid ${colors.border.glass}`, borderRadius: '10px', padding: '10px' }}>
              <ProgressRing percent={taskCompletionRate} size={42} stroke={4} color={colors.accent.purple} />
              <div>
                <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#fff' }}>Günlük Verimlilik</span>
                <div style={{ fontSize: '0.66rem', color: colors.text.muted }}>Görev tamamlama oranınız %{taskCompletionRate}</div>
              </div>
            </div>

            {/* Mock Calendar */}
            <div style={{ fontSize: '0.74rem', color: colors.text.muted, fontWeight: 700, marginTop: '4px' }}>AJANDA</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', background: 'rgba(255,255,255,0.01)', border: `1px solid ${colors.border.glass}`, borderRadius: '10px', padding: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem' }}>
                <span style={{ color: colors.accent.cyan }}>10:00 - AI Toplantısı</span>
                <span style={{ color: colors.text.muted }}>Tamamlandı</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem' }}>
                <span style={{ color: '#fff' }}>14:00 - Veritabanı Yedeklemesi</span>
                <span style={{ color: colors.accent.purpleLight }}>Sıradaki</span>
              </div>
            </div>
          </div>
        )}

        {/* MEMORY VIEW */}
        {activeTab === 'memory' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ fontSize: '0.74rem', color: colors.text.muted, fontWeight: 700 }}>HAFIZA ANALİZİ</div>
            
            <GlassInput 
              placeholder="Hafızada ara..." 
              value={memorySearch}
              onChange={(e) => setMemorySearch(e.target.value)}
              style={{ fontSize: '0.74rem', padding: '6px 10px' }}
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '150px', overflowY: 'auto' }}>
              {memories
                .filter(m => m.content.toLowerCase().includes(memorySearch.toLowerCase()))
                .slice(0, 5)
                .map((m: any) => (
                  <div key={m.id} style={{ padding: '8px', background: 'rgba(255,255,255,0.01)', border: `1px solid ${colors.border.glass}`, borderRadius: '6px', fontSize: '0.72rem' }}>
                    <div style={{ fontWeight: 600, color: colors.accent.purpleLight }}>{m.key || 'Kayıt'}</div>
                    <div style={{ color: colors.text.secondary, marginTop: '2px' }}>{m.content}</div>
                  </div>
                ))}
              {memories.length === 0 && <div style={{ fontSize: '0.7rem', color: colors.text.muted }}>Kayıtlı hafıza öğesi bulunmuyor.</div>}
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '8px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.7rem' }}>
              <div>
                <span style={{ color: colors.text.muted }}>Toplam Kayıt:</span>
                <div style={{ fontWeight: 700, color: '#fff' }}>{memories.length} adet</div>
              </div>
              <div>
                <span style={{ color: colors.text.muted }}>SQLite Durumu:</span>
                <div style={{ fontWeight: 700, color: colors.accent.emerald }}>Aktif</div>
              </div>
            </div>
          </div>
        )}

        {/* VOICE VIEW */}
        {activeTab === 'voice' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ fontSize: '0.74rem', color: colors.text.muted, fontWeight: 700 }}>SES KONTROLLERİ</div>
            
            <div style={{ background: 'rgba(255,255,255,0.01)', border: `1px solid ${colors.border.glass}`, borderRadius: '10px', padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.74rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: colors.text.secondary }}>Sistem Sesi:</span>
                <span style={{ fontWeight: 600, color: '#fff' }}>{selectedSystemVoiceName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: colors.text.secondary }}>Duyarlılık:</span>
                <span style={{ fontWeight: 600, color: '#fff' }}>Yüksek</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: colors.text.secondary }}>Uyandırma Kelimesi (Moni):</span>
                <span style={{ fontWeight: 700, color: isWakeWordListening ? colors.accent.emerald : colors.text.muted }}>
                  {isWakeWordListening ? 'AÇIK' : 'KAPALI'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: colors.text.secondary }}>Ses Modu:</span>
                <span style={{ fontWeight: 600, color: '#fff', textTransform: 'capitalize' }}>{moniStatus}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: colors.text.secondary }}>Dil:</span>
                <span style={{ fontWeight: 600, color: '#fff' }}>{currentLanguage.toUpperCase()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: colors.text.secondary }}>Otomatik Seslendirme:</span>
                <span style={{ fontWeight: 700, color: autoSpeakEnabled ? colors.accent.emerald : colors.text.muted }}>
                  {autoSpeakEnabled ? 'AÇIK' : 'KAPALI'}
                </span>
              </div>
              <GlassButton 
                onClick={() => {
                  console.log('[MONI WakeWord] Manual simulation trigger');
                  if ((window as any).simulateMoniWakeWord) {
                    (window as any).simulateMoniWakeWord();
                  }
                }}
                style={{ fontSize: '0.7rem', padding: '4px 8px', marginTop: '4px', width: '100%' }}
              >
                Test Wake Word
              </GlassButton>
            </div>

            {/* Speech Rate Slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: colors.text.secondary, marginBottom: '2px' }}>
                <span>Konuşma Hızı</span>
                <span>{speechRate}x</span>
              </div>
              <input 
                type="range" 
                min="0.5" 
                max="2" 
                step="0.1" 
                value={speechRate} 
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setSpeechRate(val);
                  localStorage.setItem('moni_speech_rate', String(val));
                }}
                style={{ width: '100%', height: '3px', background: 'rgba(255,255,255,0.1)', outline: 'none' }}
              />
            </div>

            {/* Volume Slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: colors.text.secondary, marginBottom: '2px' }}>
                <span>Konuşma Ses Seviyesi</span>
                <span>{Math.round(speechVolume * 100)}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.1" 
                value={speechVolume} 
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setSpeechVolume(val);
                  localStorage.setItem('moni_speech_volume', String(val));
                }}
                style={{ width: '100%', height: '3px', background: 'rgba(255,255,255,0.1)', outline: 'none' }}
              />
            </div>

            <GlassButton 
              style={{ fontSize: '0.72rem', padding: '6px 12px' }} 
              onClick={() => {
                console.log('BROWSER_TTS_DIRECT_TEST_CLICKED');
                try {
                  window.speechSynthesis.cancel();
                  const utterance = new SpeechSynthesisUtterance("Ses testi başarılı.");
                  (window as any).activeUtterance = utterance;
                  utterance.lang = "tr-TR";
                  utterance.rate = 0.95;
                  utterance.pitch = 1;
                  utterance.volume = 1;

                  utterance.onstart = () => {
                    console.log('BROWSER_TTS_DIRECT_TEST_ONSTART');
                  };
                  utterance.onend = () => {
                    console.log('BROWSER_TTS_DIRECT_TEST_ONEND');
                    (window as any).__moniTtsUnlocked = true;
                  };
                  utterance.onerror = (e) => {
                    console.error('BROWSER_TTS_DIRECT_TEST_ONERROR', e);
                  };

                  const trVoice = window.speechSynthesis.getVoices().find(v => 
                    v.lang.toLowerCase().includes('tr')
                  );
                  if (trVoice) {
                    utterance.voice = trVoice;
                  }

                  console.log('BROWSER_TTS_DIRECT_TEST_SPEAK_CALLED');
                  window.speechSynthesis.speak(utterance);
                  
                  (window as any).__moniTtsUnlocked = true;
                } catch (err) {
                  console.error('BROWSER_TTS_DIRECT_TEST_ONERROR', err);
                }
              }}
            >
              🔊 Tarayıcı Ses Testi
            </GlassButton>
          </div>
        )}

        {/* SUGGESTIONS VIEW */}
        {activeTab === 'suggestions' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ fontSize: '0.74rem', color: colors.text.muted, fontWeight: 700 }}>BAĞLAMSAL ÖNERİLER</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {[
                'Teknoloji yığını oluştur',
                'Alternatif çözüm üret',
                'Kod örneği oluştur',
                'Maliyet hesapla',
                'Risk analizi yap'
              ].map(prompt => (
                <div
                  key={prompt}
                  onClick={() => handleSuggestionClick(prompt)}
                  style={{
                    padding: '10px',
                    borderRadius: '8px',
                    background: 'rgba(255,255,255,0.01)',
                    border: `1px solid ${colors.border.glass}`,
                    fontSize: '0.74rem',
                    color: colors.text.secondary,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.01)'}
                >
                  {prompt}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TASKS VIEW */}
        {activeTab === 'tasks' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ fontSize: '0.74rem', color: colors.text.muted, fontWeight: 700 }}>GÖREV PLANI</div>
            
            <div style={{ display: 'flex', gap: '6px' }}>
              <GlassInput 
                placeholder="Hızlı görev ekle..." 
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                style={{ fontSize: '0.74rem', padding: '6px 10px' }}
                onKeyDown={(e) => e.key === 'Enter' && handleQuickAddTodo()}
              />
              <GlassButton onClick={handleQuickAddTodo} style={{ padding: '6px 10px', fontSize: '0.7rem' }}>Ekle</GlassButton>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '160px', overflowY: 'auto' }}>
              {todos.filter((t: any) => !t.isCompleted).map((t: any) => (
                <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', background: 'rgba(255,255,255,0.01)', border: `1px solid ${colors.border.glass}`, borderRadius: '6px' }}>
                  <input 
                    type="checkbox" 
                    checked={false} 
                    onChange={async () => {
                      await databaseService.saveTodo({ ...t, isCompleted: true });
                      refreshData();
                    }}
                    style={{ cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '0.74rem', color: '#fff' }}>{t.task}</span>
                </div>
              ))}
              {todos.filter((t: any) => !t.isCompleted).length === 0 && <div style={{ fontSize: '0.7rem', color: colors.text.muted }}>Görev planı temiz.</div>}
            </div>
          </div>
        )}

        {/* SYSTEM VIEW */}
        {activeTab === 'system' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ fontSize: '0.74rem', color: colors.text.muted, fontWeight: 700 }}>SİSTEM DURUMU</div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.74rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <span style={{ color: colors.text.secondary }}>Zeka Sağlayıcı:</span>
                <span style={{ fontWeight: 600, color: '#fff' }}>{selectedProviderName}</span>
              </div>
              
              {/* Health stats */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
                <span style={{ fontSize: '0.68rem', color: colors.text.muted, fontWeight: 700 }}>SAĞLIK MONİTÖRÜ</span>
                {providerStatuses.map((p: any) => (
                  <div key={p.name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', padding: '2px 0' }}>
                    <span style={{ textTransform: 'capitalize' }}>{p.name}:</span>
                    <span style={{ color: p.state === 'healthy' ? colors.accent.emerald : colors.accent.amber, fontWeight: 600 }}>{p.state}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', marginTop: '4px' }}>
                <span style={{ color: colors.text.secondary }}>Güvenlik Katmanı:</span>
                <span style={{ fontWeight: 600, color: colors.accent.emerald }}>Korumalı</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                <span style={{ color: colors.text.secondary }}>Sürüm:</span>
                <span style={{ fontWeight: 600, color: colors.text.muted }}>v5.0.0</span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

// ============================================================
// BOTTOM EXECUTIVE DASHBOARD (DRAWER)
// ============================================================
export const BottomDashboard: React.FC = () => {
  const { notes, todos } = useWorkspace();
  const [pomodoroMinutes, setPomodoroMinutes] = useState(25);
  const [pomodoroSeconds, setPomodoroSeconds] = useState(0);
  const [pomodoroRunning, setPomodoroRunning] = useState(false);

  useEffect(() => {
    let timer: any;
    if (pomodoroRunning) {
      timer = setInterval(() => {
        if (pomodoroSeconds > 0) {
          setPomodoroSeconds(prev => prev - 1);
        } else if (pomodoroMinutes > 0) {
          setPomodoroMinutes(prev => prev - 1);
          setPomodoroSeconds(59);
        } else {
          setPomodoroRunning(false);
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [pomodoroRunning, pomodoroSeconds, pomodoroMinutes]);

  const togglePomodoro = () => {
    setPomodoroRunning(!pomodoroRunning);
  };

  const completedCount = todos.filter((t: any) => t.isCompleted).length;
  const taskCompletionRate = todos.length > 0 ? Math.round((completedCount / todos.length) * 100) : 0;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', padding: '10px 14px', gap: '10px', height: '100%', boxSizing: 'border-box', overflow: 'hidden' }}>
      
      {/* Widget 1: Son Dosyalar */}
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        <div style={{ fontSize: '0.66rem', fontWeight: 800, color: colors.text.muted, borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '3px', marginBottom: '6px', letterSpacing: '0.05em' }}>
          📄 DOSYALAR
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.68rem', color: colors.text.secondary, overflowY: 'auto', flex: 1 }}>
          {notes.slice(0, 3).map((n: any) => (
            <div key={n.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              <span>📝</span>
              <span>{n.title}</span>
            </div>
          ))}
          {notes.length === 0 && <span style={{ color: colors.text.muted }}>Dosya bulunmuyor.</span>}
        </div>
      </div>

      {/* Widget 2: Productivity Score */}
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: 'rgba(255,255,255,0.01)', borderRadius: '8px', border: `1px solid ${colors.border.glass}`, padding: '6px' }}>
        <div style={{ fontSize: '0.64rem', color: colors.text.secondary, fontWeight: 700 }}>VERİMLİLİK</div>
        <div style={{ fontSize: '1.2rem', fontWeight: 800, color: colors.accent.cyan, marginTop: '2px' }}>%{taskCompletionRate}</div>
        <div style={{ fontSize: '0.58rem', color: colors.text.muted, marginTop: '2px' }}>Günlük Görev Oranı</div>
      </div>

      {/* Widget 3: Pomodoro */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.01)', borderRadius: '8px', border: `1px solid ${colors.border.glass}`, padding: '6px' }}>
        <div style={{ fontSize: '0.64rem', color: colors.text.secondary, fontWeight: 700 }}>FOCUS TIMER</div>
        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: colors.accent.purpleLight, margin: '2px 0' }}>
          {String(pomodoroMinutes).padStart(2, '0')}:{String(pomodoroSeconds).padStart(2, '0')}
        </div>
        <button 
          onClick={togglePomodoro}
          style={{ fontSize: '0.58rem', background: 'rgba(124, 58, 237, 0.15)', border: '1px solid rgba(124, 58, 237, 0.25)', color: colors.accent.purpleLight, padding: '2px 8px', borderRadius: '4px', cursor: 'pointer' }}
        >
          {pomodoroRunning ? 'Durdur' : 'Başlat'}
        </button>
      </div>

      {/* Widget 4: Git Status Placeholder */}
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '6px' }}>
        <div style={{ fontSize: '0.66rem', fontWeight: 800, color: colors.text.muted, borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '3px', marginBottom: '6px', letterSpacing: '0.05em' }}>
          ⌥ GIT STATS
        </div>
        <div style={{ fontSize: '0.68rem', color: colors.text.secondary }}>
          Branch: <span style={{ fontWeight: 600, color: colors.accent.cyan }}>main</span>
        </div>
        <div style={{ fontSize: '0.6rem', color: colors.text.muted, marginTop: '2px' }}>
          Status: Synced (local placeholder)
        </div>
      </div>

      {/* Widget 5: Workspace Status */}
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '6px' }}>
        <div style={{ fontSize: '0.66rem', fontWeight: 800, color: colors.text.muted, borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '3px', marginBottom: '6px', letterSpacing: '0.05em' }}>
          📁 WORKSPACE
        </div>
        <div style={{ fontSize: '0.68rem', color: colors.accent.emerald, display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: colors.accent.emerald }} />
          Veritabanı Aktif
        </div>
        <div style={{ fontSize: '0.6rem', color: colors.text.muted, marginTop: '2px' }}>
          Safe & Synced
        </div>
      </div>

    </div>
  );
};

// ============================================================
// STATUS BAR (FOOTER)
// ============================================================
export const StatusBar: React.FC = () => {
  const { currentLanguage, selectedProviderName, selectedSystemVoiceName } = useChat();
  const [runtimeState, setRuntimeState] = useState(() => moniRuntime.getState());

  useEffect(() => {
    const unsubscribe = moniRuntime.subscribe((state) => {
      setRuntimeState(state);
    });
    return unsubscribe;
  }, []);

  return (
    <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.68rem', color: colors.text.secondary }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        
        {/* Workspace Mode */}
        <span style={{ background: 'rgba(124, 58, 237, 0.15)', color: colors.accent.purpleLight, padding: '1px 5px', borderRadius: '3px', fontWeight: 700 }}>
          👑 Exec Mode
        </span>

        {/* Provider */}
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          🤖 {selectedProviderName}
        </span>

        {/* System Voice */}
        <span>🔊 {selectedSystemVoiceName}</span>

        {/* TTS Provider */}
        <span>🗣️ TTS: {runtimeState.ttsProvider}</span>

        {/* Database state */}
        <span>💾 SQLite</span>

        {/* Language Badge */}
        <span>🌐 {currentLanguage === 'tr' ? 'Türkçe' : 'English'}</span>
        
        {/* Version */}
        <span>v5.0.0</span>

        {/* Connection */}
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: colors.accent.emerald }} />
          Connected
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span>💻 CPU 12%</span>
        <span>🧠 RAM 21%</span>
        <span>🕒 {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        <span style={{ color: colors.accent.emerald }}>Sağlıklı</span>
      </div>
    </div>
  );
};

// ============================================================
// COMMAND PALETTE
// ============================================================
export const CommandPalette: React.FC = () => {
  const { showCommandPalette, setShowCommandPalette } = useLayout();
  const { setActiveView } = useWorkspace();
  const [search, setSearch] = useState('');

  if (!showCommandPalette) return null;

  const commands = [
    { label: 'Ana Sayfaya Git', shortcut: 'G H', action: () => setActiveView('home') },
    { label: 'Sohbet Başlat', shortcut: 'G C', action: () => setActiveView('chat') },
    { label: 'Notları Yönet', shortcut: 'G N', action: () => setActiveView('workspace') },
    { label: 'Ayarları Yapılandır', shortcut: 'G S', action: () => setActiveView('settings') }
  ];

  const filtered = commands.filter(c => c.label.toLowerCase().includes(search.toLowerCase()));

  return (
    <div 
      onClick={() => setShowCommandPalette(false)}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        zIndex: 99999,
        display: 'flex',
        justifyContent: 'center',
        paddingTop: '100px'
      }}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '500px',
          background: '#0b0f19',
          border: `1px solid ${colors.border.glass}`,
          borderRadius: '16px',
          padding: '16px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}
      >
        <GlassInput 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Komut veya görünüm arayın..."
          autoFocus
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '250px', overflowY: 'auto' }}>
          {filtered.map((cmd, idx) => (
            <div
              key={idx}
              onClick={() => {
                cmd.action();
                setShowCommandPalette(false);
              }}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '8px 12px',
                borderRadius: '8px',
                cursor: 'pointer',
                background: 'rgba(255, 255, 255, 0.02)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'}
            >
              <span style={{ fontSize: '0.82rem' }}>{cmd.label}</span>
              <kbd style={{ background: 'rgba(255,255,255,0.08)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.65rem' }}>{cmd.shortcut}</kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
