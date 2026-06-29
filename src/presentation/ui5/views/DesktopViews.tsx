import React, { useState } from 'react';
import { useWorkspace } from '../providers/WorkspaceProvider';
import { useChat } from '../providers/ChatContext';
import { colors } from '../tokens/colors';
import { GlassCard, GlassButton, GlassInput, EmptyState } from '../components/GlassComponents';
import { MetricCard, SectionTitle, InfoCard } from '../components/Indicators';
import { TypingIndicator, SuggestionChip } from '../components/ChatComponents';
import { MoniAvatar } from '../components/MoniAvatar';
import { databaseService } from '../../../data/db/LocalDatabase';
import { VoiceService } from '../../../data/services/VoiceService';

export const HomeView: React.FC = () => {
  const { memories, todos, notes, setActiveView } = useWorkspace();

  const userName = memories.find(m => m.category === 'name' || m.key === 'userName')?.content || 'Metin';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Günaydın' : hour < 18 ? 'Merhaba' : 'İyi Akşamlar';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Premium visionOS Hero Banner */}
      <GlassCard style={{ background: `linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(6, 182, 212, 0.05))`, padding: '24px' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 700, margin: 0 }}>
          {greeting}, {userName}! 👋
        </h1>
        <p style={{ fontSize: '0.86rem', color: colors.text.secondary, marginTop: '6px', maxWidth: '600px' }}>
          Bugün size nasıl yardımcı olabilirim? Çalışma alanınızdaki projeleri analiz edebilir, notlar çıkarabilir veya sesli komutlarınızla iş akışlarınızı yönetebilirim.
        </p>
      </GlassCard>

      {/* KPI Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <MetricCard title="Aktif Görevler" value={`${todos.filter((t: any) => !t.isCompleted).length} Adet`} percent={65} color={colors.accent.purple} />
        <MetricCard title="Çalışma Notları" value={`${notes.length} Dosya`} percent={80} color={colors.accent.cyan} />
        <MetricCard title="Hafıza Kayıtları" value={`${memories.length} Bilgi`} percent={45} color={colors.accent.emerald} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '20px' }}>
        {/* Quick Actions */}
        <GlassCard>
          <SectionTitle title="Hızlı İşlemler" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
            <GlassButton variant="primary" onClick={() => setActiveView('chat')}>💬 Yeni Sohbet Başlat</GlassButton>
            <GlassButton onClick={() => setActiveView('workspace')}>📝 Not Defterini Aç</GlassButton>
            <GlassButton onClick={() => setActiveView('tasks')}>✅ Görev Panosunu İncele</GlassButton>
          </div>
        </GlassCard>

        {/* Proactive suggestions */}
        <GlassCard>
          <SectionTitle title="Akıllı Öneriler" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
            <InfoCard type="info">
              <strong>Yapay Zeka Raporları:</strong> 'reports/' klasöründeki sistem analizlerini incelemek ister misiniz?
            </InfoCard>
            <InfoCard type="success">
              <strong>Performans İyileştirmesi:</strong> SQLite veritabanındaki 3 eski görev arşivlendi.
            </InfoCard>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export const ChatView: React.FC = () => {
  const { messages, sendMessage, moniStatus, currentLanguage, setMessages } = useChat();
  const [inputText, setInputText] = useState('');
  const [selectedConvId, setSelectedConvId] = useState('1');
  const [searchQuery, setSearchQuery] = useState('');
  const [characterCount, setCharacterCount] = useState(0);

  // Dynamic conversation tabs
  const [tabs, setTabs] = useState([
    { id: '1', title: 'Yeni proje mimarisi' },
    { id: '2', title: 'Veritabanı optimizasyonu' },
    { id: '3', title: 'API Tasarımı' }
  ]);
  const [activeTabId, setActiveTabId] = useState('1');

  const mockConversations = [
    { id: '1', title: 'Yeni proje mimarisi', snippet: 'Proje yapımızı birlikte planlayalım...', time: '11:45', section: 'Bugün' },
    { id: '2', title: 'Veritabanı optimizasyonu', snippet: 'Index ve query performansı...', time: '10:30', section: 'Bugün' },
    { id: '3', title: 'AI özellik roadmap', snippet: 'Gelecek özellikleri konuşalım...', time: '09:15', section: 'Bugün' },
    { id: '4', title: 'Frontend düzenlemeler', snippet: 'Dashboard tasarım değişiklikleri...', time: 'Dün', section: 'Dün' },
    { id: '5', title: 'API dokümantasyonu', snippet: 'Endpoint yapısı ve örnekler...', time: 'Dün', section: 'Dün' },
    { id: '6', title: 'Eski yedekleme planı', snippet: 'SQLite veri aktarım adımları...', time: '3 gün önce', section: 'Daha Eski' }
  ];

  const handleSend = async () => {
    if (!inputText.trim()) return;
    const txt = inputText;
    setInputText('');
    setCharacterCount(0);
    await sendMessage(txt);
  };

  const handleSuggest = (topic: string) => {
    setInputText(topic);
    setCharacterCount(topic.length);
  };

  const handleNewChat = async () => {
    setMessages([]);
    await databaseService.clearChatHistory();
  };

  const handleCloseTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const nextTabs = tabs.filter(t => t.id !== id);
    setTabs(nextTabs);
    if (activeTabId === id && nextTabs.length > 0) {
      setActiveTabId(nextTabs[0].id);
    }
  };

  const handleAddTab = () => {
    const newId = String(Date.now());
    setTabs([...tabs, { id: newId, title: 'Yeni Sohbet' }]);
    setActiveTabId(newId);
  };

  const filteredConversations = mockConversations.filter(c =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.snippet.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sections = ['Bugün', 'Dün', 'Daha Eski'];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '16px', height: '100%', minHeight: '550px' }}>
      
      {/* SOHBETLER Sidebar Panel */}
      <GlassCard style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px', height: '100%', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.86rem', fontWeight: 700, color: colors.text.secondary }}>SOHBETLER</span>
          <GlassButton onClick={handleNewChat} style={{ fontSize: '0.7rem', padding: '4px 8px' }}>+ Yeni Sohbet</GlassButton>
        </div>

        <GlassInput 
          placeholder="Sohbetlerde ara..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ fontSize: '0.78rem', padding: '6px 10px' }}
        />

        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '4px' }}>
          {sections.map(section => {
            const items = filteredConversations.filter(c => c.section === section);
            if (items.length === 0) return null;

            return (
              <div key={section} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, color: colors.text.muted, textTransform: 'uppercase', letterSpacing: '0.05em', paddingLeft: '4px' }}>
                  {section}
                </div>
                {items.map(chat => {
                  const active = selectedConvId === chat.id;
                  return (
                    <div
                      key={chat.id}
                      onClick={() => {
                        setSelectedConvId(chat.id);
                        // Open as tab if not exists
                        if (!tabs.find(t => t.title === chat.title)) {
                          setTabs([...tabs, { id: chat.id, title: chat.title }]);
                        }
                        setActiveTabId(chat.id);
                      }}
                      style={{
                        padding: '10px',
                        borderRadius: '8px',
                        background: active ? 'rgba(124, 58, 237, 0.15)' : 'transparent',
                        border: active ? `1px solid rgba(124, 58, 237, 0.25)` : '1px solid transparent',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        if (!active) {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!active) {
                          e.currentTarget.style.background = 'transparent';
                        }
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.78rem', fontWeight: 600, color: active ? colors.accent.purpleLight : '#fff' }}>{chat.title}</span>
                        <span style={{ fontSize: '0.64rem', color: colors.text.muted }}>{chat.time}</span>
                      </div>
                      <span style={{ fontSize: '0.68rem', color: colors.text.secondary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{chat.snippet}</span>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </GlassCard>

      {/* Main Conversation Workspace Pane */}
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '10px', boxSizing: 'border-box' }}>
        
        {/* 1. Conversation Tabs */}
        <div style={{ display: 'flex', gap: '6px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '6px', overflowX: 'auto', alignItems: 'center' }}>
          {tabs.map(tab => {
            const active = activeTabId === tab.id;
            return (
              <div
                key={tab.id}
                onClick={() => setActiveTabId(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  background: active ? 'rgba(124, 58, 237, 0.15)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${active ? 'rgba(124, 58, 237, 0.25)' : 'rgba(255,255,255,0.05)'}`,
                  fontSize: '0.74rem',
                  cursor: 'pointer',
                  color: active ? '#fff' : colors.text.secondary,
                  whiteSpace: 'nowrap'
                }}
              >
                <span>{tab.title}</span>
                <span onClick={(e) => handleCloseTab(tab.id, e)} style={{ fontSize: '0.65rem', color: colors.text.muted, padding: '0 2px' }}>✕</span>
              </div>
            );
          })}
          <GlassButton onClick={handleAddTab} style={{ padding: '4px 10px', fontSize: '0.72rem' }}>+ Yeni</GlassButton>
        </div>

        {/* 2. Chat Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.01)', border: `1px solid ${colors.border.glass}`, borderRadius: '12px', padding: '8px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.86rem', fontWeight: 700, color: '#fff' }}>
              {tabs.find(t => t.id === activeTabId)?.title || 'Sohbet Odası'}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '10px', fontSize: '0.86rem', color: colors.text.secondary }}>
            <span style={{ cursor: 'pointer' }} title="Favori">⭐</span>
            <span style={{ cursor: 'pointer' }} title="Sabitle">📌</span>
            <span style={{ cursor: 'pointer' }} title="Daha fazla">•••</span>
          </div>
        </div>

        {/* 3. Messages Area */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px', paddingRight: '4px' }}>
          {messages.length === 0 ? (
            /* Empty Chat Premium Welcome Dashboard */
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '20px', textAlign: 'center', padding: '20px' }}>
              <MoniAvatar state={moniStatus} size={120} />
              <div>
                <h2 style={{ margin: '0 0 6px 0', fontSize: '1.2rem', color: '#fff' }}>Merhaba Metin!</h2>
                <p style={{ margin: 0, fontSize: '0.82rem', color: colors.text.secondary, maxWidth: '380px' }}>
                  Ben MONI AI. Bugün size nasıl yardımcı olabilirim? Aşağıdaki hızlı başlangıç butonlarını kullanarak hızlıca başlayabiliriz.
                </p>
              </div>

              {/* Quick Start Buttons Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', width: '100%', maxWidth: '440px', marginTop: '10px' }}>
                <div 
                  onClick={() => handleSuggest('Teknoloji yığını oluştur')}
                  style={{ background: 'rgba(255,255,255,0.01)', border: `1px solid ${colors.border.glass}`, borderRadius: '10px', padding: '10px', fontSize: '0.76rem', cursor: 'pointer', textAlign: 'left' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.01)'}
                >
                  <strong>💻 Teknoloji Yığını</strong>
                  <div style={{ fontSize: '0.66rem', color: colors.text.muted, marginTop: '2px' }}>Proje altyapı mimarisini tasarlayın.</div>
                </div>
                <div 
                  onClick={() => handleSuggest('Alternatif çözüm üret')}
                  style={{ background: 'rgba(255,255,255,0.01)', border: `1px solid ${colors.border.glass}`, borderRadius: '10px', padding: '10px', fontSize: '0.76rem', cursor: 'pointer', textAlign: 'left' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.01)'}
                >
                  <strong>🛠️ Alternatif Mimari</strong>
                  <div style={{ fontSize: '0.66rem', color: colors.text.muted, marginTop: '2px' }}>Farklı mimari seçenekleri karşılaştırın.</div>
                </div>
              </div>
            </div>
          ) : (
            messages.map((m: any) => {
              const isAssistant = m.role === 'assistant';
              return (
                <div key={m.id} style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignSelf: isAssistant ? 'flex-start' : 'flex-end', maxWidth: '85%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.7rem', color: colors.text.muted }}>
                    <span>{isAssistant ? '🤖 MONI' : '👤 Metin'}</span>
                    <span>•</span>
                    <span>{new Date(m.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  <div 
                    style={{
                      background: isAssistant ? 'rgba(255,255,255,0.02)' : 'rgba(124, 58, 237, 0.1)',
                      border: `1px solid ${isAssistant ? colors.border.glass : 'rgba(124, 58, 237, 0.2)'}`,
                      borderRadius: '12px',
                      padding: '12px',
                      fontSize: '0.84rem',
                      color: '#fff',
                      lineHeight: '1.5',
                      position: 'relative'
                    }}
                  >
                    {m.content}

                    {/* Interactive overlay tools for messages */}
                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '6px', fontSize: '0.74rem', color: colors.text.muted }}>
                      <span style={{ cursor: 'pointer' }} title="Kopyala" onClick={() => navigator.clipboard.writeText(m.content)}>📋 Kopyala</span>
                      {isAssistant && <span style={{ cursor: 'pointer' }} title="Seslendir" onClick={() => VoiceService.speakBrowser(m.content)}>🔊 Dinle</span>}
                      {!isAssistant && <span style={{ cursor: 'pointer' }} title="Yeniden Dene">🔄 Yenile</span>}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          {moniStatus === 'thinking' && <TypingIndicator />}
        </div>

        {/* 4. Suggestion Chips */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '4px 0' }}>
          <SuggestionChip label="Teknoloji yığını oluştur" onClick={() => handleSuggest('Teknoloji yığını oluştur')} />
          <SuggestionChip label="Alternatif çözüm üret" onClick={() => handleSuggest('Alternatif çözüm üret')} />
          <SuggestionChip label="Kod örneği oluştur" onClick={() => handleSuggest('Kod örneği oluştur')} />
          <SuggestionChip label="Summarize" onClick={() => handleSuggest('Summarize')} />
        </div>

        {/* 5. Message Composer Container */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', background: 'rgba(0,0,0,0.3)', padding: '10px 14px', borderRadius: '16px', border: `1px solid ${colors.border.glass}` }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button style={{ background: 'transparent', border: 'none', color: colors.text.secondary, fontSize: '1.1rem', cursor: 'pointer' }}>📎</button>
            
            <textarea
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                setCharacterCount(e.target.value.length);
              }}
              placeholder={currentLanguage === 'en' ? "Write a prompt..." : "Mesajınızı yazın..."}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              rows={Math.min(5, Math.max(1, inputText.split('\n').length))}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                color: '#fff',
                fontSize: '0.84rem',
                outline: 'none',
                resize: 'none',
                fontFamily: 'inherit',
                padding: '4px 0'
              }}
            />

            <button style={{ background: 'transparent', border: 'none', color: colors.text.secondary, fontSize: '1.1rem', cursor: 'pointer' }}>🎙️</button>
            <GlassButton variant="primary" onClick={handleSend} style={{ borderRadius: '50%', width: '32px', height: '32px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              ✈️
            </GlassButton>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: '0.62rem', color: colors.text.muted }}>
            {characterCount} / 2000 karakter
          </div>
        </div>

      </div>

    </div>
  );
};

export const WorkspaceView: React.FC = () => {
  const { notes, refreshData } = useWorkspace();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleAddNote = async () => {
    if (!title.trim() || !content.trim()) return;
    await databaseService.saveNote({
      id: 'note-' + Date.now(),
      title,
      content,
      dateTime: new Date()
    });
    setTitle('');
    setContent('');
    refreshData();
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '20px', height: '100%' }}>
      {/* Create note */}
      <GlassCard>
        <SectionTitle title="Yeni Not Ekle" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
          <GlassInput value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Başlık" />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="İçerik..."
            style={{ height: '150px', background: 'rgba(0,0,0,0.3)', border: `1px solid ${colors.border.input}`, borderRadius: '12px', padding: '10px', color: '#fff', outline: 'none' }}
          />
          <GlassButton variant="primary" onClick={handleAddNote}>Notu Kaydet</GlassButton>
        </div>
      </GlassCard>

      {/* Note listing */}
      <GlassCard style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <SectionTitle title="Kayıtlı Notlar" />
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {notes.length === 0 ? (
            <EmptyState title="Not Yok" desc="Henüz çalışma alanında kayıtlı not bulunmuyor." icon="📝" />
          ) : (
            notes.map((n: any) => (
              <div key={n.id} style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', border: `1px solid ${colors.border.glass}` }}>
                <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#fff' }}>{n.title}</div>
                <div style={{ fontSize: '0.78rem', color: colors.text.secondary, marginTop: '4px' }}>{n.content}</div>
              </div>
            ))
          )}
        </div>
      </GlassCard>
    </div>
  );
};

export const ProjectsView: React.FC = () => (
  <GlassCard>
    <SectionTitle title="Proje Dosyaları" />
    <InfoCard type="info">
      Tüm yerel proje dosyalarınız <code>c:\Users\user\Desktop\moni</code> altında taranıyor.
    </InfoCard>
    <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem' }}>
      <div>📁 src/core/knowledge (5 files)</div>
      <div>📁 src/presentation/ui5 (12 components)</div>
      <div>📁 reports/ (9 output briefs)</div>
    </div>
  </GlassCard>
);

export const TaskView: React.FC = () => {
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

  return (
    <GlassCard style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <SectionTitle title="Görev Listesi / Checklist" />
      <div style={{ display: 'flex', gap: '8px' }}>
        <GlassInput value={taskText} onChange={(e) => setTaskText(e.target.value)} placeholder="Yeni görev ekle..." />
        <GlassButton variant="primary" onClick={handleAddTodo}>Ekle</GlassButton>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
        {todos.length === 0 ? (
          <EmptyState title="Görev Bulunmuyor" desc="Tebrikler! Bütün yapılacaklar listesini tamamladınız." icon="✅" />
        ) : (
          todos.map((t: any) => (
            <div 
              key={t.id} 
              onClick={() => handleToggle(t)}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '8px', cursor: 'pointer' }}
            >
              <input type="checkbox" checked={t.isCompleted} readOnly style={{ cursor: 'pointer' }} />
              <span style={{ fontSize: '0.84rem', textDecoration: t.isCompleted ? 'line-through' : 'none', color: t.isCompleted ? colors.text.muted : '#fff' }}>{t.task}</span>
            </div>
          ))
        )}
      </div>
    </GlassCard>
  );
};

