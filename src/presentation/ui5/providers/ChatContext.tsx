import React, { createContext, useContext } from 'react';

export interface ChatContextType {
  messages: any[];
  setMessages: React.Dispatch<React.SetStateAction<any[]>>;
  moniStatus: 'idle' | 'listening' | 'thinking' | 'speaking';
  setMoniStatus: (status: 'idle' | 'listening' | 'thinking' | 'speaking') => void;
  avatarMood: 'thinking' | 'neutral' | 'happy' | 'focused' | 'alert';
  setAvatarMood: (mood: 'thinking' | 'neutral' | 'happy' | 'focused' | 'alert') => void;
  currentlySpeakingMsgId: string | null;
  setCurrentlySpeakingMsgId: (id: string | null) => void;
  isWakeWordListening: boolean;
  setWakeWordListening: (val: boolean) => void;
  autoSpeakEnabled: boolean;
  setAutoSpeakEnabled: (val: boolean) => void;
  speechRate: number;
  setSpeechRate: (val: number) => void;
  speechVolume: number;
  setSpeechVolume: (val: number) => void;
  selectedSystemVoiceName: string;
  setSelectedSystemVoiceName: (val: string) => void;
  currentLanguage: 'tr' | 'en';
  setCurrentLanguage: (lang: 'tr' | 'en') => void;
  isOffline: boolean;
  setOffline: (val: boolean) => void;
  selectedProviderName: string;
  setSelectedProviderName: (val: string) => void;
  isMuted: boolean;
  setMuted: (val: boolean) => void;
  sendMessage: (text: string) => Promise<void>;
  clearChatHistory: () => Promise<void>;
}

export const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat must be used within ChatProvider');
  return context;
};
