import React, { useState, useEffect } from 'react';
import { useChat } from '../providers/ChatContext';
import { useWorkspace } from '../providers/WorkspaceProvider';
import { colors } from '../tokens/colors';
import { GlassCard, GlassButton, GlassInput, EmptyState } from '../components/GlassComponents';
import { Orb } from '../components/Orb';
import { TypingIndicator } from '../components/ChatComponents';
import { databaseService } from '../../../data/db/LocalDatabase';

// ============================================================
// MOBILE HOME
// ============================================================
export const MobileHome: React.FC<{ onNavigate: (view: string) => void }> = ({ onNavigate }) => {
  const { memories, todos, refreshData } = useWorkspace();
  const { moniStatus, selectedProviderName } = useChat();
  const userName = memories.find(m => m.category === 'name' || m.key === 'userName')?.content || 'Metin';

  useEffect(() => {
    refreshData();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '24px' }}>
      
      {/* 1. Mobile top header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '10px' }}>
        <span style={{ fontSize: '1.1rem', fontWeight: 800, background: `linear-gradient(135deg, ${colors.accent.purple}, ${colors.accent.cyan})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '0.05em' }}>
          MONI Companion
        </span>
        <span style={{ fontSize: '0.62rem', background: 'rgba(255,255,255,0.05)', color: colors.text.secondary, padding: '2px 6px', borderRadius: '4px' }}>
          {selectedProviderName.toUpperCase()}
        </span>
      </div>

      {/* 2. Personalized greeting */}
      <div style={{ textAlign: 'center', marginTop: '4px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#fff' }}>Merhaba, {userName}!</h2>
        <span style={{ fontSize: '0.74rem', color: colors.text.secondary }}>Sesli asistanı açmak için Orb'a dokunun.</span>
      </div>

      {/* 3. Large Animated Orb */}
      <div style={{ display: 'flex', justifyContent: 'center', margin: '14px 0' }}>
        <Orb state={moniStatus} size={130} onClick={() => onNavigate('voice')} />
      </div>

      {/* 4. Executive strip cards */}
      <GlassCard style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '12px' }}>
        <span style={{ fontSize: '0.66rem', fontWeight: 800, color: colors.text.muted, textTransform: 'uppercase' }}>Bugünün Özeti</span>
        <span style={{ fontSize: '0.76rem', color: colors.text.secondary }}>
          Bugün planlanan <strong>{todos.filter((t: any) => !t.isCompleted).length} aktif göreviniz</strong> var.
        </span>
      </GlassCard>

      {/* 5. Quick Actions Grid */}
      <div>
        <span style={{ fontSize: '0.68rem', fontWeight: 800, color: colors.text.muted, textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>HIZLI İŞLEMLER</span>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
          {[
            { label: 'Konuş', icon: '🎙️', view: 'voice' },
            { label: 'Yaz', icon: '💬', view: 'chat' },
            { label: 'Görevler', icon: '✅', view: 'tasks' },
            { label: 'Bellek', icon: '🧠', view: 'memory' },
            { label: 'Ayarlar', icon: '⚙️', view: 'settings' }
          ].map(action => (
            <div
              key={action.label}
              onClick={() => onNavigate(action.view)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '10px 4px',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.01)',
                border: `1px solid ${colors.border.glass}`,
                cursor: 'pointer'
              }}
            >
              <span style={{ fontSize: '1.2rem', marginBottom: '2px' }}>{action.icon}</span>
              <span style={{ fontSize: '0.68rem', color: colors.text.secondary }}>{action.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 6. System Status mini row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(255,255,255,0.01)', borderRadius: '6px', padding: '6px 10px', fontSize: '0.62rem', color: colors.text.muted }}>
        <span>Uptime: %100</span>
        <span>SQLite: Connected</span>
        <span>Secure Lock</span>
      </div>

    </div>
  );
};

// ============================================================
// MOBILE CHAT
// ============================================================
export const MobileChat: React.FC = () => {
  const { messages, sendMessage, moniStatus, currentLanguage } = useChat();
  const [inputText, setInputText] = useState('');

  const handleSend = async () => {
    if (!inputText.trim()) return;
    const txt = inputText;
    setInputText('');
    await sendMessage(txt);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)', boxSizing: 'border-box' }}>
      
      {/* Messages Stream */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '4px', marginBottom: '10px' }}>
        {messages.length === 0 ? (
          <EmptyState title="Sohbet Boş" desc="Moni ile sohbet etmek için aşağıdan mesaj yazın." icon="💬" />
        ) : (
          messages.map((m: any) => {
            const isAssistant = m.role === 'assistant';
            return (
              <div 
                key={m.id} 
                style={{ 
                  alignSelf: isAssistant ? 'flex-start' : 'flex-end', 
                  maxWidth: '85%', 
                  background: isAssistant ? 'rgba(255,255,255,0.02)' : 'rgba(124, 58, 237, 0.15)',
                  border: `1px solid ${isAssistant ? colors.border.glass : 'rgba(124, 58, 237, 0.25)'}`,
                  borderRadius: '12px',
                  padding: '10px',
                  fontSize: '0.78rem',
                  color: '#fff',
                  lineHeight: '1.4'
                }}
              >
                {m.content}
              </div>
            );
          })
        )}
        {moniStatus === 'thinking' && <TypingIndicator />}
      </div>

      {/* Floating Bottom Composer */}
      <div style={{ display: 'flex', gap: '8px', background: 'rgba(0,0,0,0.3)', padding: '8px', borderRadius: '14px', border: `1px solid ${colors.border.glass}` }}>
        <button style={{ background: 'transparent', border: 'none', color: colors.text.secondary, fontSize: '1rem' }}>📎</button>
        <GlassInput 
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={currentLanguage === 'en' ? "Message..." : "Mesaj..."}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          style={{ fontSize: '0.78rem', padding: '6px 10px' }}
        />
        <button style={{ background: 'transparent', border: 'none', color: colors.text.secondary, fontSize: '1rem' }}>🎙️</button>
        <GlassButton variant="primary" onClick={handleSend} style={{ fontSize: '0.74rem', padding: '6px 12px' }}>✈️</GlassButton>
      </div>

    </div>
  );
};

