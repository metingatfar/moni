import React, { useState, useEffect } from 'react';
import { databaseService } from '../../../data/db/LocalDatabase';
import { moniRuntime } from '../../../core/runtime/MoniRuntime';
import { ChatContext } from './ChatContext';

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [moniStatus, setMoniStatus] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');
  const [avatarMood, setAvatarMood] = useState<'thinking' | 'neutral' | 'happy' | 'focused' | 'alert'>('neutral');
  const [currentlySpeakingMsgId, setCurrentlySpeakingMsgId] = useState<string | null>(null);
  
  const [isWakeWordListening, setWakeWordListening] = useState(() => (typeof window !== 'undefined' ? localStorage.getItem('moni_wake_word_active') === 'true' : false));
  const [autoSpeakEnabled, setAutoSpeakEnabled] = useState(() => (typeof window !== 'undefined' ? localStorage.getItem('moni_auto_speak') !== 'false' : true));
  const [speechRate, setSpeechRate] = useState(() => (typeof window !== 'undefined' ? Number(localStorage.getItem('moni_speech_rate') || '1.0') : 1.0));
  const [speechVolume, setSpeechVolume] = useState(() => (typeof window !== 'undefined' ? Number(localStorage.getItem('moni_speech_volume') || '1.0') : 1.0));
  const [selectedSystemVoiceName, setSelectedSystemVoiceName] = useState(() => (typeof window !== 'undefined' ? localStorage.getItem('moni_selected_voice') || 'Selin' : 'Selin'));
  const [currentLanguage, setCurrentLanguage] = useState<'tr' | 'en'>(() => (typeof window !== 'undefined' ? (localStorage.getItem('moni_language') || 'tr') as 'tr' | 'en' : 'tr'));
  const [isOffline, setOffline] = useState(() => (typeof window !== 'undefined' ? !navigator.onLine : false));
  const [selectedProviderName, setSelectedProviderName] = useState(() => (typeof window !== 'undefined' ? localStorage.getItem('moni_selected_provider') || 'auto' : 'auto'));
  const [isMuted, setMuted] = useState(false);

  useEffect(() => {
    // Load initial chat history from database
    databaseService.getChatHistory().then(loaded => {
      setMessages(loaded);
    });
  }, []);

  // Sync state variables with MoniRuntime
  useEffect(() => {
    moniRuntime.setMessagesUpdater(setMessages);
    
    const unsubscribe = moniRuntime.subscribe((state) => {
      setCurrentlySpeakingMsgId(state.isSpeaking ? 'active-synthesis' : null);
      
      const mappedStatus = state.orbState === 'warning' ? 'idle' : (state.orbState as any);
      setMoniStatus(mappedStatus);
      
      let mood: 'thinking' | 'neutral' | 'happy' | 'focused' | 'alert' = 'neutral';
      if (state.orbState === 'thinking') mood = 'thinking';
      else if (state.orbState === 'speaking') mood = 'happy';
      else if (state.orbState === 'warning') mood = 'alert';
      setAvatarMood(mood);
      
      setSelectedProviderName(state.activeProvider);
    });

    return unsubscribe;
  }, []);

  const changeLanguage = (lang: 'tr' | 'en') => {
    setCurrentLanguage(lang);
    moniRuntime.setLanguage(lang);
  };

  const changeAutoSpeak = (enabled: boolean) => {
    setAutoSpeakEnabled(enabled);
    moniRuntime.setAutoSpeakEnabled(enabled);
  };

  const changeRate = (rate: number) => {
    setSpeechRate(rate);
    moniRuntime.setSpeechRate(rate);
  };

  const changeVolume = (volume: number) => {
    setSpeechVolume(volume);
    moniRuntime.setSpeechVolume(volume);
  };

  const changeVoice = (voice: string) => {
    setSelectedSystemVoiceName(voice);
    moniRuntime.setSystemVoice(voice);
  };

  const changeProvider = (prov: string) => {
    setSelectedProviderName(prov);
    moniRuntime.setProvider(prov);
  };

  const changeWakeWord = (val: boolean) => {
    setWakeWordListening(val);
    if (val) {
      moniRuntime.activateVoice();
    } else {
      moniRuntime.deactivateVoice();
    }
  };

  const sendMessage = async (text: string) => {
    await moniRuntime.sendMessage(text, 'keyboard');
  };

  const clearChatHistory = async () => {
    await databaseService.clearChatHistory();
    setMessages([]);
  };

  return (
    <ChatContext.Provider value={{
      messages,
      setMessages,
      moniStatus,
      setMoniStatus,
      avatarMood,
      setAvatarMood,
      currentlySpeakingMsgId,
      setCurrentlySpeakingMsgId,
      isWakeWordListening,
      setWakeWordListening: changeWakeWord,
      autoSpeakEnabled,
      setAutoSpeakEnabled: changeAutoSpeak,
      speechRate,
      setSpeechRate: changeRate,
      speechVolume,
      setSpeechVolume: changeVolume,
      selectedSystemVoiceName,
      setSelectedSystemVoiceName: changeVoice,
      currentLanguage,
      setCurrentLanguage: changeLanguage,
      isOffline,
      setOffline,
      selectedProviderName,
      setSelectedProviderName: changeProvider,
      isMuted,
      setMuted,
      sendMessage,
      clearChatHistory
    }}>
      {children}
    </ChatContext.Provider>
  );
};


