import React, { useState } from 'react';
import { colors } from '../tokens/colors';
import { Avatar } from './Indicators';

export const SuggestionChip: React.FC<{ label: string; onClick: () => void }> = ({ label, onClick }) => (
  <div
    onClick={onClick}
    style={{
      background: 'rgba(255, 255, 255, 0.03)',
      border: `1px solid ${colors.border.glass}`,
      color: colors.text.secondary,
      padding: '6px 12px',
      borderRadius: '20px',
      fontSize: '0.78rem',
      cursor: 'pointer',
      whiteSpace: 'nowrap',
      transition: 'all 0.15s ease'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.color = '#fff';
      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
      e.currentTarget.style.borderColor = colors.accent.cyan;
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.color = colors.text.secondary;
      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
      e.currentTarget.style.borderColor = colors.border.glass;
    }}
  >
    {label}
  </div>
);

export const TypingIndicator: React.FC = () => (
  <div style={{ display: 'flex', gap: '4px', padding: '12px 16px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px', width: 'fit-content' }}>
    <style>{`
      @keyframes blink { 0% { opacity: 0.2; } 50% { opacity: 1; } 100% { opacity: 0.2; } }
    `}</style>
    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fff', animation: 'blink 1.4s infinite 0.2s' }} />
    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fff', animation: 'blink 1.4s infinite 0.4s' }} />
    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fff', animation: 'blink 1.4s infinite 0.6s' }} />
  </div>
);

export const CodeRenderer: React.FC<{ code: string; lang?: string }> = ({ code, lang = 'javascript' }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ background: '#000000', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', overflow: 'hidden', margin: '8px 0', fontFamily: 'monospace' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#111827', padding: '6px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: '0.7rem', color: colors.text.secondary }}>
        <span>{lang}</span>
        <button onClick={handleCopy} style={{ background: 'transparent', border: 'none', color: copied ? colors.accent.emerald : colors.accent.cyan, cursor: 'pointer', fontSize: '0.68rem', fontWeight: 600 }}>
          {copied ? 'Copied! ✓' : 'Copy'}
        </button>
      </div>
      <pre style={{ margin: 0, padding: '12px', overflowX: 'auto', fontSize: '0.78rem', color: '#e5e7eb', lineHeight: 1.4 }}>{code}</pre>
    </div>
  );
};

export const MarkdownRenderer: React.FC<{ text: string }> = ({ text }) => {
  if (!text) return null;

  // Render code blocks nicely
  const parts = text.split(/(```[\s\S]*?```)/g);

  return (
    <div style={{ fontSize: '0.86rem', lineHeight: 1.5, color: '#e5e7eb', display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {parts.map((part, index) => {
        if (part.startsWith('```')) {
          const match = part.match(/```(\w*)\n([\s\S]*?)```/);
          const lang = match ? match[1] : 'code';
          const code = match ? match[2] : part.slice(3, -3);
          return <CodeRenderer key={index} code={code} lang={lang} />;
        }

        // Render simple lines with bold, headers, or bullet lists
        const lines = part.split('\n');
        return (
          <div key={index} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {lines.map((line, lIdx) => {
              if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
                return (
                  <div key={lIdx} style={{ display: 'flex', gap: '8px', paddingLeft: '8px' }}>
                    <span style={{ color: colors.accent.cyan }}>•</span>
                    <span>{line.trim().substring(2)}</span>
                  </div>
                );
              }
              if (line.trim().startsWith('# ')) {
                return <h1 key={lIdx} style={{ fontSize: '1.2rem', fontWeight: 700, margin: '8px 0 4px 0', color: '#fff' }}>{line.substring(2)}</h1>;
              }
              if (line.trim().startsWith('## ')) {
                return <h2 key={lIdx} style={{ fontSize: '1.05rem', fontWeight: 600, margin: '6px 0 3px 0', color: '#fff' }}>{line.substring(3)}</h2>;
              }
              if (line.trim().startsWith('### ')) {
                return <h3 key={lIdx} style={{ fontSize: '0.95rem', fontWeight: 600, margin: '4px 0 2px 0', color: '#fff' }}>{line.substring(4)}</h3>;
              }
              
              // Handle **bold**
              const boldRegex = /\*\*(.*?)\*\*/g;
              if (boldRegex.test(line)) {
                const textParts = line.split(boldRegex);
                return (
                  <p key={lIdx} style={{ margin: 0 }}>
                    {textParts.map((t, tIdx) => tIdx % 2 === 1 ? <strong key={tIdx} style={{ color: '#fff', fontWeight: 700 }}>{t}</strong> : t)}
                  </p>
                );
              }

              return <p key={lIdx} style={{ margin: 0 }}>{line}</p>;
            })}
          </div>
        );
      })}
    </div>
  );
};

export const MessageBubble: React.FC<{ 
  message: { role: 'user' | 'assistant'; content: string; timestamp: Date | string }; 
  userName?: string 
}> = ({ message, userName = 'User' }) => {
  const isUser = message.role === 'user';
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxWidth: '85%', alignSelf: isUser ? 'flex-end' : 'flex-start', margin: '4px 0' }}>
      {/* Sender Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', alignSelf: isUser ? 'flex-end' : 'flex-start' }}>
        <Avatar size={18} name={isUser ? userName : 'Moni'} isMoni={!isUser} />
        <span style={{ fontSize: '0.68rem', color: colors.text.muted, fontWeight: 500 }}>
          {isUser ? userName : 'MONI'} • {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      {/* Bubble Panel */}
      <div
        style={{
          background: isUser ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255, 255, 255, 0.02)',
          border: `1px solid ${isUser ? 'rgba(139, 92, 246, 0.25)' : 'rgba(255,255,255,0.04)'}`,
          borderRadius: isUser ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
          padding: '12px 16px',
          boxShadow: isUser ? '0 4px 12px rgba(139, 92, 246, 0.05)' : '0 4px 12px rgba(0,0,0,0.1)',
        }}
      >
        <MarkdownRenderer text={message.content} />
      </div>
    </div>
  );
};