export const MemoryView: React.FC = () => {
  const { memories, refreshData } = useWorkspace();

  const handleClear = async () => {
    await databaseService.clearMemories();
    refreshData();
  };

  return (
    <GlassCard style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <SectionTitle title="SQLite Hafıza Kayıtları" />
        <GlassButton variant="danger" onClick={handleClear} style={{ fontSize: '0.72rem', padding: '4px 8px' }}>Hafızayı Sıfırla</GlassButton>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
        {memories.length === 0 ? (
          <EmptyState title="Boş Hafıza" desc="Benimle konuştukça sizin hakkınızda önemli bilgileri buraya kaydedeceğim." icon="🧠" />
        ) : (
          memories.map((m: any) => (
            <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: `1px solid ${colors.border.glass}`, fontSize: '0.8rem' }}>
              <span style={{ fontWeight: 600, color: colors.accent.cyan }}>{m.category}:</span>
              <span>{m.content}</span>
            </div>
          ))
        )}
      </div>
    </GlassCard>
  );
};

export const SettingsView: React.FC = () => {
  const { selectedProviderName, setSelectedProviderName, currentLanguage, setCurrentLanguage, autoSpeakEnabled, setAutoSpeakEnabled, clearChatHistory } = useChat();

  return (
    <GlassCard style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <SectionTitle title="MONI Ayarları" />

      {/* MONI Official Identity branding area */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: `1px solid ${colors.border.glass}` }}>
        <MoniAvatar state="idle" size={70} />
        <div>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>MONI AI Asistan</div>
          <div style={{ fontSize: '0.74rem', color: colors.text.secondary }}>Yaş: 25-30 | Dijital Kimlik: Aktif</div>
          <div style={{ fontSize: '0.72rem', color: colors.text.muted, marginTop: '2px' }}>Zeki, profesyonel, samimi ve güler yüzlü çalışma alanı yöneticiniz.</div>
        </div>
      </div>

      {/* AI Provider selector */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>Yapay Zeka Motoru</div>
          <div style={{ fontSize: '0.74rem', color: colors.text.secondary }}>Gemini, OpenAI veya Groq motorları arasında geçiş yapın.</div>
        </div>
        <select
          value={selectedProviderName}
          onChange={(e) => {
            setSelectedProviderName(e.target.value);
            localStorage.setItem('moni_selected_provider', e.target.value);
          }}
          style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '6px 12px', borderRadius: '8px', outline: 'none' }}
        >
          <option value="auto">Otomatik Waterfall</option>
          <option value="gemini">Gemini 2.5 Flash</option>
          <option value="openai">OpenAI GPT-4o-mini</option>
          <option value="groq">Groq (Llama-3.3)</option>
          <option value="local">Sadece Yerel FAQ</option>
        </select>
      </div>

      {/* Language */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>Sistem Dili</div>
          <div style={{ fontSize: '0.74rem', color: colors.text.secondary }}>Tüm menülerin ve sesin varsayılan dili.</div>
        </div>
        <select
          value={currentLanguage}
          onChange={(e) => {
            const lang = e.target.value as 'tr' | 'en';
            setCurrentLanguage(lang);
            localStorage.setItem('moni_language', lang);
          }}
          style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '6px 12px', borderRadius: '8px', outline: 'none' }}
        >
          <option value="tr">Türkçe (TR)</option>
          <option value="en">English (EN)</option>
        </select>
      </div>

      {/* Auto Speak */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>Otomatik Sesli Yanıt (TTS)</div>
          <div style={{ fontSize: '0.74rem', color: colors.text.secondary }}>Cevapları otomatik olarak sesli olarak okur.</div>
        </div>
        <input 
          type="checkbox" 
          checked={autoSpeakEnabled} 
          onChange={(e) => {
            setAutoSpeakEnabled(e.target.checked);
            localStorage.setItem('moni_auto_speak', String(e.target.checked));
          }}
          style={{ width: '18px', height: '18px', cursor: 'pointer' }}
        />
      </div>

      {/* Browser TTS Direct Test */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>Tarayıcı Ses Testi</div>
          <div style={{ fontSize: '0.74rem', color: colors.text.secondary }}>Ses çıkışını doğrulamak ve ses motorunu etkinleştirmek için tıklayın.</div>
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
          style={{ padding: '6px 16px', fontSize: '0.8rem' }}
        >
          🔊 Tarayıcı Ses Testi
        </GlassButton>
      </div>

      {/* Clear Chat History */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>Sohbet Geçmişini Temizle</div>
          <div style={{ fontSize: '0.74rem', color: colors.text.secondary }}>Tüm sohbet geçmişini sıfırlayarak yeni bir sohbet başlatın.</div>
        </div>
        <GlassButton
          variant="danger"
          onClick={async () => {
            if (window.confirm("Sohbet geçmişini silmek istediğinize emin misiniz?")) {
              await clearChatHistory();
            }
          }}
          style={{ padding: '6px 16px', fontSize: '0.8rem' }}
        >
          🗑️ Geçmişi Temizle
        </GlassButton>
      </div>
    </GlassCard>
  );
};

export const HelpView: React.FC = () => (
  <GlassCard>
    <SectionTitle title="Kullanıcı Kılavuzu & FAQ" />
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
      <div>
        <strong style={{ color: colors.accent.cyan }}>• Ctrl + P Komut Arama:</strong>
        <p style={{ fontSize: '0.8rem', color: colors.text.secondary, margin: '4px 0 0 12px' }}>Arayüzün üstündeki arama çubuğuna tıklayarak veya klavyeden Ctrl+P tuşlarına basarak tüm komutları çalıştırabilirsiniz.</p>
      </div>
      <div>
        <strong style={{ color: colors.accent.cyan }}>• Wake Word (Uyandırma):</strong>
        <p style={{ fontSize: '0.8rem', color: colors.text.secondary, margin: '4px 0 0 12px' }}>Mikrofon izni açıkken asistanınızı "Moni" diyerek uyandırabilirsiniz.</p>
      </div>
    </div>
  </GlassCard>
);