// ============================================================
// MOBILE VOICE
// ============================================================
export const MobileVoice: React.FC<{ onNavigate: (view: string) => void }> = ({ onNavigate }) => {
  const { moniStatus, setMoniStatus } = useChat();
  const [transcript] = useState('Konuşun...');

  const handleStop = () => {
    setMoniStatus('idle');
    onNavigate('home');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)', justifyContent: 'space-between', alignItems: 'center', padding: '20px 0' }}>
      
      {/* Status top text */}
      <div style={{ fontSize: '0.8rem', color: colors.text.secondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {moniStatus === 'listening' ? 'Dinleniyor...' : moniStatus === 'thinking' ? 'Düşünülüyor...' : 'Sesli Mod Hazır'}
      </div>

      {/* Center Orb */}
      <Orb state={moniStatus} size={160} />

      {/* Wave animation */}
      <div style={{ display: 'flex', gap: '4px', height: '24px', alignItems: 'center' }}>
        <span style={{ width: '3px', height: '6px', background: colors.accent.cyan, borderRadius: '2px' }} />
        <span style={{ width: '3px', height: '14px', background: colors.accent.purple, borderRadius: '2px' }} />
        <span style={{ width: '3px', height: '8px', background: colors.accent.cyan, borderRadius: '2px' }} />
        <span style={{ width: '3px', height: '4px', background: colors.accent.emerald, borderRadius: '2px' }} />
      </div>

      {/* Live transcript Box */}
      <GlassCard style={{ width: '85%', textAlign: 'center', padding: '12px' }}>
        <span style={{ fontSize: '0.8rem', color: '#fff' }}>{transcript}</span>
      </GlassCard>

      {/* Control Dock buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '16px' }}>
          <GlassButton variant="danger" onClick={handleStop} style={{ borderRadius: '50%', width: '46px', height: '46px', padding: 0 }}>✕</GlassButton>
          <GlassButton onClick={() => setMoniStatus('listening')} style={{ borderRadius: '50%', width: '46px', height: '46px', padding: 0 }}>🎙️</GlassButton>
        </div>
        <GlassButton 
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
          style={{ fontSize: '0.72rem', padding: '6px 12px', marginTop: '4px' }}
        >
          Tarayıcı Ses Testi
        </GlassButton>
      </div>

    </div>
  );
};

// ============================================================
// MOBILE TASKS
// ============================================================
export const MobileTasks: React.FC = () => {
  const { todos, refreshData } = useWorkspace();
  const [taskText, setTaskText] = useState('');

  const handleAddTodo = async () => {
    if (!taskText.trim()) return;
    await databaseService.saveTodo({
      id: 'todo-' + Date.now(),
      task: taskText,
      isCompleted: false,
      dateTime: new Date(),
      priority: 'medium'
    });
    setTaskText('');
    refreshData();
  };

  const handleToggle = async (t: any) => {
    await databaseService.saveTodo({
      ...t,
      isCompleted: !t.isCompleted
    });
    refreshData();
  };

  const activeTasks = todos.filter((t: any) => !t.isCompleted);
  const completedCount = todos.filter((t: any) => t.isCompleted).length;
  const progress = todos.length > 0 ? Math.round((completedCount / todos.length) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>Görev Planı</h3>

      {/* Progress Bar */}
      <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '6px', padding: '8px', border: `1px solid ${colors.border.glass}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.66rem', color: colors.text.secondary, marginBottom: '4px' }}>
          <span>Tamamlanma Oranı</span>
          <span>%{progress}</span>
        </div>
        <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
          <div style={{ width: `${progress}%`, height: '100%', background: colors.accent.purple }} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '6px' }}>
        <GlassInput value={taskText} onChange={(e) => setTaskText(e.target.value)} placeholder="Yeni görev ekleyin..." style={{ fontSize: '0.76rem' }} />
        <GlassButton variant="primary" onClick={handleAddTodo} style={{ fontSize: '0.74rem' }}>Ekle</GlassButton>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
        {activeTasks.map((t: any) => (
          <div 
            key={t.id} 
            onClick={() => handleToggle(t)}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', background: 'rgba(255,255,255,0.01)', border: `1px solid ${colors.border.glass}`, borderRadius: '8px', cursor: 'pointer' }}
          >
            <input type="checkbox" checked={false} readOnly />
            <span style={{ fontSize: '0.76rem', color: '#fff' }}>{t.task}</span>
          </div>
        ))}
        {activeTasks.length === 0 && <div style={{ fontSize: '0.7rem', color: colors.text.muted, textAlign: 'center', marginTop: '10px' }}>Aktif görev bulunmuyor.</div>}
      </div>

    </div>
  );
};

// ============================================================
// MOBILE MEMORY
// ============================================================
export const MobileMemory: React.FC<{ onNavigate: (view: string) => void }> = ({ onNavigate }) => {
  const { memories, refreshData } = useWorkspace();
  const [search, setSearch] = useState('');

  const handleClearAll = async () => {
    if (window.confirm('Tüm hafıza kayıtlarını temizlemek istediğinize emin misiniz?')) {
      await databaseService.clearMemories();
      refreshData();
    }
  };

  const filtered = memories.filter(m => m.content.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>Bellek Kayıtları</h3>
        <button onClick={handleClearAll} style={{ background: 'transparent', border: 'none', color: colors.accent.rose, fontSize: '0.7rem', fontWeight: 600 }}>Tümünü Sil</button>
      </div>

      <GlassInput 
        placeholder="Hafızada ara..." 
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ fontSize: '0.76rem', padding: '6px 10px' }}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '350px', overflowY: 'auto' }}>
        {filtered.map((m: any) => (
          <div key={m.id} style={{ padding: '10px', background: 'rgba(255,255,255,0.01)', border: `1px solid ${colors.border.glass}`, borderRadius: '8px' }}>
            <span style={{ fontSize: '0.64rem', color: colors.accent.purpleLight, fontWeight: 700 }}>{m.key || 'Kayıt'}</span>
            <div style={{ fontSize: '0.74rem', color: '#fff', marginTop: '2px' }}>{m.content}</div>
          </div>
        ))}
        {filtered.length === 0 && <div style={{ fontSize: '0.7rem', color: colors.text.muted, textAlign: 'center' }}>Hafıza kaydı bulunmuyor.</div>}
      </div>

      <GlassButton onClick={() => onNavigate('home')} style={{ fontSize: '0.74rem', marginTop: '10px' }}>Ana Sayfaya Dön</GlassButton>
    </div>
  );
};

// ============================================================
// MOBILE SETTINGS
// ============================================================
export const MobileSettings: React.FC = () => {
  const { selectedProviderName, setSelectedProviderName, currentLanguage, setCurrentLanguage, selectedSystemVoiceName, setSelectedSystemVoiceName, clearChatHistory } = useChat();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>Ayarlar</h3>
      
      <GlassCard style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '12px' }}>
        
        {/* Provider */}
        <div>
          <span style={{ fontSize: '0.68rem', color: colors.text.muted, fontWeight: 700 }}>AI MOTORU</span>
          <select
            value={selectedProviderName}
            onChange={(e) => {
              setSelectedProviderName(e.target.value);
              localStorage.setItem('moni_selected_provider', e.target.value);
            }}
            style={{ width: '100%', background: '#0e0f19', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '6px', borderRadius: '6px', fontSize: '0.76rem', marginTop: '2px', outline: 'none' }}
          >
            <option value="auto">Otomatik (Waterfall)</option>
            <option value="gemini">Gemini 1.5 Pro</option>
            <option value="openai">OpenAI GPT-4o</option>
            <option value="local">Yerel Mod</option>
          </select>
        </div>

        {/* Language */}
        <div>
          <span style={{ fontSize: '0.68rem', color: colors.text.muted, fontWeight: 700 }}>DİL SEÇİMİ</span>
          <select
            value={currentLanguage}
            onChange={(e) => {
              const val = e.target.value as 'tr' | 'en';
              setCurrentLanguage(val);
              localStorage.setItem('moni_language', val);
            }}
            style={{ width: '100%', background: '#0e0f19', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '6px', borderRadius: '6px', fontSize: '0.76rem', marginTop: '2px', outline: 'none' }}
          >
            <option value="tr">Türkçe (TR)</option>
            <option value="en">English (EN)</option>
          </select>
        </div>

        {/* System voice */}
        <div>
          <span style={{ fontSize: '0.68rem', color: colors.text.muted, fontWeight: 700 }}>SES TONU</span>
          <select
            value={selectedSystemVoiceName}
            onChange={(e) => {
              setSelectedSystemVoiceName(e.target.value);
              localStorage.setItem('moni_selected_voice', e.target.value);
            }}
            style={{ width: '100%', background: '#0e0f19', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '6px', borderRadius: '6px', fontSize: '0.76rem', marginTop: '2px', outline: 'none' }}
          >
            <option value="Selin">Selin (Türkçe)</option>
            <option value="David">David (English)</option>
          </select>
        </div>

        {/* Clear Chat History */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px', marginTop: '4px' }}>
          <GlassButton
            variant="danger"
            onClick={async () => {
              if (window.confirm("Sohbet geçmişini silmek istediğinize emin misiniz?")) {
                await clearChatHistory();
              }
            }}
            style={{ width: '100%', fontSize: '0.74rem', padding: '6px' }}
          >
            🗑️ Sohbet Geçmişini Temizle
          </GlassButton>
        </div>

      </GlassCard>

      <div style={{ fontSize: '0.64rem', color: colors.text.muted, textAlign: 'center', marginTop: '10px' }}>
        MONI OS Companion v5.0.0 • SQLite Powered
      </div>
    </div>
  );
};

export default MobileHome;
