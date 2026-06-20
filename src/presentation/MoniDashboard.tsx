import React, { useState, useEffect, useRef } from 'react';
import { MoniAvatar } from './components/MoniAvatar';
import { MoniLive2D } from './components/MoniLive2D';
// import { LocalAiService } from '../data/services/LocalAiService';
import { NativeBridge } from '../data/services/NativeBridge';
import { databaseService } from '../data/db/LocalDatabase';
import { voiceService } from '../data/services/VoiceService';
import type { Contact } from '../domain/entities/Contact';
import type { Reminder } from '../domain/entities/Reminder';
import type { Message } from '../domain/repositories/AiRepository';
import type { Note } from '../domain/entities/Note';
import type { Todo } from '../domain/entities/Todo';
import type { MemoryItem, MemoryCategory } from '../domain/entities/MemoryItem';
import { MemoryService } from '../memory/MemoryService';
import { brainService } from '../brain/BrainService';
import { SecretaryService } from '../secretary/SecretaryService';
import { DateParserHelper } from '../secretary/DateParserHelper';

// const aiService = new LocalAiService();
const bridgeService = new NativeBridge();

export const MoniDashboard: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isOffline, setIsOffline] = useState(false);
  const [avatarType, setAvatarType] = useState<'image' | 'svg'>(() => {
    return (localStorage.getItem('moni_avatar_type') as 'image' | 'svg') || 'image';
  });
  const [eyeColor, setEyeColor] = useState<string>(() => {
    return localStorage.getItem('moni_eye_color') || 'green-glowing';
  });
  const [geminiApiKey, setGeminiApiKey] = useState(() => localStorage.getItem('gemini_api_key') || '');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isWakeWordListening, setIsWakeWordListening] = useState(true);
  const [selectedVoice, setSelectedVoice] = useState<string>('selin');
  const [trVoicesList, setTrVoicesList] = useState<SpeechSynthesisVoice[]>([]);
  const [bridgeLogs, setBridgeLogs] = useState<string[]>([]);

  const [currentView, setCurrentView] = useState<'home' | 'chat' | 'contacts' | 'agenda' | 'modulator' | 'settings' | 'calendar' | 'todos' | 'notes' | 'memory'>('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const [activeAlarm, setActiveAlarm] = useState<Reminder | null>(null);
  const firedReminderIdsRef = useRef<string[]>([]);

  // Notes and Todos state
  const [notes, setNotes] = useState<Note[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);

  // Memory engine states
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [newMemoryContent, setNewMemoryContent] = useState('');
  const [newMemoryCategory, setNewMemoryCategory] = useState<MemoryCategory>('general');

  // Moni Voice Interaction states
  const [moniStatus, setMoniStatus] = useState<'idle' | 'listening' | 'thinking' | 'speaking' | 'error'>('idle');
  const [autoSpeakEnabled, setAutoSpeakEnabled] = useState<boolean>(() => {
    return localStorage.getItem('moni_auto_speak_enabled') !== 'false';
  });
  const [autoSubmitEnabled, setAutoSubmitEnabled] = useState<boolean>(() => {
    return localStorage.getItem('moni_auto_submit_enabled') !== 'false';
  });
  const [speechRate, setSpeechRate] = useState<number>(() => {
    return parseFloat(localStorage.getItem('moni_speech_rate') || '1.0');
  });
  const [speechVolume, setSpeechVolume] = useState<number>(() => {
    return parseFloat(localStorage.getItem('moni_speech_volume') || '1.0');
  });
  const [selectedSystemVoiceName, setSelectedSystemVoiceName] = useState<string>(() => {
    return localStorage.getItem('moni_speech_voice_name') || '';
  });
  const [currentlySpeakingMsgId, setCurrentlySpeakingMsgId] = useState<string | null>(null);

  // Live Avatar Engine states
  const [avatarAnimationsEnabled, setAvatarAnimationsEnabled] = useState<boolean>(() => {
    return localStorage.getItem('moni_avatar_animations_enabled') !== 'false';
  });
  const [avatarMouthAnimationEnabled, setAvatarMouthAnimationEnabled] = useState<boolean>(() => {
    return localStorage.getItem('moni_avatar_mouth_animation_enabled') !== 'false';
  });
  const [avatarEffectsIntensity, setAvatarEffectsIntensity] = useState<'low' | 'medium' | 'high'>(() => {
    return (localStorage.getItem('moni_avatar_effects_intensity') as 'low' | 'medium' | 'high') || 'medium';
  });
  const [avatarMood, setAvatarMood] = useState<'neutral' | 'happy' | 'focused' | 'thinking' | 'alert'>('neutral');

  // Executive Dashboard states
  const [isDashboard2Enabled, setIsDashboard2Enabled] = useState<boolean>(() => {
    return localStorage.getItem('moni_is_dashboard2_enabled') !== 'false';
  });
  const [dailyBriefText, setDailyBriefText] = useState('Analiz ediliyor, gün özeti hazırlanıyor...');
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [scoredTodos, setScoredTodos] = useState<any[]>([]);
  const [activeProjectsList, setActiveProjectsList] = useState<string[]>([]);
  const [isGeneratingBrief, setIsGeneratingBrief] = useState(false);
  const [pendingSecretaryCommand, setPendingSecretaryCommand] = useState<any | null>(null);
  const [audioNotification, setAudioNotification] = useState<string | null>(null);
  const [backendHealth, setBackendHealth] = useState<{ checked: boolean; ok: boolean; hasKey: boolean }>({
    checked: false,
    ok: false,
    hasKey: false
  });
  
  const showAudioNotification = (message: string) => {
    setAudioNotification(message);
    setTimeout(() => {
      setAudioNotification(prev => prev === message ? null : prev);
    }, 6000);
  };

  const checkBackendHealth = async () => {
    const base = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:5000/api";
    const apiBase = base.endsWith("/api") ? base : `${base.replace(/\/$/, '')}/api`;
    const url = `${apiBase}/health`;
    
    try {
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setBackendHealth({ checked: true, ok: data.ok, hasKey: !!data.elevenLabsKey });
        console.log(`[MONI TTS] ELEVENLABS_API_KEY mevcut: ${data.elevenLabsKey}`);
      } else {
        setBackendHealth({ checked: true, ok: false, hasKey: false });
        console.warn(`[MONI TTS] Sağlık kontrolü başarısız: ${response.status}`);
      }
    } catch (e: any) {
      setBackendHealth({ checked: true, ok: false, hasKey: false });
      console.warn(`[MONI TTS] Sağlık kontrolü bağlantı hatası: ${e.message}`);
    }
  };


  // Note form fields
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteColor, setNewNoteColor] = useState('#7b2cbf'); // Default color purple

  // Todo form fields
  const [newTodoTask, setNewTodoTask] = useState('');
  const [newTodoPriority, setNewTodoPriority] = useState<'low' | 'medium' | 'high'>('medium');

  // Calendar and View filtering states
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());
  const [newReminderTime, setNewReminderTime] = useState('09:00');
  const [todoFilter, setTodoFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [noteSearch, setNoteSearch] = useState('');

  // PWA Installation states
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
      addBridgeLog("PWA Kurulum Paketi Hazır: Telefona yüklenebilir.");
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstallable(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallApp = async () => {
    if (!deferredPrompt) {
      alert("Kurulum paketi şu an hazır değil veya tarayıcınız PWA kurulumunu desteklemiyor. iOS cihazlarda Safari tarayıcısından 'Paylaş > Ana Ekrana Ekle' adımlarını izleyebilirsiniz.");
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    addBridgeLog(`PWA Yükleme Seçimi: ${outcome}`);
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  // Custom voice modulation states
  const [customVoiceEnabled, setCustomVoiceEnabled] = useState<boolean>(() => {
    return localStorage.getItem('moni_custom_voice_enabled') === 'true';
  });
  const [customVoicePitch, setCustomVoicePitch] = useState<number>(() => {
    return parseFloat(localStorage.getItem('moni_custom_voice_pitch') || '1.0');
  });
  const [customVoiceDetune, setCustomVoiceDetune] = useState<number>(() => {
    return parseInt(localStorage.getItem('moni_custom_voice_detune') || '0', 10);
  });
  const [customVoiceEffect, setCustomVoiceEffect] = useState<string>(() => {
    return localStorage.getItem('moni_custom_voice_effect') || 'none';
  });

  const playCustomVoice = async (pitch = customVoicePitch, detune = customVoiceDetune, effect = customVoiceEffect) => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      if (!(window as any).moniAudioContext) {
        (window as any).moniAudioContext = new AudioContextClass();
      }
      const audioCtx = (window as any).moniAudioContext;
      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }
      const response = await fetch('/merhaba.mp3');
      if (!response.ok) {
        throw new Error(`Dosya yüklenemedi: ${response.statusText}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

      const source = audioCtx.createBufferSource();
      source.buffer = audioBuffer;

      // Apply playback rate (pitch & speed)
      source.playbackRate.value = pitch;

      // Apply detune if supported
      if (source.detune) {
        source.detune.value = detune;
      }

      let lastNode: AudioNode = source;

      // Apply effects
      if (effect === 'robot') {
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'peaking';
        filter.frequency.value = 440;
        filter.Q.value = 15;
        filter.gain.value = 25;

        // Wave shaper for robotic distortion
        const distortion = audioCtx.createWaveShaper();
        const makeDistortionCurve = (amount = 20) => {
          const n_samples = 44100;
          const curve = new Float32Array(n_samples);
          const deg = Math.PI / 180;
          for (let i = 0; i < n_samples; ++i) {
            const x = (i * 2) / n_samples - 1;
            curve[i] = ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x));
          }
          return curve;
        };
        distortion.curve = makeDistortionCurve(100);
        distortion.oversample = '4x';

        lastNode.connect(filter);
        filter.connect(distortion);
        lastNode = distortion;
      } else if (effect === 'telephone') {
        const lp = audioCtx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.value = 3000;

        const hp = audioCtx.createBiquadFilter();
        hp.type = 'highpass';
        hp.frequency.value = 400;

        lastNode.connect(hp);
        hp.connect(lp);
        lastNode = lp;
      } else if (effect === 'echo') {
        const delay = audioCtx.createDelay(1.0);
        delay.delayTime.value = 0.25;

        const feedback = audioCtx.createGain();
        feedback.gain.value = 0.4;

        const merger = audioCtx.createGain();

        lastNode.connect(merger); // Dry signal
        lastNode.connect(delay);
        delay.connect(feedback);
        feedback.connect(delay);
        feedback.connect(merger); // Wet signal

        lastNode = merger;
      }

      lastNode.connect(audioCtx.destination);
      setMoniStatus('speaking');
      source.onended = () => {
        setMoniStatus('idle');
      };
      source.start(0);
      addBridgeLog(`Ses oynatılıyor (Pitch: ${pitch.toFixed(2)}, Detune: ${detune} cent, Efekt: ${effect})`);
    } catch (err: any) {
      console.error("Custom audio play error:", err);
      addBridgeLog(`Ses oynatma hatası: ${err.message}`);
    }
  };

  const playAssistantBeep = (ctx: AudioContext) => {
    try {
      if (!ctx) return;
      const now = ctx.currentTime;

      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now); // D5
      gain1.gain.setValueAtTime(0.0, now);
      gain1.gain.linearRampToValueAtTime(0.12, now + 0.02);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.15);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880.00, now + 0.08); // A5
      gain2.gain.setValueAtTime(0.0, now + 0.08);
      gain2.gain.linearRampToValueAtTime(0.12, now + 0.10);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.20);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.08);
      osc2.stop(now + 0.25);
    } catch (e) {
      console.error("Assistant beep failed:", e);
    }
  };

  // New entry states
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newReminderTitle, setNewReminderTitle] = useState('');

  const chatEndRef = useRef<HTMLDivElement>(null);
  const wakeRecognitionRef = useRef<any>(null);
  const isWakeRecognitionActiveRef = useRef<boolean>(false);
  const isSpeakingRef = useRef<boolean>(false);
  const lastWakeStartRef = useRef<number>(0);
  // Tracks the active command-listening SpeechRecognition instance
  const commandRecRef = useRef<any>(null);
  // Set to true when the app intentionally stops STT (manual stop, TTS start).
  // Prevents the onerror 'aborted' event from showing an error toast.
  const manuallyStoppedRef = useRef<boolean>(false);

  // Initialize data
  useEffect(() => {
    loadDatabaseData();
    const savedVoice = localStorage.getItem('moni_voice_type');
    if (savedVoice) {
      if (savedVoice === 'can' || savedVoice === 'murat') {
        setSelectedVoice('selin');
        localStorage.setItem('moni_voice_type', 'selin');
      } else {
        setSelectedVoice(savedVoice);
      }
    }

    // Helper: detect if a voice name matches male/erkek patterns
    const isMaleVoice = (name: string) =>
      /tolga|cem|hakan|sabri|huseyin|male|erkek|man|boy/i.test(name);

    // Helper: detect female voice candidates
    const isFemaleTurkish = (v: SpeechSynthesisVoice) => {
      const name = v.name.toLowerCase();
      const lang = v.lang.toLowerCase().replace('_', '-');
      const isTr = lang.startsWith('tr') || lang.includes('tr');
      const hasFemaleIndicator = /dilara|yelda|emel|seda|filiz|sibel|hazel|ayse|zeynep|yasemin|ipek|suna|female|bayan|woman|girl|siri|her/i.test(name);
      const noMaleIndicator = !isMaleVoice(name);
      // "Google Türkçe" or generic Turkish without male marker is treated as female
      const isGoogleTurkish = isTr && name.includes('google');
      return isTr && (hasFemaleIndicator || isGoogleTurkish) && noMaleIndicator;
    };

    let retryCount = 0;
    const loadVoices = () => {
      if ('speechSynthesis' in window) {
        const voices = window.speechSynthesis.getVoices();
        
        if (voices.length === 0 && retryCount < 5) {
          retryCount++;
          console.log(`[Moni UI] Ses listesi boş, yeniden yükleniyor (Deneme ${retryCount}/5)...`);
          setTimeout(loadVoices, 500);
          return;
        }

        if (voices.length === 0) {
          console.warn('[Moni UI] Cihazda sesli okuma motoru bulunamadı, metin modu aktif.');
          showAudioNotification('Bu cihazda sesli okuma motoru bulunamadı, metin modu aktif.');
        }

        // === Smart voice sorting ===
        // Priority: 1) TR female  2) TR generic (Google TR)  3) TR male  4) other  5) male others last
        const scoreVoice = (v: SpeechSynthesisVoice): number => {
          const name = v.name.toLowerCase();
          const lang = v.lang.toLowerCase().replace('_', '-');
          const isTr = lang.startsWith('tr') || lang.includes('tr');
          const isMale = isMaleVoice(name);
          const isFemTr = isFemaleTurkish(v);
          if (isFemTr) return 0;           // TR female — top priority
          if (isTr && !isMale) return 1;   // TR generic / Google TR
          if (isTr && isMale) return 2;    // TR male
          if (!isTr && !isMale) return 3;  // Other non-male
          return 4;                         // Male non-TR — last
        };

        const sorted = [...voices].sort((a, b) => {
          const scoreDiff = scoreVoice(a) - scoreVoice(b);
          if (scoreDiff !== 0) return scoreDiff;
          return a.name.localeCompare(b.name);
        });
        setTrVoicesList(sorted);

        // Auto-fix: if saved system voice is male, clear it so TTS engine picks female automatically
        const savedVoiceName = localStorage.getItem('moni_speech_voice_name') || '';
        if (savedVoiceName && isMaleVoice(savedVoiceName)) {
          console.warn(`[Moni UI] Kayıtlı ses erkek (${savedVoiceName}), otomatik kadın/Türkçe sese geçiliyor.`);
          localStorage.removeItem('moni_speech_voice_name');
          setSelectedSystemVoiceName('');
        }

        // OpenAI TTS artık her cihazda aynı kaliteli sesi sağlıyor.
        // Türkçe kadın sesi olmasa da kullanıcıya uyarı gösterme — sadece konsola logla.
        const hasFemaleTr = voices.some(isFemaleTurkish);
        if (!hasFemaleTr && voices.length > 0) {
          console.info('[Moni UI] Cihazda Türkçe kadın sesi bulunamadı — OpenAI TTS fallback aktif.');
        }
      } else {
        // SpeechSynthesis not supported — OpenAI TTS still works, only log
        console.warn('[Moni UI] Tarayıcı SpeechSynthesis desteklemiyor — OpenAI TTS kullanılacak.');
      }
    };

    loadVoices();
    checkBackendHealth();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    const handleInfoNotification = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.message) {
        showAudioNotification(customEvent.detail.message);
      }
    };

    window.addEventListener('moni_info_notification', handleInfoNotification);

    return () => {
      window.removeEventListener('moni_info_notification', handleInfoNotification);
      if (wakeRecognitionRef.current) {
        try {
          wakeRecognitionRef.current.stop();
        } catch (e) { }
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Auto start wake word recognition on startup
  useEffect(() => {
    if (isWakeWordListening) {
      const startTimer = setTimeout(() => {
        startWakeWordRecognition();
      }, 1500);
      return () => clearTimeout(startTimer);
    }
  }, [isWakeWordListening]);

  // Resilient wake word auto-restart loop for mobile browsers
  useEffect(() => {
    const checkInterval = setInterval(() => {
      if (
        isWakeWordListening &&
        (window as any).moniAudioUnlocked &&
        !isRecording &&
        !isSpeakingRef.current &&
        !isWakeRecognitionActiveRef.current
      ) {
        console.log("Moni Wake Word listener restart loop triggered.");
        startWakeWordRecognition();
      }
    }, 4000); // check every 4 seconds

    return () => clearInterval(checkInterval);
  }, [isWakeWordListening, isRecording]);

  useEffect(() => {
    if (trVoicesList.length > 0) {
      addBridgeLog(`Sistem Türkçe Sesleri Yüklendi: ${trVoicesList.map(v => v.name).join(', ')}`);
    }
  }, [trVoicesList]);

  // Periodic Reminder / Alarm Trigger system
  useEffect(() => {
    const checkAlarmInterval = setInterval(async () => {
      if (activeAlarm) return;

      const loadedReminders = await databaseService.getReminders();
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();
      const currentDate = now.getDate();
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();

      const matching = loadedReminders.find(reminder => {
        if (reminder.isCompleted) return false;
        if (firedReminderIdsRef.current.includes(reminder.id)) return false;

        const remDate = new Date(reminder.dateTime);
        return (
          remDate.getFullYear() === currentYear &&
          remDate.getMonth() === currentMonth &&
          remDate.getDate() === currentDate &&
          remDate.getHours() === currentHours &&
          remDate.getMinutes() === currentMinutes
        );
      });

      if (matching) {
        firedReminderIdsRef.current.push(matching.id);
        setActiveAlarm(matching);

        // Voice alert
        const isCustomEnabled = localStorage.getItem('moni_custom_voice_enabled') === 'true';
        if (isCustomEnabled) {
          const pitch = parseFloat(localStorage.getItem('moni_custom_voice_pitch') || '1.0');
          const detune = parseInt(localStorage.getItem('moni_custom_voice_detune') || '0', 10);
          const effect = localStorage.getItem('moni_custom_voice_effect') || 'none';
          playCustomVoice(pitch, detune, effect);

          setTimeout(() => {
            speakText(`Hatırlatıcı: ${matching.title}`);
          }, 1100);
        } else {
          speakText(`Hatırlatıcı: ${matching.title}`);
        }

        // Auto complete after notification
        matching.isCompleted = true;
        await databaseService.saveReminder(matching);

        // Refresh reminders state
        const refreshed = await databaseService.getReminders();
        setReminders(refreshed);
        refreshExecutiveStatus(todos, refreshed, memories);
      }
    }, 15000); // Check every 15 seconds

    return () => clearInterval(checkAlarmInterval);
  }, [activeAlarm, reminders, selectedVoice]);

  const refreshExecutiveStatus = async (
    currentTodos: Todo[],
    currentReminders: Reminder[],
    currentMemories: MemoryItem[]
  ) => {
    setIsGeneratingBrief(true);
    try {
      const status = await brainService.getExecutiveStatus(
        currentTodos,
        currentReminders,
        currentMemories,
        geminiApiKey || undefined
      );
      setDailyBriefText(status.dailyBrief);
      setRecommendations(status.recommendations);
      setScoredTodos(status.scoredTodos);
      setActiveProjectsList(status.activeProjects);
    } catch (err) {
      console.error("Executive status update error:", err);
      addBridgeLog("Executive Brain güncelleme hatası.");
    } finally {
      setIsGeneratingBrief(false);
    }
  };

  const handleSpeakDailyBrief = () => {
    if (currentlySpeakingMsgId === 'daily-brief') {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      let audio = (window as any).moniAudio;
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
      setCurrentlySpeakingMsgId(null);
      setMoniStatus('idle');
      setAvatarMood('neutral');
      isSpeakingRef.current = false;
      addBridgeLog("Brifing seslendirmesi durduruldu.");
    } else {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      let audio = (window as any).moniAudio;
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
      setCurrentlySpeakingMsgId('daily-brief');
      speakText(dailyBriefText, () => {
        setCurrentlySpeakingMsgId(null);
      });
    }
  };

  const loadDatabaseData = async () => {
    const loadedContacts = await databaseService.getContacts();
    const loadedReminders = await databaseService.getReminders();
    const loadedHistory = await databaseService.getChatHistory();
    const loadedNotes = await databaseService.getNotes();
    const loadedTodos = await databaseService.getTodos();
    const loadedMemories = await databaseService.getMemories();

    setContacts(loadedContacts);
    setReminders(loadedReminders);
    setNotes(loadedNotes);
    setTodos(loadedTodos);
    setMemories(loadedMemories);

    if (loadedHistory.length > 0) {
      setMessages(loadedHistory);
    } else {
      const initialMsg: Message = {
        role: 'system',
        content: 'MONI Akıllı Kişisel Asistan ve Özel Kalem Sistemine hoş geldiniz. Size rehber, arama, e-posta, WhatsApp veya hatırlatıcılarınız konusunda yardımcı olabilirim. Denemek için sesli veya yazılı komut verin ya da "Ses Aktivasyonu" butonuna tıklayıp doğrudan "Moni" diye seslenin. Ayrıca "Bunu hatırla: Adım Ahmet ve mesleğim doktor" gibi cümlelerle bana kendiniz hakkında bilgiler öğretebilirsiniz.',
        timestamp: new Date()
      };
      setMessages([initialMsg]);
      await databaseService.saveChatMessage(initialMsg);
    }

    // Trigger initial executive status analyze
    await refreshExecutiveStatus(loadedTodos, loadedReminders, loadedMemories);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addBridgeLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setBridgeLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 19)]);
  };

  /**
   * showTemporaryError — Recoverable audio/STT/AI errors only.
   * Shows error badge on avatar for 3.5 s then auto-resets to idle/neutral.
   * Also shows a toast notification. NEVER use for critical boot failures.
   */
  const showTemporaryError = (toastMessage: string, bridgeLogMsg?: string) => {
    setMoniStatus('error');
    setAvatarMood('alert');
    showAudioNotification(toastMessage);
    if (bridgeLogMsg) addBridgeLog(bridgeLogMsg);
    setTimeout(() => {
      setMoniStatus(prev => prev === 'error' ? 'idle' : prev);
      setAvatarMood(prev => prev === 'alert' ? 'neutral' : prev);
    }, 3500);
  };

  type SpeakMode = "wake" | "command" | "none";

  const speakText = (
    text: string,
    callback?: () => void,
    voiceOverride?: string,
    restartMode: SpeakMode = "wake"
  ) => {
    // Log step 3 if this is the initial greeting
    if (text.includes("Buyurun")) {
      console.log('[VOICE-3] Buyurun mesajı okunuyor');
    }

    // Stop any active STT sessions before starting TTS to avoid 'aborted' collision
    if (commandRecRef.current) {
      try {
        manuallyStoppedRef.current = true;
        commandRecRef.current.stop();
      } catch (_) {}
      commandRecRef.current = null;
      setIsRecording(false);
    }
    if (wakeRecognitionRef.current) {
      try {
        wakeRecognitionRef.current.stop();
      } catch (_) {}
      isWakeRecognitionActiveRef.current = false;
    }

    isSpeakingRef.current = true;
    setMoniStatus('speaking');
    setAvatarMood('happy');
    const activeVoiceType = (voiceOverride || selectedVoice) as any;

    addBridgeLog(`Seslendirme (OpenAI TTS / Nova): "${text.slice(0, 30)}..."`);
    console.log('[VOICE-8] OpenAI TTS çağrılıyor');

    const options = {
      rate: speechRate,
      volume: speechVolume,
      voiceName: selectedSystemVoiceName || undefined
    };

    voiceService.speak(
      text,
      activeVoiceType,
      () => {
        console.log('[VOICE-9] TTS oynatıldı');
        isSpeakingRef.current = false;
        setMoniStatus('idle');
        setAvatarMood('neutral');
        if (callback) callback();

        manuallyStoppedRef.current = false;

        setTimeout(() => {
          if (
            !isSpeakingRef.current &&
            !manuallyStoppedRef.current &&
            !commandRecRef.current
          ) {
            if (restartMode === "wake" && isWakeWordListening) {
              console.log('[VOICE-10] Wake word moduna geri dönüldü');
              startWakeWordRecognition();
            } else if (restartMode === "command") {
              startCommandListening();
            }
          }
        }, 500);
      },
      options,
      (errMessage: string) => {
        isSpeakingRef.current = false;
        showTemporaryError(
          `Seslendirme yapılamadı: ${errMessage}`,
          `Seslendirme Hatası: ${errMessage}`
        );
        if (callback) callback();
      }
    );
  };

  const handleSpeakMessage = (text: string, msgId: string) => {
    if (currentlySpeakingMsgId === msgId) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      let audio = (window as any).moniAudio;
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
      setCurrentlySpeakingMsgId(null);
      setMoniStatus('idle');
      setAvatarMood('neutral');
      isSpeakingRef.current = false;
      addBridgeLog("Seslendirme durduruldu.");
    } else {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      let audio = (window as any).moniAudio;
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
      setCurrentlySpeakingMsgId(msgId);
      speakText(text, () => {
        setCurrentlySpeakingMsgId(null);
      });
    }
  };

  // Screen Wake Lock reference to prevent mobile screen sleep
  const wakeLockRef = useRef<any>(null);

  const requestWakeLock = async () => {
    if ('wakeLock' in navigator) {
      try {
        wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
        console.log('[Moni WakeLock] Ekran kilidi aktif edildi, ekran kapanmayacak.');
      } catch (err: any) {
        console.warn(`[Moni WakeLock] Ekran kilidi etkinleştirilemedi: ${err.message}`);
      }
    }
  };

  const startWakeWordRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      addBridgeLog('Hata: Tarayıcınız ses tanımayı desteklemiyor.');
      return;
    }

    // Try to acquire Wake Lock on mobile devices
    requestWakeLock();

    console.log('[VOICE-1] Wake word listener aktif');

    if (wakeRecognitionRef.current) {
      try {
        wakeRecognitionRef.current.stop();
      } catch (e) { }
    }

    // Stop commandRecRef immediately to ensure both are not active at the same time
    if (commandRecRef.current) {
      try {
        manuallyStoppedRef.current = true;
        commandRecRef.current.stop();
      } catch (_) {}
      commandRecRef.current = null;
      setIsRecording(false);
    }

    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'tr-TR';

    rec.onresult = (event: any) => {
      if (isSpeakingRef.current || isRecording) return;

      const lastResultIndex = event.resultIndex;
      const result = event.results[lastResultIndex];
      const transcript = result[0].transcript.trim().toLowerCase();
      console.log('Moni WakeWord dinleme:', transcript);

      const includesMoni =
        transcript === 'moni' ||
        transcript === 'boni' ||
        transcript.includes('moni dinle') ||
        transcript.includes('hey moni') ||
        transcript.includes('merhaba moni') ||
        transcript.endsWith('moni');

      if (includesMoni) {
        console.log('[VOICE-2] Moni kelimesi algılandı');
        rec.stop();
        isWakeRecognitionActiveRef.current = false;

        addBridgeLog("Moni uyanıyor...");
        if ((window as any).moniAudioContext) {
          playAssistantBeep((window as any).moniAudioContext);
        }
        
        setMoniStatus('speaking');
        setAvatarMood('happy');
        speakText("Buyurun Metin Bey, sizi dinliyorum.", undefined, undefined, "command");
      }
    };

    rec.onstart = () => {
      isWakeRecognitionActiveRef.current = true;
      lastWakeStartRef.current = Date.now();
    };

    rec.onerror = (event: any) => {
      isWakeRecognitionActiveRef.current = false;
      const err = event.error;
      if (err === 'aborted') {
        console.log('[MONI WakeWord] Dinleme oturumu kapatıldı (aborted).');
        return;
      }
      console.error('Wake Word recognition error:', err);
      if (err === 'not-allowed') {
        addBridgeLog("Mikrofon izni bekleniyor/engellendi. Lütfen tarayıcıda mikrofon iznini etkinleştirin.");
      }
    };

    rec.onend = () => {
      isWakeRecognitionActiveRef.current = false;
      if (isWakeWordListening && !isSpeakingRef.current && !isRecording) {
        const duration = Date.now() - lastWakeStartRef.current;
        const delay = duration < 1000 ? 5000 : 300;
        setTimeout(() => {
          if (isWakeWordListening && !isSpeakingRef.current && !isRecording) {
            try {
              rec.start();
              isWakeRecognitionActiveRef.current = true;
            } catch (e) { }
          }
        }, delay);
      }
    };

    wakeRecognitionRef.current = rec;
    try {
      rec.start();
      isWakeRecognitionActiveRef.current = true;
      lastWakeStartRef.current = Date.now();
      addBridgeLog("Moni dinleme modu aktif. 'Moni' diyerek seslenebilirsiniz.");
    } catch (e) {
      isWakeRecognitionActiveRef.current = false;
      console.error('Failed to start wake word:', e);
    }
  };

  const startCommandListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showTemporaryError(
        'Tarayıcınız sesli komutları (STT) desteklemiyor. Lütfen Chrome veya Safari kullanın.',
        'Hata: Tarayıcınız ses tanımayı desteklemiyor.'
      );
      alert('Tarayıcınız ses tanımayı (STT) desteklemiyor. Lütfen Google Chrome veya Safari gibi uyumlu bir tarayıcı kullanın.');
      return;
    }

    if (isSpeakingRef.current) {
      addBridgeLog('TTS aktif, STT başlatılmadı.');
      return;
    }

    console.log('[VOICE-4] Komut dinleme başladı');

    if (commandRecRef.current) {
      try {
        manuallyStoppedRef.current = true;
        commandRecRef.current.stop();
      } catch (_) {}
      commandRecRef.current = null;
    }

    setIsRecording(true);
    setMoniStatus('listening');
    setAvatarMood('neutral');
    addBridgeLog('Moni dinliyor: Komutunuzu söyleyin...');

    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = 'tr-TR';
    commandRecRef.current = rec;
    manuallyStoppedRef.current = false;

    // 5-second silence timeout
    const silenceTimeout = setTimeout(() => {
      console.log('[MONI COMMAND] 5 saniye boyunca ses algılanmadı, wake mode’a dönülüyor');
      try {
        manuallyStoppedRef.current = true;
        rec.stop();
      } catch (_) {}
      setIsRecording(false);
      commandRecRef.current = null;
      speakText("Sizi duyamadım, tekrar Moni diyebilirsiniz.", undefined, undefined, "wake");
    }, 5000);

    rec.onresult = (event: any) => {
      clearTimeout(silenceTimeout);
      const command = event.results[0][0].transcript;
      console.log('[VOICE-5] Transcript alındı:', command);
      addBridgeLog(`Ses Algılandı (STT): "${command}"`);

      // Stop recognition immediately after capture
      try {
        manuallyStoppedRef.current = true;
        rec.stop();
      } catch (_) {}
      setIsRecording(false);
      commandRecRef.current = null;

      if (command.trim()) {
        processVoiceCommand(command);
      } else {
        setMoniStatus('idle');
        setAvatarMood('neutral');
        if (isWakeWordListening) {
          console.log('[VOICE-10] Wake word moduna geri dönüldü');
          startWakeWordRecognition();
        }
      }
    };

    rec.onerror = (event: any) => {
      clearTimeout(silenceTimeout);
      const errCode: string = event.error;
      console.log('[MONI STT] onerror:', errCode, '| manuallyStoped:', manuallyStoppedRef.current);

      setIsRecording(false);

      if (errCode === 'aborted' || manuallyStoppedRef.current) {
        console.log('[MONI STT] Dinleme oturumu uygulama tarafından kapatıldı — hata gösterilmiyor.');
        manuallyStoppedRef.current = false;
        return;
      }

      if (errCode === 'no-speech') {
        addBridgeLog('Ses algılanamadı, bekleme moduna dönüldü.');
        setMoniStatus('idle');
        setAvatarMood('neutral');
      } else if (errCode === 'not-allowed') {
        showTemporaryError(
          'Mikrofon izni verilmedi. Tarayıcı ayarlarından mikrofon iznini açın.',
          'Hata: Mikrofon izni engellendi.'
        );
      } else if (errCode === 'audio-capture') {
        showTemporaryError(
          'Mikrofon bulunamadı veya kullanılamıyor. Bağlantıyı kontrol edin.',
          'Hata: Mikrofon donanımı bulunamadı.'
        );
      } else {
        showTemporaryError(
          `Ses tanıma sorunu: ${errCode}. Lütfen tekrar deneyin.`,
          `Ses Tanıma Hatası: ${errCode}`
        );
      }

      if (isWakeWordListening) {
        startWakeWordRecognition();
      }
    };

    rec.onend = () => {
      clearTimeout(silenceTimeout);
      setIsRecording(false);
      commandRecRef.current = null;
      setMoniStatus(prev => (prev === 'listening' ? 'idle' : prev));
      setAvatarMood(prev => (prev === 'neutral' || prev === 'alert' ? 'neutral' : prev));
    };

    try {
      rec.start();
    } catch (e) {
      clearTimeout(silenceTimeout);
      console.error('Failed to start command listening:', e);
      setIsRecording(false);
      commandRecRef.current = null;
      showTemporaryError(
        'Ses tanıma başlatılamadı. Lütfen tekrar deneyin.',
        'Ses tanıma başlatılamadı.'
      );
    }
  };

  const generateAIReply = async (message: string): Promise<string> => {
    console.log('[AI-1] Mesaj alındı:', message);
    console.log('[CHAT-2] AI isteği hazırlanıyor');
    console.log('[AI-2] API isteği hazırlanıyor');
    
    // Check if Gemini API key exists
    if (!geminiApiKey || !geminiApiKey.trim()) {
      console.warn('[MONI AI] Gemini API key is missing. Using local fallback.');
      console.log('[AI-5] Response Body: Local Fallback Mode');
      console.log('[AI-6] AI cevabı: Merhaba Metin Bey, şu anda temel modda çalışıyorum.');
      return 'Merhaba Metin Bey, şu anda temel modda çalışıyorum.';
    }

    try {
      console.log('[CHAT-3] AI servisine istek atıldı');
      const memoryContext = MemoryService.formatMemoriesForSystemInstruction(memories);
      const systemInstructionWithMemories = "Sen Moni adında, son derece zeki, cana yakın ve profesyonel bir yapay zeka asistanı ve özel kalem yöneticisisin. Sana seslenildiğinde ya da konuşulduğunda, kullanıcıyla kibar, sıcak ve yardımsever bir tonda iletişim kurmalısın. Türkçe konuşmalısın. Cevapların kısa, net, samimi ve sesli okumaya tam uyumlu olmalıdır. Markdown biçimlendirmeleri (kalın yazılar, yıldızlar, listeler vb.) veya okunması zor semboller kullanma, çünkü verdiğin cevaplar doğrudan sesli olarak okunacaktır. Kullanıcının not alma, görev ekleme ve randevu planlama isteklerini başarıyla yönetiyorsun." + memoryContext;

      let accumulatedText = '';
      await voiceService.streamChat(
        message,
        (chunk: string) => {
          accumulatedText += chunk;
        },
        geminiApiKey,
        messages,
        systemInstructionWithMemories
      );

      const cleaned = accumulatedText.trim();
      if (!cleaned) {
        throw new Error('AI empty response received.');
      }
      console.log('[AI-6] AI cevabı:', cleaned);
      return cleaned;
    } catch (err: any) {
      console.error('[MONI AI] AI Request failed:', err);
      throw err;
    }
  };

  const processVoiceCommand = async (command: string) => {
    if (!command.trim()) {
      if (isWakeWordListening) {
        console.log('[VOICE-10] Wake word moduna geri dönüldü');
        startWakeWordRecognition();
      }
      return;
    }

    console.log('[VOICE-6] AI cevap isteniyor');
    setMoniStatus('thinking');
    setAvatarMood('thinking');

    // Add user message to UI
    const userMsg: Message = {
      role: 'user',
      content: command,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    await databaseService.saveChatMessage(userMsg);

    try {
      const replyText = await generateAIReply(command);
      console.log('[VOICE-7] AI cevap geldi:', replyText);

      // Save reply message
      const newMsgId = 'assistant-' + Date.now();
      const replyMsg: Message = {
        id: newMsgId,
        role: 'assistant',
        content: replyText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, replyMsg]);
      await databaseService.saveChatMessage(replyMsg);
      console.log('[AI-7] Assistant state güncellendi');

      // Speak using OpenAI TTS
      speakText(replyText, undefined, undefined, "wake");
    } catch (err: any) {
      console.error('[MONI VOICE COMMAND] Hata oluştu:', err);
      
      const errorMsgText = `Bağlantı hatası oluştu: ${err.message || err}`;
      const newMsgId = 'assistant-' + Date.now();
      const replyMsg: Message = {
        id: newMsgId,
        role: 'assistant',
        content: errorMsgText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, replyMsg]);
      await databaseService.saveChatMessage(replyMsg);
      console.log('[AI-7] Assistant state güncellendi (Hata)');
      speakText(errorMsgText, undefined, undefined, "wake");
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      role: 'user',
      content: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    await databaseService.saveChatMessage(userMsg);
    setInputMessage('');

    // Check commands
    const textLower = text.toLowerCase();

    // === Sprint 2: Secretary Engine Processing ===
    
    // Helper to load fresh DB data, trigger dashboard updates
    const refreshDashboardData = async () => {
      const loadedTodos = await databaseService.getTodos();
      const loadedReminders = await databaseService.getReminders();
      const loadedNotes = await databaseService.getNotes();
      setTodos(loadedTodos);
      setReminders(loadedReminders);
      setNotes(loadedNotes);
      await refreshExecutiveStatus(loadedTodos, loadedReminders, memories);
    };

    // Helper to send assistant reply, speak it, and handle wake word restart
    const sendAssistantReply = async (replyText: string) => {
      const replyMsg: Message = {
        role: 'assistant',
        content: replyText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, replyMsg]);
      await databaseService.saveChatMessage(replyMsg);
      speakText(replyText, () => {
        if (isWakeWordListening) startWakeWordRecognition();
      });
    };

    // A. Check if there's a pending command awaiting confirmation or date clarification
    if (pendingSecretaryCommand) {
      const pending = pendingSecretaryCommand;
      setPendingSecretaryCommand(null); // Clear it immediately to avoid loops

      if (pending.waitingFor === 'confirmation') {
        const isYes = [
          'evet', 'tamam', 'olur', 'ekle', 'kaydet', 'onaylıyorum', 'onayliyorum', 'yes', 'onayla'
        ].some(word => textLower.includes(word));

        if (isYes) {
          // The user confirmed! Save the data
          addBridgeLog(`Sekreter: Kullanıcı onayı alındı. Kayıt yapılıyor...`);
          try {
            const result = await SecretaryService.saveCommand(pending.type, pending.data, memories.find(m => m.category === 'name')?.content || 'Metin');
            await refreshDashboardData();
            await sendAssistantReply(result.message);
          } catch (err) {
            console.error("Failed to save confirmed secretary command:", err);
            await sendAssistantReply("Üzgünüm, kaydı yaparken bir hata oluştu.");
          }
          return;
        } else {
          // The user cancelled or said something else
          addBridgeLog(`Sekreter: Kullanıcı onayı reddedildi veya anlaşılamadı.`);
          await sendAssistantReply("Anlaşıldı, işlemi iptal ettim.");
          return;
        }
      }

      if (pending.waitingFor === 'date_clarification') {
        // The user is providing the date/time info
        const clarifiedDate = DateParserHelper.parse(text);
        if (clarifiedDate) {
          // Date extracted successfully! Update and check if we now need confirmation or can save
          const updatedData = { ...pending.data, dateTime: clarifiedDate };
          
          // Present a confirmation request with the clarified date
          const friendlyDate = SecretaryService.formatTurkishFriendlyDate(clarifiedDate);
          const typeLabels: Record<string, string> = { task: 'görev', reminder: 'hatırlatıcı', meeting: 'toplantı', note: 'not' };
          const label = typeLabels[pending.type] || 'etkinlik';
          
          const newPending = {
            ...pending,
            data: updatedData,
            waitingFor: 'confirmation' as const
          };
          setPendingSecretaryCommand(newPending);
          
          let message = `Tamamdır. Bunu ${friendlyDate} için ${label} olarak eklememi ister misiniz?`;
          if (pending.type === 'task' && updatedData.project) {
            message = `Tamamdır. Bunu ${friendlyDate} için ${updatedData.project} projesine görev olarak eklememi onaylıyor musunuz?`;
          }
          
          await sendAssistantReply(message);
          return;
        } else {
          // Still couldn't parse date
          await sendAssistantReply("Tarih veya saati tam anlayamadım. Hangi gün ve saatte planlamak istersiniz? (İptal etmek isterseniz 'iptal' diyebilirsiniz)");
          // Keep waiting for date clarification
          setPendingSecretaryCommand(pending);
          return;
        }
      }
    }

    // B. Route new command
    const activeProjects = memories.filter(m => m.category === 'projects').map(m => m.content.trim());
    const userName = memories.find(m => m.category === 'name')?.content || 'Metin';
    
    addBridgeLog("Sekreter niyet tahlili yapılıyor...");
    const secretaryResult = await SecretaryService.processCommand(
      text,
      activeProjects,
      userName,
      geminiApiKey || undefined
    );

    if (secretaryResult.type !== 'chat') {
      // It is a secretary command!
      if (secretaryResult.waitingFor) {
        // Needs confirmation or clarification
        setPendingSecretaryCommand({
          type: secretaryResult.type,
          data: secretaryResult.data,
          originalText: text,
          waitingFor: secretaryResult.waitingFor
        });
        await sendAssistantReply(secretaryResult.message);
      } else if (secretaryResult.success) {
        // Direct save completed successfully
        await refreshDashboardData();
        await sendAssistantReply(secretaryResult.message);
      } else {
        await sendAssistantReply("Üzgünüm, komutu işlerken bir sorun oluştu.");
      }
      return;
    }

    // Memory Engine Triggers: Save / Remember (Explicit triggers only)
    if (MemoryService.shouldSaveMemory(text)) {
      setAvatarMood('focused');
      addBridgeLog(`Hafıza tetiklendi: Bilgi ayıklanıyor...`);
      const extracted = await MemoryService.extractMemoryFromText(text, geminiApiKey);
      if (extracted) {
        const newMemory: MemoryItem = {
          id: Date.now().toString(),
          category: extracted.category,
          content: extracted.content,
          timestamp: new Date().toISOString()
        };
        await databaseService.saveMemory(newMemory);
        const updatedMemories = await databaseService.getMemories();
        setMemories(updatedMemories);
        refreshExecutiveStatus(todos, reminders, updatedMemories);
        addBridgeLog(`Hafızaya eklendi: [${newMemory.category}] -> "${newMemory.content}"`);

        const categoryNames: Record<MemoryCategory, string> = {
          name: 'adınızı',
          job: 'mesleğinizi',
          projects: 'projenizi',
          habits: 'alışkanlığınızı',
          importantNotes: 'önemli notunuzu',
          ongoingTasks: 'devam eden işinizi',
          preferences: 'tercihinizi',
          general: 'bilgiyi'
        };
        const categoryName = categoryNames[newMemory.category] || 'bilgiyi';

        const responseMsg: Message = {
          role: 'assistant',
          content: `Bu bilgiyi hafızama kaydettim. ${categoryName} "${newMemory.content}" olarak hatırlayacağım.`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, responseMsg]);
        await databaseService.saveChatMessage(responseMsg);
        speakText(responseMsg.content, () => {
          if (isWakeWordListening) startWakeWordRecognition();
        });
      } else {
        const responseMsg: Message = {
          role: 'assistant',
          content: `Üzgünüm, ifadeden net bir hafıza bilgisi çıkaramadım. Lütfen daha net belirtin.`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, responseMsg]);
        await databaseService.saveChatMessage(responseMsg);
        speakText(responseMsg.content, () => {
          if (isWakeWordListening) startWakeWordRecognition();
        });
      }
      return;
    }

    // Memory Engine Triggers: Query / Read
    if (MemoryService.isQueryingMemory(text)) {
      addBridgeLog(`Hafıza sorgulandı: Bilgiler listeleniyor...`);
      const categoryLabels: Record<MemoryCategory, string> = {
        name: 'Adınız',
        job: 'Mesleğiniz',
        projects: 'Projeleriniz',
        habits: 'Alışkanlıklarınız',
        importantNotes: 'Önemli notlarınız',
        ongoingTasks: 'Devam eden işleriniz',
        preferences: 'Tercihleriniz',
        general: 'Diğer Hatırladıklarım'
      };

      if (memories.length === 0) {
        const responseMsg: Message = {
          role: 'assistant',
          content: `Şu an sizin hakkınızda hafızamda kayıtlı hiçbir bilgi bulunmamaktadır. Bana "Benim adım X, bunu hatırla" veya "Kahveyi sütsüz severim, benim için kaydet" diyerek bilgi öğretebilirsiniz.`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, responseMsg]);
        await databaseService.saveChatMessage(responseMsg);
        speakText(responseMsg.content, () => {
          if (isWakeWordListening) startWakeWordRecognition();
        });
        return;
      }

      let reply = 'Sizin hakkınızda şunları hatırlıyorum:\n';
      const grouped: Record<MemoryCategory, string[]> = {
        name: [], job: [], projects: [], habits: [], importantNotes: [], ongoingTasks: [], preferences: [], general: []
      };
      memories.forEach(m => {
        if (grouped[m.category]) {
          grouped[m.category].push(m.content);
        } else {
          grouped.general.push(m.content);
        }
      });

      Object.keys(grouped).forEach(cat => {
        const category = cat as MemoryCategory;
        if (grouped[category].length > 0) {
          reply += `• ${categoryLabels[category]}: ${grouped[category].join(', ')}\n`;
        }
      });

      const responseMsg: Message = {
        role: 'assistant',
        content: reply.trim(),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, responseMsg]);
      await databaseService.saveChatMessage(responseMsg);
      speakText(responseMsg.content, () => {
        if (isWakeWordListening) startWakeWordRecognition();
      });
      return;
    }

    // Memory Engine Triggers: Delete / Forget
    if (MemoryService.isDeleteRequest(text)) {
      addBridgeLog(`Hafıza silme talebi algılandı.`);
      if (textLower.includes('tüm') || textLower.includes('hepsini') || textLower.includes('hafızayı temizle') || textLower.includes('hafızamı temizle')) {
        await databaseService.clearMemories();
        setMemories([]);
        refreshExecutiveStatus(todos, reminders, []);
        addBridgeLog(`Tüm hafıza veritabanından silindi.`);
        const responseMsg: Message = {
          role: 'assistant',
          content: `Hafızamdaki hakkınızdaki tüm bilgileri sildim ve sıfırladım.`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, responseMsg]);
        await databaseService.saveChatMessage(responseMsg);
        speakText(responseMsg.content, () => {
          if (isWakeWordListening) startWakeWordRecognition();
        });
        return;
      } else {
        const responseMsg: Message = {
          role: 'assistant',
          content: `Hakkınızdaki belirli bilgileri silmek için sol menüdeki "Hafıza Yönetimi" panelini kullanabilir ve dilediğiniz kaydı tek tıkla kaldırabilirsiniz.`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, responseMsg]);
        await databaseService.saveChatMessage(responseMsg);
        speakText(responseMsg.content, () => {
          if (isWakeWordListening) startWakeWordRecognition();
        });
        return;
      }
    }

    if (textLower.includes('ara') || textLower.includes('telefon')) {
      const match = contacts.find(c => textLower.includes(c.name.toLowerCase()));
      if (match) {
        addBridgeLog(`Köprü tetiklendi: Arama yapılıyor -> ${match.name} (${match.phoneNumber})`);
        await bridgeService.makePhoneCall(match.phoneNumber);

        const responseMsg: Message = {
          role: 'assistant',
          content: `${match.name} rehberinizden bulunarak yerel çevirici (dialer) üzerinden arandı.`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, responseMsg]);
        await databaseService.saveChatMessage(responseMsg);
        speakText(responseMsg.content, () => {
          if (isWakeWordListening) startWakeWordRecognition();
        });
        return;
      }
    }

    const isMessageCommand =
      textLower.includes('mesaj') ||
      textLower.includes('whatsapp') ||
      textLower.includes('yaz') ||
      textLower.includes('gönder');

    if (isMessageCommand) {
      const match = contacts.find(c => textLower.includes(c.name.toLowerCase()));
      if (match) {
        let msgToSend = 'Merhaba!';
        const quoteMatch = text.match(/"([^"]+)"/);
        if (quoteMatch) {
          msgToSend = quoteMatch[1];
        } else {
          // Smart Turkish parser to extract message content
          const nameIndex = textLower.indexOf(match.name.toLowerCase());
          if (nameIndex !== -1) {
            let remainingText = text.slice(nameIndex + match.name.length).trim();

            // Remove dative/accusative case suffixes from name (e.g., 'a, 'e, -ya, -ye)
            remainingText = remainingText.replace(/^['\-]?(a|e|ya|ye|ı|i|u|ü|yi|yı)\s+/, '').trim();

            const diyeIndex = remainingText.toLowerCase().lastIndexOf(' diye');
            if (diyeIndex !== -1) {
              msgToSend = remainingText.slice(0, diyeIndex).trim();
            } else {
              // Strip trailing command verbs
              const verbRegex = /\s*(mesaj\s*at|mesaj\s*gönder|mesaj\s*yaz|whatsapp|yaz|söyle|gönder|de|at)$/i;
              const cleanText = remainingText.replace(verbRegex, '').trim();
              if (cleanText) {
                msgToSend = cleanText;
              }
            }
          }
        }
        addBridgeLog(`Köprü tetiklendi: WhatsApp mesajı -> ${match.name} (${match.phoneNumber}): "${msgToSend}"`);
        await bridgeService.sendWhatsAppMessage(match.phoneNumber, msgToSend);

        const responseMsg: Message = {
          role: 'assistant',
          content: `${match.name} kişisine WhatsApp üzerinden "${msgToSend}" mesajı göndermek için yönlendirme yapıldı.`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, responseMsg]);
        await databaseService.saveChatMessage(responseMsg);
        speakText(responseMsg.content, () => {
          if (isWakeWordListening) startWakeWordRecognition();
        });
        return;
      }
    }

    if (textLower.includes('hatırlat') || textLower.includes('ajanda') || textLower.includes('etkinlik')) {
      let title = 'Yeni Hatırlatıcı';
      const quoteMatch = text.match(/"([^"]+)"/);
      if (quoteMatch) {
        title = quoteMatch[1];
      } else {
        title = text.replace(/hatırlat/g, '').replace(/bana/g, '').trim();
      }

      const newReminder: Reminder = {
        id: Date.now().toString(),
        title,
        dateTime: new Date(Date.now() + 3600000), // In 1 hour
        isCompleted: false
      };

      await databaseService.saveReminder(newReminder);
      const loadedReminders = await databaseService.getReminders();
      setReminders(loadedReminders);
      refreshExecutiveStatus(todos, loadedReminders, memories);
      addBridgeLog(`Veritabanı güncellendi: Hatırlatıcı eklendi -> ${title}`);

      const responseMsg: Message = {
        role: 'assistant',
        content: `"${title}" hatırlatıcınız başarıyla yerel veritabanına kaydedildi.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, responseMsg]);
      await databaseService.saveChatMessage(responseMsg);
      speakText(responseMsg.content, () => {
        if (isWakeWordListening) startWakeWordRecognition();
      });
      return;
    }

    // Voice Command: Take a note ("not al", "not ekle", etc.)
    const isNoteCommand =
      textLower.includes('not al') ||
      textLower.includes('not ekle') ||
      textLower.includes('not yaz') ||
      textLower.includes('not et') ||
      textLower.startsWith('not:');

    if (isNoteCommand) {
      let noteContent = text
        .replace(/moni/gi, '')
        .replace(/not al/gi, '')
        .replace(/not ekle/gi, '')
        .replace(/not yaz/gi, '')
        .replace(/not et/gi, '')
        .trim();

      noteContent = noteContent.replace(/^[:\-,\s]+/, '').trim();

      if (!noteContent) {
        noteContent = "Boş Not";
      }

      const words = noteContent.split(/\s+/);
      let title = words.slice(0, 5).join(' ');
      if (title.length > 30) {
        title = title.slice(0, 27) + '...';
      }
      if (!title) {
        title = "Yeni Not";
      }

      const newNote = {
        id: Date.now().toString(),
        title: title,
        content: noteContent,
        dateTime: new Date(),
        color: '#9d4ede'
      };

      await databaseService.saveNote(newNote);
      const updatedNotes = await databaseService.getNotes();
      setNotes(updatedNotes);
      addBridgeLog(`Veritabanı güncellendi: Not eklendi -> ${title}`);

      const responseMsg: Message = {
        role: 'assistant',
        content: `"${title}" başlığıyla notunuzu kaydettim.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, responseMsg]);
      await databaseService.saveChatMessage(responseMsg);
      speakText(responseMsg.content, () => {
        if (isWakeWordListening) startWakeWordRecognition();
      });
      return;
    }

    // Voice Command: Set/adjust appointment ("randevu ayarla", "randevu ekle", "toplantı")
    const isAppointmentCommand =
      textLower.includes('randevu') ||
      textLower.includes('toplantı') ||
      textLower.includes('buluşma');

    if (isAppointmentCommand) {
      let targetDate = new Date();

      if (textLower.includes('yarın')) {
        targetDate.setDate(targetDate.getDate() + 1);
      } else if (textLower.includes('öbür gün') || textLower.includes('ertesi gün')) {
        targetDate.setDate(targetDate.getDate() + 2);
      }

      let hour = 12;
      let minute = 0;
      let timeFound = false;

      const timeRegex = /(?:saat\s*)?(\d{1,2})[\s:.]+(\d{2})/i;
      const timeMatch = textLower.match(timeRegex);
      if (timeMatch) {
        hour = parseInt(timeMatch[1], 10);
        minute = parseInt(timeMatch[2], 10);
        timeFound = true;
      } else {
        const hourRegex = /saat\s*(\d{1,2})/i;
        const hourMatch = textLower.match(hourRegex);
        if (hourMatch) {
          hour = parseInt(hourMatch[1], 10);
          timeFound = true;
        } else {
          const textHours: { [key: string]: number } = {
            'bir': 1, 'iki': 2, 'üç': 3, 'dört': 4, 'dort': 4, 'beş': 5, 'bes': 5,
            'altı': 6, 'alti': 6, 'yedi': 7, 'sekiz': 8, 'dokuz': 9, 'on': 10,
            'on bir': 11, 'oniki': 12, 'on iki': 12, 'on üç': 13, 'on dört': 14,
            'on beş': 15, 'on altı': 16, 'on yedi': 17, 'on sekiz': 18, 'on dokuz': 19,
            'yirmi': 20, 'yirmi bir': 21, 'yirmi iki': 22, 'yirmi üç': 23
          };
          for (const key of Object.keys(textHours)) {
            if (textLower.includes(`saat ${key}`)) {
              hour = textHours[key];
              timeFound = true;
              break;
            }
          }
        }
      }

      if (timeFound) {
        targetDate.setHours(hour, minute, 0, 0);
      } else {
        targetDate = new Date(Date.now() + 3600000);
      }

      let title = text
        .replace(/moni/gi, '')
        .replace(/randevumu ayarla/gi, '')
        .replace(/randevu ayarla/gi, '')
        .replace(/randevu ekle/gi, '')
        .replace(/randevu/gi, '')
        .replace(/toplantı ekle/gi, '')
        .replace(/toplantısı/gi, '')
        .replace(/toplantı/gi, '')
        .replace(/yarın/gi, '')
        .replace(/bugün/gi, '')
        .replace(/öbür gün/gi, '')
        .replace(/(saat\s*)?\d{1,2}([\s:.]+\d{2})?/gi, '')
        .replace(/saat\s*(bir|iki|üç|dört|dort|beş|bes|altı|alti|yedi|sekiz|dokuz|on|yirmi)/gi, '')
        .trim();

      title = title.replace(/^[:\-,\s]+/, '').trim();
      if (!title) {
        title = "Randevu / Etkinlik";
      }

      const newReminder: Reminder = {
        id: Date.now().toString(),
        title,
        dateTime: targetDate,
        isCompleted: false
      };

      await databaseService.saveReminder(newReminder);
      const updatedReminders = await databaseService.getReminders();
      setReminders(updatedReminders);
      refreshExecutiveStatus(todos, updatedReminders, memories);
      addBridgeLog(`Veritabanı güncellendi: Randevu eklendi -> ${title} (${targetDate.toLocaleString('tr-TR')})`);

      const dateStr = targetDate.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' });
      const timeStr = targetDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      const responseMsg: Message = {
        role: 'assistant',
        content: `Randevunuz ayarlandı: ${dateStr} saat ${timeStr}'da "${title}" etkinliğini kaydettim.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, responseMsg]);
      await databaseService.saveChatMessage(responseMsg);
      speakText(responseMsg.content, () => {
        if (isWakeWordListening) startWakeWordRecognition();
      });
      return;
    }

    // Voice Command: Add task ("görev ekle", "yapılacak ekle", etc.)
    const isTodoCommand =
      textLower.includes('görev ekle') ||
      textLower.includes('yapılacak ekle') ||
      textLower.includes('listeye ekle');

    if (isTodoCommand) {
      let task = text
        .replace(/moni/gi, '')
        .replace(/görev ekle/gi, '')
        .replace(/yapılacak ekle/gi, '')
        .replace(/listeye ekle/gi, '')
        .trim();

      task = task.replace(/^[:\-,\s]+/, '').trim();
      if (!task) {
        task = "Yeni Görev";
      }

      let priority: 'low' | 'medium' | 'high' = 'medium';
      if (textLower.includes('yüksek') || textLower.includes('önemli') || textLower.includes('acil')) {
        priority = 'high';
      } else if (textLower.includes('düşük') || textLower.includes('önemsiz')) {
        priority = 'low';
      }

      const newTodo = {
        id: Date.now().toString(),
        task,
        dateTime: new Date(),
        isCompleted: false,
        priority
      };

      await databaseService.saveTodo(newTodo);
      const updatedTodos = await databaseService.getTodos();
      setTodos(updatedTodos);
      refreshExecutiveStatus(updatedTodos, reminders, memories);
      addBridgeLog(`Veritabanı güncellendi: Görev eklendi -> ${task}`);

      const responseMsg: Message = {
        role: 'assistant',
        content: `"${task}" görevini yapılacaklar listenize ekledim.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, responseMsg]);
      await databaseService.saveChatMessage(responseMsg);
      speakText(responseMsg.content, () => {
        if (isWakeWordListening) startWakeWordRecognition();
      });
      return;
    }

    // Default AI response - CANLI AKIS (STREAM) MODU
    console.log('[CHAT-1] Kullanıcı mesajı gönderildi:', text);
    
    // Add temporary assistant msg for streaming or text placeholder
    const newMsgId = 'assistant-' + Date.now();
    const streamingAssistantMsg: Message = {
      id: newMsgId,
      role: 'assistant',
      content: '',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, streamingAssistantMsg]);

    try {
      setMoniStatus('thinking');
      setAvatarMood('thinking');
      
      const replyText = await generateAIReply(text);
      console.log('[CHAT-4] AI cevabı geldi:', replyText);

      // Update UI with finalized reply
      setMessages(prev => {
        if (prev.length === 0) return prev;
        const updated = [...prev];
        const lastIdx = updated.length - 1;
        if (updated[lastIdx].role === 'assistant') {
          updated[lastIdx] = { ...updated[lastIdx], content: replyText };
        }
        return updated;
      });

      const finalAiMsg: Message = {
        id: newMsgId,
        role: 'assistant',
        content: replyText,
        timestamp: new Date()
      };
      await databaseService.saveChatMessage(finalAiMsg);
      console.log('[CHAT-5] Assistant mesajı state’e eklendi');

      setMoniStatus('idle');
      setAvatarMood('neutral');

      // Moni'nin sesiyle nihai cevabı seslendiriyoruz
      if (autoSpeakEnabled && replyText.trim()) {
        console.log('[CHAT-6] TTS başlatıldı');
        setCurrentlySpeakingMsgId(newMsgId);
        speakText(replyText, () => {
          setCurrentlySpeakingMsgId(null);
          setMoniStatus('idle');
          setAvatarMood('neutral');
        }, undefined, "wake");
      } else {
        if (isWakeWordListening) startWakeWordRecognition();
      }

    } catch (e: any) {
      console.error('[MONI CHAT ERROR] Canli akis guncellemesinde hata olustu:', e);
      setMoniStatus('idle');
      setAvatarMood('neutral');
      setCurrentlySpeakingMsgId(null);
      isSpeakingRef.current = false;

      let errorMsgText = `Bağlantı hatası oluştu: ${e.message || e}`;
      if (!geminiApiKey || !geminiApiKey.trim()) {
        errorMsgText = "AI bağlantısı aktif değil. Lütfen API anahtarlarını kontrol edin.";
      }

      setMessages(prev => {
        if (prev.length === 0) return prev;
        const updated = [...prev];
        const lastIdx = updated.length - 1;
        if (updated[lastIdx].role === 'assistant') {
          updated[lastIdx] = { ...updated[lastIdx], content: errorMsgText };
        }
        return updated;
      });

      const errorAiMsg: Message = {
        id: newMsgId,
        role: 'assistant',
        content: errorMsgText,
        timestamp: new Date()
      };
      await databaseService.saveChatMessage(errorAiMsg);
      console.log('[CHAT-5] Assistant mesajı (hata) state’e eklendi');
      console.log('[AI-7] Assistant state güncellendi (Hata)');

      speakText(errorMsgText, undefined, undefined, "wake");
    }
  };

  const simulateMicListening = () => {
    if (isRecording) {
      setIsRecording(false);
      return;
    }

    setIsRecording(true);
    addBridgeLog('Yerel Mikrofon Servisi (Simülasyon): Ses kaydediliyor...');

    setTimeout(async () => {
      setIsRecording(false);
      const randomCommands = [
        "Moni, Ahmet Yılmaz'ı ara",
        "Moni, Zeynep Kaya'ya WhatsApp'tan \"Toplantı ertelendi\" yaz",
        "Moni, bana \"Saat 15:00'te kod incelemesi\" hatırlat",
        "Bugün ajandamda ne var?",
        "Moni, hava durumu nasıl?"
      ];
      const selectedCommand = randomCommands[Math.floor(Math.random() * randomCommands.length)];
      addBridgeLog(`Ses İşlendi (Simüle STT): "${selectedCommand}"`);
      await handleSendMessage(selectedCommand);
    }, 2500);
  };

  const handleMicClick = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    // If already recording — stop the current session cleanly
    if (isRecording && commandRecRef.current) {
      manuallyStoppedRef.current = true;
      try { commandRecRef.current.stop(); } catch (_) {}
      commandRecRef.current = null;
      setIsRecording(false);
      setMoniStatus('idle');
      setAvatarMood('neutral');
      addBridgeLog('Sesli komut modu kullanıcı tarafından durduruldu.');
      return;
    }

    if (!SpeechRecognition) {
      // STT not supported — brief transient error indicator, then show sim mode
      showTemporaryError(
        'Tarayıcınız sesli komutları (Web Speech API) desteklemiyor. Chrome veya Edge kullanın.',
        'Hata: Web Speech API tarayıcınızda desteklenmiyor.'
      );
      alert('Tarayıcınız ses tanımayı (Web Speech API) desteklemiyor. Türkçe sesli etkileşim için Google Chrome veya Edge kullanmanızı öneririz. (Test için Simülasyon Modu başlatılıyor)');
    }

    if ((window as any).moniAudioContext) {
      playAssistantBeep((window as any).moniAudioContext);
    }

    setTimeout(() => {
      if (SpeechRecognition) {
        startCommandListening();
      } else {
        simulateMicListening();
      }
    }, 550);
  };

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName || !newContactPhone) return;

    const contact: Contact = {
      id: Date.now().toString(),
      name: newContactName,
      phoneNumber: newContactPhone
    };

    await databaseService.saveContact(contact);
    const loaded = await databaseService.getContacts();
    setContacts(loaded);

    setNewContactName('');
    setNewContactPhone('');
    addBridgeLog(`Kişi Eklendi: ${contact.name}`);
  };

  const handleDeleteContact = async (id: string) => {
    await databaseService.deleteContact(id);
    const loaded = await databaseService.getContacts();
    setContacts(loaded);
    addBridgeLog(`Kişi Silindi: ${id}`);
  };

  const handleAddReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReminderTitle) return;

    const reminder: Reminder = {
      id: Date.now().toString(),
      title: newReminderTitle,
      dateTime: new Date(Date.now() + 3600000),
      isCompleted: false
    };

    await databaseService.saveReminder(reminder);
    const loaded = await databaseService.getReminders();
    setReminders(loaded);
    refreshExecutiveStatus(todos, loaded, memories);

    setNewReminderTitle('');
    addBridgeLog(`Hatırlatıcı Eklendi: ${reminder.title}`);
  };

  const handleDeleteReminder = async (id: string) => {
    await databaseService.deleteReminder(id);
    const loaded = await databaseService.getReminders();
    setReminders(loaded);
    refreshExecutiveStatus(todos, loaded, memories);
    addBridgeLog(`Hatırlatıcı Silindi: ${id}`);
  };

  const handleAddCalendarAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReminderTitle.trim()) return;

    const [hours, minutes] = newReminderTime.split(':').map(Number);
    const appointmentDate = new Date(selectedDate);
    appointmentDate.setHours(hours, minutes, 0, 0);

    const reminder: Reminder = {
      id: Date.now().toString(),
      title: newReminderTitle,
      dateTime: appointmentDate,
      isCompleted: false
    };

    await databaseService.saveReminder(reminder);
    const loaded = await databaseService.getReminders();
    setReminders(loaded);
    refreshExecutiveStatus(todos, loaded, memories);

    setNewReminderTitle('');
    addBridgeLog(`Randevu Eklendi: ${reminder.title} (${appointmentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`);
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteTitle.trim() || !newNoteContent.trim()) return;

    const note: Note = {
      id: Date.now().toString(),
      title: newNoteTitle,
      content: newNoteContent,
      dateTime: new Date(),
      color: newNoteColor
    };

    await databaseService.saveNote(note);
    const loaded = await databaseService.getNotes();
    setNotes(loaded);

    setNewNoteTitle('');
    setNewNoteContent('');
    addBridgeLog(`Not Eklendi: ${note.title}`);
  };

  const handleDeleteNote = async (id: string) => {
    await databaseService.deleteNote(id);
    const loaded = await databaseService.getNotes();
    setNotes(loaded);
    addBridgeLog(`Not Silindi: ${id}`);
  };

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoTask.trim()) return;

    const todo: Todo = {
      id: Date.now().toString(),
      task: newTodoTask,
      dateTime: new Date(),
      isCompleted: false,
      priority: newTodoPriority
    };

    await databaseService.saveTodo(todo);
    const loaded = await databaseService.getTodos();
    setTodos(loaded);
    refreshExecutiveStatus(loaded, reminders, memories);

    setNewTodoTask('');
    addBridgeLog(`Görev Eklendi: ${todo.task} (Öncelik: ${todo.priority})`);
  };

  const handleToggleTodo = async (todo: Todo) => {
    const updated: Todo = { ...todo, isCompleted: !todo.isCompleted };
    await databaseService.saveTodo(updated);
    const loaded = await databaseService.getTodos();
    setTodos(loaded);
    refreshExecutiveStatus(loaded, reminders, memories);
    addBridgeLog(`Görev güncellendi: ${todo.task} -> ${updated.isCompleted ? 'Tamamlandı' : 'Bekliyor'}`);
  };

  const handleDeleteTodo = async (id: string) => {
    await databaseService.deleteTodo(id);
    const loaded = await databaseService.getTodos();
    setTodos(loaded);
    refreshExecutiveStatus(loaded, reminders, memories);
    addBridgeLog(`Görev Silindi: ${id}`);
  };

  const handleClearHistory = async () => {
    await databaseService.clearChatHistory();
    setMessages([]);
    addBridgeLog('Sohbet geçmişi yerel veritabanından silindi.');
  };

  const renderDashboard2View = () => {
    const todayReminders = reminders.filter(r => {
      const d = new Date(r.dateTime);
      const now = new Date();
      return (
        d.getDate() === now.getDate() &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear()
      );
    }).sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', boxSizing: 'border-box' }}>
        <div className="dashboard2-header-card" style={{ display: 'flex', flexDirection: 'row', gap: '14px', background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%)', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '16px 14px', borderRadius: '24px', boxShadow: 'var(--glass-shadow)', alignItems: 'center', width: '100%', boxSizing: 'border-box' }}>
          <div className="dashboard2-avatar-wrapper" style={{ width: '110px', height: '110px', borderRadius: '50%', border: moniStatus === 'listening' ? '2.5px solid var(--accent-cyan)' : moniStatus === 'thinking' ? '2.5px solid #ffd700' : moniStatus === 'speaking' ? '2.5px solid var(--accent-purple)' : moniStatus === 'error' ? '2.5px solid var(--accent-red)' : '2px solid rgba(255, 255, 255, 0.15)', boxShadow: moniStatus === 'listening' ? '0 0 20px rgba(0, 240, 255, 0.5)' : moniStatus === 'thinking' ? '0 0 20px rgba(255, 215, 0, 0.5)' : moniStatus === 'speaking' ? '0 0 20px rgba(157, 78, 221, 0.5)' : 'none', overflow: 'hidden', position: 'relative', flexShrink: 0, transition: 'all 0.3s ease' }}>
        

            <MoniAvatar
              status={moniStatus}
              isSpeaking={moniStatus === 'speaking'}
              mood={avatarMood}
              avatarType={avatarType}
              eyeColor={eyeColor}
              animationsEnabled={avatarAnimationsEnabled}
              mouthAnimationEnabled={avatarMouthAnimationEnabled}
              effectsIntensity={avatarEffectsIntensity}
            />
          </div>

          {/* Daily Brief Box */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.9rem' }}>🧠</span>
              <span style={{ fontSize: '0.82rem', fontWeight: '800', color: 'var(--accent-cyan)', letterSpacing: '0.3px' }}>
                MONI GÜNLÜK BRİFİNGİ
              </span>
              {isGeneratingBrief && (
                <span style={{ fontSize: '0.62rem', color: '#ffd700', animation: 'pulse 1.2s infinite' }}>
                  (Hazırlanıyor...)
                </span>
              )}
            </div>
            
            <div style={{
              fontSize: '0.76rem',
              color: '#e0e0e0',
              lineHeight: '1.45',
              maxHeight: '85px',
              overflowY: 'auto',
              background: 'rgba(7, 8, 13, 0.4)',
              padding: '8px 10px',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.04)',
              wordBreak: 'break-word'
            }}>
              {dailyBriefText}
            </div>

            <button
              onClick={handleSpeakDailyBrief}
              style={{
                background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.12), rgba(157, 78, 221, 0.12))',
                border: '1px solid rgba(0, 240, 255, 0.25)',
                borderRadius: '20px',
                padding: '5px 14px',
                color: 'var(--accent-cyan)',
                fontSize: '0.72rem',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                alignSelf: 'flex-start',
                transition: 'all 0.2s',
                fontFamily: 'var(--font-sans)',
                outline: 'none'
              }}
              className="hover-scale"
            >
              {currentlySpeakingMsgId === 'daily-brief' ? '🛑 Okumayı Durdur' : '🔊 Brifingi Seslendir'}
            </button>
          </div>
        </div>

        {/* Highlighted Top Priority Todo Section */}
        {(() => {
          const topTask = scoredTodos.find(t => !t.isCompleted);
          if (!topTask) {
            return (
              <div style={{
                background: 'rgba(46, 196, 182, 0.04)',
                border: '1px dashed rgba(46, 196, 182, 0.25)',
                padding: '14px',
                borderRadius: '18px',
                textAlign: 'center',
                color: 'var(--accent-green)',
                fontSize: '0.78rem',
                fontWeight: '600'
              }}>
                🎉 Günün yüksek öncelikli bekleyen görevi bulunmuyor. Harika gidiyorsunuz!
              </div>
            );
          }

          const pColor = topTask.priority === 'high' ? '#ff3838' : topTask.priority === 'medium' ? '#ffd700' : '#00f0ff';

          return (
            <div style={{
              background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.05) 0%, rgba(12, 14, 22, 0.4) 100%)',
              border: '1px solid rgba(212, 175, 55, 0.25)',
              padding: '14px 16px',
              borderRadius: '20px',
              boxShadow: '0 4px 20px rgba(212, 175, 55, 0.05)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              width: '100%',
              boxSizing: 'border-box'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.9rem' }}>🎯</span>
                  <span style={{ fontSize: '0.72rem', fontWeight: '850', color: '#ffd700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Günün En Yüksek Öncelikli Görevi (Skor: {topTask.score})
                  </span>
                </div>
                <span style={{
                  fontSize: '0.62rem',
                  fontWeight: 700,
                  color: pColor,
                  background: `${pColor}12`,
                  border: `1px solid ${pColor}40`,
                  padding: '2px 6px',
                  borderRadius: '4px'
                }}>
                  {topTask.priority === 'high' ? 'Yüksek' : topTask.priority === 'medium' ? 'Orta' : 'Düşük'}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input
                  type="checkbox"
                  checked={topTask.isCompleted}
                  onChange={() => handleToggleTodo(topTask)}
                  style={{ width: '18px', height: '18px', accentColor: '#ffd700', cursor: 'pointer', flexShrink: 0 }}
                />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
                  <span style={{ fontSize: '0.86rem', fontWeight: '700', color: '#fff', wordBreak: 'break-word' }}>
                    {topTask.task}
                  </span>
                  <span style={{ fontSize: '0.66rem', color: 'var(--color-muted)' }}>
                    Oluşturulma: {new Date(topTask.dateTime).toLocaleString('tr-TR')}
                  </span>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Moni's Recommendations */}
        <div style={{
          background: 'rgba(12, 14, 22, 0.4)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          padding: '14px 16px',
          borderRadius: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.9rem' }}>💡</span>
            <span style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--accent-purple)', letterSpacing: '0.3px' }}>
              MONI'NİN TAVSİYELERİ
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {recommendations.length === 0 ? (
              <span style={{ fontSize: '0.74rem', color: 'var(--color-muted)', fontStyle: 'italic' }}>
                Şu an için yeni bir aksiyon önerisi bulunmuyor.
              </span>
            ) : (
              recommendations.map((rec, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <span style={{ color: '#ffd700', fontSize: '0.8rem', marginTop: '1px' }}>✦</span>
                  <span style={{ fontSize: '0.76rem', color: '#e0e0e0', lineHeight: '1.4' }}>{rec}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Today's Agenda & Active Projects Side-by-Side (or stacked on mobile) */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          width: '100%'
        }}>
          {/* Today's Agenda */}
          <div style={{
            background: 'rgba(12, 14, 22, 0.4)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            padding: '14px 16px',
            borderRadius: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            width: '100%',
            boxSizing: 'border-box'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.9rem' }}>📅</span>
                <span style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--accent-cyan)', letterSpacing: '0.3px' }}>
                  BUGÜNKÜ AJANDA
                </span>
              </div>
              <span style={{ fontSize: '0.68rem', color: 'var(--color-muted)' }}>{todayReminders.length} planlı iş</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '160px', overflowY: 'auto' }}>
              {todayReminders.length === 0 ? (
                <span style={{ fontSize: '0.74rem', color: 'var(--color-muted)', fontStyle: 'italic', padding: '6px 0' }}>
                  Bugün için planlanmış bir randevu veya hatırlatıcı bulunmuyor.
                </span>
              ) : (
                todayReminders.map(rem => (
                  <div
                    key={rem.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: 'rgba(255, 255, 255, 0.01)',
                      border: '1px solid rgba(255, 255, 255, 0.03)',
                      borderRadius: '12px',
                      padding: '8px 12px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                      <span style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.72rem',
                        fontWeight: '700',
                        color: 'var(--accent-purple)',
                        flexShrink: 0
                      }}>
                        {new Date(rem.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span style={{
                        fontSize: '0.78rem',
                        color: '#fff',
                        textDecoration: rem.isCompleted ? 'line-through' : 'none',
                        opacity: rem.isCompleted ? 0.5 : 1,
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis',
                        overflow: 'hidden'
                      }}>
                        {rem.title}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteReminder(rem.id)}
                      style={{ background: 'transparent', border: 'none', color: 'rgba(255, 56, 56, 0.65)', cursor: 'pointer', fontSize: '0.74rem', flexShrink: 0 }}
                    >
                      ✕
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Active Projects Tag Cloud */}
          <div style={{
            background: 'rgba(12, 14, 22, 0.4)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            padding: '14px 16px',
            borderRadius: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            width: '100%',
            boxSizing: 'border-box'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.9rem' }}>📁</span>
              <span style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--accent-purple)', letterSpacing: '0.3px' }}>
                TAKİPTEKİ PROJELERİNİZ
              </span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {activeProjectsList.length === 0 ? (
                <span style={{ fontSize: '0.74rem', color: 'var(--color-muted)', fontStyle: 'italic', lineHeight: '1.4' }}>
                  Kayıtlı aktif projeniz bulunmuyor. Hafızaya proje eklemek için: "Moni, FitHayat projesini hatırla" demeniz yeterlidir.
                </span>
              ) : (
                activeProjectsList.map((project, i) => (
                  <span
                    key={i}
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: 'var(--accent-cyan)',
                      background: 'rgba(0, 240, 255, 0.06)',
                      border: '1px solid rgba(0, 240, 255, 0.22)',
                      padding: '4px 10px',
                      borderRadius: '20px',
                      boxShadow: '0 2px 6px rgba(0, 240, 255, 0.04)'
                    }}
                  >
                    #{project}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Voice Trigger Glowing Action Button */}
        <button
          onClick={handleMicClick}
          className={`btn-voice-trigger ${moniStatus !== 'idle' ? 'active' : ''}`}
          style={{
            background: moniStatus === 'listening'
              ? 'linear-gradient(135deg, rgba(0, 240, 255, 0.25), rgba(157, 78, 221, 0.15))'
              : moniStatus === 'thinking'
                ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.25), rgba(157, 78, 221, 0.15))'
                : moniStatus === 'speaking'
                  ? 'linear-gradient(135deg, rgba(157, 78, 221, 0.25), rgba(0, 240, 255, 0.15))'
                  : moniStatus === 'error'
                    ? 'linear-gradient(135deg, rgba(255, 56, 56, 0.25), rgba(157, 78, 221, 0.15))'
                    : 'linear-gradient(135deg, rgba(212, 175, 55, 0.25), rgba(157, 78, 221, 0.25))',
            border: moniStatus === 'listening'
              ? '2px solid var(--accent-cyan)'
              : moniStatus === 'thinking'
                ? '2px solid #ffd700'
                : moniStatus === 'speaking'
                  ? '2px solid var(--accent-purple)'
                  : moniStatus === 'error'
                    ? '2px solid var(--accent-red)'
                    : '2px solid #ffd700',
            borderRadius: '32px',
            color: moniStatus === 'listening'
              ? 'var(--accent-cyan)'
              : moniStatus === 'thinking'
                ? '#ffd700'
                : moniStatus === 'speaking'
                  ? 'var(--accent-purple)'
                  : moniStatus === 'error'
                    ? 'var(--accent-red)'
                    : '#ffd700',
            padding: '14px 32px',
            fontSize: '1rem',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            boxShadow: moniStatus === 'listening'
              ? '0 0 20px rgba(0, 240, 255, 0.4), inset 0 0 8px rgba(0, 240, 255, 0.1)'
              : moniStatus === 'thinking'
                ? '0 0 20px rgba(255, 215, 0, 0.4), inset 0 0 8px rgba(255, 215, 0, 0.1)'
                : moniStatus === 'speaking'
                  ? '0 0 20px rgba(157, 78, 221, 0.4), inset 0 0 8px rgba(157, 78, 221, 0.1)'
                  : moniStatus === 'error'
                    ? '0 0 20px rgba(255, 56, 56, 0.4), inset 0 0 8px rgba(255, 56, 56, 0.1)'
                    : '0 0 20px rgba(255, 215, 0, 0.2), inset 0 0 8px rgba(255, 215, 0, 0.1)',
            transition: 'all 0.3s ease',
            outline: 'none',
            fontFamily: 'var(--font-sans)',
            letterSpacing: '0.5px',
            width: '100%',
            boxSizing: 'border-box',
            marginTop: '6px'
          }}
        >
          <span style={{ fontSize: '1.2rem' }}>
            {moniStatus === 'listening' ? '●' : moniStatus === 'thinking' ? '⏳' : moniStatus === 'speaking' ? '🔊' : moniStatus === 'error' ? '⚠️' : '🎤'}
          </span>
          {moniStatus === 'listening' && 'Moni Dinliyor...'}
          {moniStatus === 'thinking' && 'Düşünüyor...'}
          {moniStatus === 'speaking' && 'Konuşuyor...'}
          {moniStatus === 'error' && 'Hata Oluştu!'}
          {moniStatus === 'idle' && 'Sesli Komut Ver'}
        </button>

        {/* Quick Icon Shortcuts Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '10px',
          width: '100%',
          marginTop: '4px',
          boxSizing: 'border-box'
        }}>
          {[
            { id: 'chat', label: 'Asistan', icon: '💬' },
            { id: 'calendar', label: 'Takvim', icon: '📅' },
            { id: 'todos', label: 'Görevler', icon: '📋' },
            { id: 'notes', label: 'Notlarım', icon: '📝' }
          ].map(item => (
            <div
              key={item.id}
              onClick={() => {
                setCurrentView(item.id as any);
                addBridgeLog(`Hızlı geçiş: ${item.label}`);
              }}
              style={{
                background: 'rgba(18, 20, 29, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '16px',
                padding: '10px 4px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: 'var(--glass-shadow)'
              }}
              className="home-nav-card"
            >
              <span style={{ fontSize: '1.3rem' }}>{item.icon}</span>
              <span style={{ fontSize: '0.66rem', fontWeight: '700', color: 'var(--color-secondary)' }}>{item.label}</span>
            </div>
          ))}
        </div>

        {/* Switch back to legacy layout link */}
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginTop: '6px' }}>
          <button
            onClick={() => {
              setIsDashboard2Enabled(false);
              localStorage.setItem('moni_is_dashboard2_enabled', 'false');
              addBridgeLog("Klasik ana ekran arayüzüne geçildi.");
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--color-muted)',
              fontSize: '0.74rem',
              textDecoration: 'underline',
              cursor: 'pointer',
              padding: '6px'
            }}
          >
            Klasik Ana Ekran Arayüzüne Dön
          </button>
        </div>

      </div>
    );
  };

  // Helper rendering functions for mobile subviews
  const renderHomeView = () => {
    if (isDashboard2Enabled) {
      return renderDashboard2View();
    }

    const nextReminder = reminders.find(r => !r.isCompleted);
    const reminderText = nextReminder
      ? `Saat ${new Date(nextReminder.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}'da ${nextReminder.title} var.`
      : "Bugün için başka planlı randevunuz yok.";

    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', flex: 1, gap: '20px' }}>

        {/* Animated Avatar Section */}
        <div style={{
          width: 'min(380px, 85vw)',
          height: 'min(380px, 85vw)',
          borderRadius: '24px',
          border: '2px solid rgba(0, 240, 255, 0.2)',
          boxShadow: '0 0 25px rgba(0, 240, 255, 0.15)',
          background: 'rgba(255, 255, 255, 0.02)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: '10px',
          position: 'relative',
          flexShrink: 0
        }}>
          {/* Moni Status Badge */}
          <div style={{
            position: 'absolute',
            top: '15px',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(7, 8, 13, 0.85)',
            padding: '6px 14px',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            fontSize: '0.74rem',
            fontWeight: '700',
            backdropFilter: 'blur(10px)',
            color: moniStatus === 'listening'
              ? 'var(--accent-cyan)'
              : moniStatus === 'thinking'
                ? '#ffd700'
                : moniStatus === 'speaking'
                  ? 'var(--accent-purple)'
                  : moniStatus === 'error'
                    ? 'var(--accent-red)'
                    : 'var(--color-secondary)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
            transition: 'all 0.3s ease'
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: 'currentColor',
              boxShadow: '0 0 8px currentColor',
              animation: moniStatus !== 'idle' ? 'status-pulse 1.2s infinite ease-in-out' : 'none'
            }} />
            <span style={{ letterSpacing: '0.3px' }}>
              {moniStatus === 'listening' && 'Moni: Dinliyor'}
              {moniStatus === 'thinking' && 'Moni: Düşünüyor'}
              {moniStatus === 'speaking' && 'Moni: Konuşuyor'}
              {moniStatus === 'error' && 'Moni: Hata'}
              {moniStatus === 'idle' && 'Moni: Bekliyor'}
            </span>
          </div>

          <div style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            borderRadius: '24px',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: moniStatus === 'listening'
              ? '0 0 35px rgba(0, 240, 255, 0.6), inset 0 0 20px rgba(0, 240, 255, 0.4)'
              : moniStatus === 'thinking'
                ? '0 0 35px rgba(255, 215, 0, 0.6), inset 0 0 20px rgba(255, 215, 0, 0.4)'
                : moniStatus === 'speaking'
                  ? '0 0 35px rgba(157, 78, 221, 0.6), inset 0 0 20px rgba(157, 78, 221, 0.4)'
                  : moniStatus === 'error'
                    ? '0 0 35px rgba(255, 56, 56, 0.6), inset 0 0 20px rgba(255, 56, 56, 0.4)'
                    : 'none',
            border: moniStatus === 'listening'
              ? '2px solid var(--accent-cyan)'
              : moniStatus === 'thinking'
                ? '2px solid #ffd700'
                : moniStatus === 'speaking'
                  ? '2px solid var(--accent-purple)'
                  : moniStatus === 'error'
                    ? '2px solid var(--accent-red)'
                    : '2px solid rgba(255, 255, 255, 0.15)',
            transition: 'all 0.4s ease'
          }}>
            <MoniLive2D
              status={moniStatus}
              isSpeaking={moniStatus === 'speaking'}
              mood={avatarMood}
              avatarType={avatarType}
              eyeColor={eyeColor}
              animationsEnabled={avatarAnimationsEnabled}
              mouthAnimationEnabled={avatarMouthAnimationEnabled}
              effectsIntensity={avatarEffectsIntensity}
            />
          </div>
        </div>

        {/* Avatar Customization Bar removed per request */}

        {/* Greeting Section */}
        <div style={{ textAlign: 'center', margin: '10px 0' }}>
          <h2 style={{ fontSize: '1.35rem', margin: '0 0 6px 0', fontWeight: '700', color: '#fff', letterSpacing: '-0.3px' }}>
            Merhaba, Ben Moni!
          </h2>
          <h3 style={{ fontSize: '1.2rem', margin: '0 0 10px 0', fontWeight: '600', color: '#ffd700' }}>
            Gününüz için hazırım.
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--color-secondary)', margin: 0, padding: '0 10px' }}>
            {reminderText}
          </p>

          {/* Voice Activation / Wake Word Status Indicator */}
          <div style={{
            margin: '12px auto',
            padding: '8px 12px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
            maxWidth: '320px',
            fontSize: '0.78rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}>
              <span className="pulse-cyan" style={{
                display: 'inline-block',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: moniStatus === 'speaking'
                  ? '#9d4edd'
                  : moniStatus === 'listening'
                    ? '#00f0ff'
                    : isWakeRecognitionActiveRef.current
                      ? '#39ff14'
                      : '#ffd700'
              }}></span>
              <span style={{ color: '#fff' }}>
                {moniStatus === 'speaking' && '🗣️ Konuşuyor'}
                {moniStatus === 'listening' && '🎤 Komut dinleniyor'}
                {moniStatus === 'thinking' && '⏳ Düşünüyor...'}
                {moniStatus === 'error' && '⚠️ Hata oluştu'}
                {moniStatus === 'idle' && (
                  isWakeRecognitionActiveRef.current
                    ? '🟢 Uyandırma dinlemede ("Moni" deyin)'
                    : '🟡 Mikrofon izni aktif'
                )}
              </span>
            </div>
            
            {/* Backend / OpenAI TTS connection warning */}
            {backendHealth.checked && (!backendHealth.ok || !backendHealth.hasKey) && (
              <span style={{ fontSize: '0.72rem', color: '#ff4d4d', textAlign: 'center', fontWeight: '500', padding: '2px 4px' }}>
                ⚠️ OpenAI kadın sesi bağlı değil, yerel ses kullanılıyor.
              </span>
            )}

            {/* iPhone specific warning */}
            {typeof navigator !== 'undefined' && (/iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) ? (
              <span style={{ fontSize: '0.68rem', color: '#ffb703', textAlign: 'center', lineHeight: '1.2' }}>
                ℹ️ iPhone'da Moni'nin sizi duyabilmesi için sayfa açık ve ekran aktif olmalıdır.
              </span>
            ) : (
              <span style={{ fontSize: '0.68rem', color: 'rgba(255, 255, 255, 0.4)' }}>
                Sayfa açıkken Moni sizi doğrudan dinleyebilir.
              </span>
            )}
          </div>

          {!geminiApiKey && (
            <button
              onClick={() => setCurrentView('settings')}
              style={{
                marginTop: '12px',
                background: 'rgba(0, 240, 255, 0.1)',
                border: '1px dashed var(--accent-cyan)',
                borderRadius: '20px',
                color: 'var(--accent-cyan)',
                padding: '8px 18px',
                fontSize: '0.78rem',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 0 15px rgba(0, 240, 255, 0.15)',
                transition: 'all 0.2s',
                fontFamily: 'var(--font-sans)',
                outline: 'none'
              }}
              className="hover-scale"
            >
              🔑 Yapay Zekayı Etkinleştir (API Anahtarı Gir)
            </button>
          )}
        </div>

        {/* Sesli Komut Ver Button (Big glowing pill) */}
        <button
          onClick={handleMicClick}
          className={`btn-voice-trigger ${moniStatus !== 'idle' ? 'active' : ''}`}
          style={{
            background: moniStatus === 'listening'
              ? 'linear-gradient(135deg, rgba(0, 240, 255, 0.25), rgba(157, 78, 221, 0.15))'
              : moniStatus === 'thinking'
                ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.25), rgba(157, 78, 221, 0.15))'
                : moniStatus === 'speaking'
                  ? 'linear-gradient(135deg, rgba(157, 78, 221, 0.25), rgba(0, 240, 255, 0.15))'
                  : moniStatus === 'error'
                    ? 'linear-gradient(135deg, rgba(255, 56, 56, 0.25), rgba(157, 78, 221, 0.15))'
                    : 'linear-gradient(135deg, rgba(212, 175, 55, 0.2), rgba(157, 78, 221, 0.2))',
            border: moniStatus === 'listening'
              ? '2px solid var(--accent-cyan)'
              : moniStatus === 'thinking'
                ? '2px solid #ffd700'
                : moniStatus === 'speaking'
                  ? '2px solid var(--accent-purple)'
                  : moniStatus === 'error'
                    ? '2px solid var(--accent-red)'
                    : '2px solid #ffd700',
            borderRadius: '30px',
            color: moniStatus === 'listening'
              ? 'var(--accent-cyan)'
              : moniStatus === 'thinking'
                ? '#ffd700'
                : moniStatus === 'speaking'
                  ? 'var(--accent-purple)'
                  : moniStatus === 'error'
                    ? 'var(--accent-red)'
                    : '#ffd700',
            padding: '14px 32px',
            fontSize: '1rem',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: moniStatus === 'listening'
              ? '0 0 20px rgba(0, 240, 255, 0.4), inset 0 0 8px rgba(0, 240, 255, 0.1)'
              : moniStatus === 'thinking'
                ? '0 0 20px rgba(255, 215, 0, 0.4), inset 0 0 8px rgba(255, 215, 0, 0.1)'
                : moniStatus === 'speaking'
                  ? '0 0 20px rgba(157, 78, 221, 0.4), inset 0 0 8px rgba(157, 78, 221, 0.1)'
                  : moniStatus === 'error'
                    ? '0 0 20px rgba(255, 56, 56, 0.4), inset 0 0 8px rgba(255, 56, 56, 0.1)'
                    : '0 0 20px rgba(255, 215, 0, 0.2), inset 0 0 8px rgba(255, 215, 0, 0.1)',
            transition: 'all 0.3s ease',
            outline: 'none',
            fontFamily: 'var(--font-sans)',
            letterSpacing: '0.5px'
          }}
        >
          <span style={{ fontSize: '1.2rem' }}>
            {moniStatus === 'listening' ? '●' : moniStatus === 'thinking' ? '⏳' : moniStatus === 'speaking' ? '🔊' : moniStatus === 'error' ? '⚠️' : '🎤'}
          </span>
          {moniStatus === 'listening' && 'Dinliyor...'}
          {moniStatus === 'thinking' && 'Düşünüyor...'}
          {moniStatus === 'speaking' && 'Konuşuyor...'}
          {moniStatus === 'error' && 'Hata Oluştu!'}
          {moniStatus === 'idle' && 'Sesli Komut Ver'}
        </button>

        {/* APK Download Button for Android Devices */}
        <a
          href="/downloads/moni.apk"
          download="moni.apk"
          style={{
            marginTop: '15px',
            padding: '10px 20px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '0.82rem',
            fontWeight: '600',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            fontFamily: 'var(--font-sans)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.color = '#fff';
            e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
            e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.1)';
          }}
        >
          <span>🤖</span> Android Uygulamasını İndir (.APK)
        </a>

        {typeof navigator !== 'undefined' && (/iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) && (
          <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)', marginTop: '-12px', marginBottom: '-5px', textAlign: 'center', maxWidth: '320px', lineHeight: '1.2' }}>
            ℹ️ iPhone güvenlik kısıtlamaları nedeniyle asistanı bu butona basarak aktifleştiriniz.
          </p>
        )}

        {/* Grid Navigation Section */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
          width: '100%',
          marginTop: '10px'
        }}>
          {/* Kişi Ara */}
          <div
            onClick={() => setCurrentView('contacts')}
            className="home-nav-card"
            style={navCardStyle}
          >
            <span style={{ fontSize: '1.6rem', color: '#ffd700' }}>📞</span>
            <span style={navCardLabelStyle}>Kişi Ara</span>
          </div>

          {/* Takvim Gör */}
          <div
            onClick={() => setCurrentView('calendar')}
            className="home-nav-card"
            style={navCardStyle}
          >
            <span style={{ fontSize: '1.6rem', color: '#ffd700' }}>📅</span>
            <span style={navCardLabelStyle}>Takvim Gör</span>
          </div>

          {/* Görevlerim / Yapılacaklar */}
          <div
            onClick={() => setCurrentView('todos')}
            className="home-nav-card"
            style={navCardStyle}
          >
            <span style={{ fontSize: '1.6rem', color: '#ffd700' }}>📋</span>
            <span style={navCardLabelStyle}>Görevlerim</span>
          </div>

          {/* Not Defteri */}
          <div
            onClick={() => setCurrentView('notes')}
            className="home-nav-card"
            style={navCardStyle}
          >
            <span style={{ fontSize: '1.6rem', color: '#ffd700' }}>📝</span>
            <span style={navCardLabelStyle}>Not Defteri</span>
          </div>
        </div>

        {/* Clock & Bottom Section */}
        <div style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
          marginTop: '10px'
        }}>
          {/* Live Date & Clock Card */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '16px',
            padding: '8px 16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            boxShadow: 'inset 0 0 10px rgba(0,0,0,0.2)',
            width: '100%',
            boxSizing: 'border-box'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1rem' }}>🕰️</span>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '1rem',
                fontWeight: '600',
                color: 'var(--accent-cyan)',
                letterSpacing: '1px'
              }}>
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
            <span style={{
              fontSize: '0.72rem',
              color: 'var(--color-secondary)',
              fontWeight: '500'
            }}>
              {currentTime.toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>

          {/* PWA Install Button */}
          {isInstallable && (
            <button
              onClick={handleInstallApp}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.1), rgba(157, 78, 221, 0.1))',
                border: '1px solid rgba(0, 240, 255, 0.3)',
                borderRadius: '16px',
                padding: '10px 14px',
                color: 'var(--accent-cyan)',
                fontSize: '0.78rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 0 12px rgba(0, 240, 255, 0.1)',
                transition: 'all 0.2s',
                marginTop: '2px',
                boxSizing: 'border-box'
              }}
              className="hover-scale"
            >
              📲 Uygulamayı Telefona Yükle
            </button>
          )}

          {/* Moni Pro Banner */}
          <div style={{
            background: 'linear-gradient(90deg, rgba(212, 175, 55, 0.15), rgba(157, 78, 221, 0.15))',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            borderRadius: '20px',
            padding: '6px 20px',
            width: '100%',
            textAlign: 'center',
            fontSize: '0.75rem',
            fontWeight: '600',
            color: '#ffd700',
            letterSpacing: '0.5px',
            boxSizing: 'border-box'
          }}>
            Moni Profesyonel Sürüm
          </div>

          {/* Version number */}
          <span style={{ fontSize: '0.65rem', color: 'var(--color-muted)', marginTop: '-6px' }}>
            MONI v1.2.0 • Mobil Paket Sürüm
          </span>
        </div>

      </div>
    );
  };

  const navCardStyle: React.CSSProperties = {
    background: 'rgba(18, 20, 29, 0.6)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    borderRadius: '16px',
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: 'var(--glass-shadow)'
  };

  const navCardLabelStyle: React.CSSProperties = {
    fontSize: '0.78rem',
    fontWeight: '600',
    color: 'var(--color-secondary)'
  };

  const renderChatView = () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setCurrentView('home')}
              style={{ background: 'transparent', border: 'none', color: 'var(--accent-cyan)', cursor: 'pointer', fontSize: '0.9rem' }}
            >
              ← Geri
            </button>
            <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600 }}>Sohbet Odası</h3>
          </div>
          <button
            onClick={handleClearHistory}
            style={{ background: 'transparent', border: 'none', color: 'var(--color-muted)', cursor: 'pointer', fontSize: '0.75rem' }}
          >
            Temizle
          </button>
        </div>

        {/* Message Area */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '4px', marginBottom: '12px' }}>
          {messages.map((msg, idx) => {
            const activeMsgId = msg.id || `idx-${idx}`;
            const isSpeakingThis = currentlySpeakingMsgId === activeMsgId;

            return (
              <div
                key={idx}
                style={{
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px'
                }}
              >
                <div
                  style={{
                    background: msg.role === 'user'
                      ? 'linear-gradient(135deg, rgba(0, 240, 255, 0.15), rgba(157, 78, 221, 0.15))'
                      : msg.role === 'system'
                        ? 'rgba(255, 255, 255, 0.02)'
                        : 'rgba(255, 255, 255, 0.05)',
                    border: msg.role === 'user'
                      ? '1px solid rgba(0, 240, 255, 0.2)'
                      : msg.role === 'system'
                        ? '1px dashed var(--border-color)'
                        : '1px solid var(--border-color)',
                    padding: '10px 14px',
                    borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                    color: msg.role === 'system' ? 'var(--color-secondary)' : 'var(--color-primary)',
                    fontSize: '0.88rem',
                    lineHeight: '1.4'
                  }}
                >
                  {msg.content}
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start'
                }}>
                  <span style={{ fontSize: '0.65rem', color: 'var(--color-muted)' }}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {msg.role === 'assistant' && msg.content.trim() && (
                    <button
                      onClick={() => handleSpeakMessage(msg.content, activeMsgId)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: isSpeakingThis ? 'var(--accent-purple)' : 'var(--accent-cyan)',
                        cursor: 'pointer',
                        fontSize: '0.7rem',
                        padding: '2px 4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2px',
                        outline: 'none',
                        fontWeight: 600
                      }}
                    >
                      {isSpeakingThis ? '🛑 Durdur' : '🔊 Oku'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={chatEndRef} />
        </div>

        {/* Input Form */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
          <button
            onClick={handleMicClick}
            className={`btn btn-secondary btn-icon ${isRecording ? 'pulse' : ''}`}
            style={{
              flexShrink: 0,
              backgroundColor: isRecording ? 'rgba(255, 56, 56, 0.15)' : '',
              borderColor: isRecording ? 'var(--accent-red)' : '',
              width: '36px', height: '36px'
            }}
          >
            <span style={{ color: isRecording ? 'var(--accent-red)' : 'var(--accent-cyan)', fontSize: '1.1rem' }}>
              {isRecording ? '●' : '🎤'}
            </span>
          </button>

          <input
            type="text"
            className="input-text"
            style={{ flex: 1, padding: '8px 12px', fontSize: '0.85rem' }}
            placeholder={isRecording ? 'Moni dinliyor...' : 'Komut yazın...'}
            value={inputMessage}
            disabled={isRecording}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSendMessage(inputMessage);
              }
            }}
          />

          <button
            onClick={() => handleSendMessage(inputMessage)}
            className="btn btn-primary"
            style={{ padding: '8px 14px', fontSize: '0.8rem' }}
            disabled={isRecording || !inputMessage.trim()}
          >
            ➔
          </button>
        </div>
      </div>
    );
  };

  const renderContactsView = () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
          <button
            onClick={() => setCurrentView('home')}
            style={{ background: 'transparent', border: 'none', color: 'var(--accent-cyan)', cursor: 'pointer', fontSize: '0.9rem' }}
          >
            ← Geri
          </button>
          <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600 }}>👤 Rehberim</h3>
        </div>

        {/* Contacts List */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
          {contacts.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--color-muted)', fontSize: '0.8rem', padding: '20px' }}>Rehberiniz boş.</div>
          ) : (
            contacts.map(contact => (
              <div
                key={contact.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 12px',
                  background: 'rgba(255,255,255,0.02)',
                  borderRadius: '10px',
                  border: '1px solid var(--border-color)'
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{contact.name}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--color-muted)' }}>{contact.phoneNumber}</div>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    onClick={() => {
                      addBridgeLog(`Hızlı Köprü: Arama tetiklendi -> ${contact.name}`);
                      bridgeService.makePhoneCall(contact.phoneNumber);
                    }}
                    style={{ background: 'rgba(0, 240, 255, 0.1)', border: 'none', color: 'var(--accent-cyan)', cursor: 'pointer', padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem' }}
                  >
                    Ara
                  </button>
                  <button
                    onClick={() => handleDeleteContact(contact.id)}
                    style={{ background: 'rgba(255, 56, 56, 0.1)', border: 'none', color: 'var(--accent-red)', cursor: 'pointer', padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem' }}
                  >
                    Sil
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Quick Add Form */}
        <form onSubmit={handleAddContact} style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
          <input
            type="text"
            placeholder="Kişi Adı Soyadı"
            className="input-text"
            style={{ padding: '8px 12px', fontSize: '0.8rem' }}
            value={newContactName}
            onChange={(e) => setNewContactName(e.target.value)}
          />
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="Telefon Numarası"
              className="input-text"
              style={{ padding: '8px 12px', fontSize: '0.8rem', flex: 1 }}
              value={newContactPhone}
              onChange={(e) => setNewContactPhone(e.target.value)}
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '8px 12px', fontSize: '0.8rem' }}>Ekle</button>
          </div>
        </form>
      </div>
    );
  };

  const renderAgendaView = () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
          <button
            onClick={() => setCurrentView('home')}
            style={{ background: 'transparent', border: 'none', color: 'var(--accent-cyan)', cursor: 'pointer', fontSize: '0.9rem' }}
          >
            ← Geri
          </button>
          <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600 }}>⏰ Ajanda & Hatırlatıcılar</h3>
        </div>

        {/* Reminders List */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
          {reminders.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--color-muted)', fontSize: '0.8rem', padding: '20px' }}>Planlı hatırlatıcınız yok.</div>
          ) : (
            reminders.map(reminder => (
              <div
                key={reminder.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 12px',
                  background: 'rgba(255,255,255,0.02)',
                  borderRadius: '10px',
                  border: '1px solid var(--border-color)'
                }}
              >
                <div style={{ flex: 1, paddingRight: '8px' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.82rem' }}>{reminder.title}</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--accent-purple)' }}>
                    {new Date(reminder.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteReminder(reminder.id)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--color-muted)', cursor: 'pointer', fontSize: '0.75rem' }}
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>

        {/* Quick Add Form */}
        <form onSubmit={handleAddReminder} style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
          <input
            type="text"
            placeholder="Hatırlatıcı başlığı..."
            className="input-text"
            style={{ padding: '8px 12px', fontSize: '0.8rem', flex: 1 }}
            value={newReminderTitle}
            onChange={(e) => setNewReminderTitle(e.target.value)}
          />
          <button type="submit" className="btn btn-primary" style={{ padding: '8px 12px', fontSize: '0.8rem' }}>Ekle</button>
        </form>
      </div>
    );
  };

  const renderModulatorView = () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
          <button
            onClick={() => setCurrentView('home')}
            style={{ background: 'transparent', border: 'none', color: 'var(--accent-cyan)', cursor: 'pointer', fontSize: '0.9rem' }}
          >
            ← Geri
          </button>
          <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600 }}>🎙️ Ses Efekt Modülatörü</h3>
        </div>

        <p style={{ fontSize: '0.72rem', color: 'var(--color-secondary)', margin: 0 }}>
          İnternetten indirilen 'Merhaba' ses dosyasını gerçek zamanlı Web Audio API ile modüle edin.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 500 }}>Aktivasyon Sesi Yap</span>
          <button
            className={`btn ${customVoiceEnabled ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '4px 10px', fontSize: '0.7rem' }}
            onClick={() => {
              const val = !customVoiceEnabled;
              setCustomVoiceEnabled(val);
              localStorage.setItem('moni_custom_voice_enabled', String(val));
              addBridgeLog(`Özel ses aktivasyonu ${val ? 'etkinleştirildi' : 'devre dışı bırakıldı'}.`);
            }}
          >
            {customVoiceEnabled ? 'Aktif' : 'Pasif'}
          </button>
        </div>

        {/* Pitch Slider */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem' }}>
            <span style={{ color: 'var(--color-secondary)' }}>Pitch / Hız:</span>
            <span style={{ fontWeight: 'bold', color: 'var(--accent-cyan)' }}>{customVoicePitch.toFixed(2)}x</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="2.0"
            step="0.05"
            value={customVoicePitch}
            onChange={(e) => setCustomVoicePitch(parseFloat(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--accent-cyan)' }}
          />
        </div>

        {/* Detune Slider */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem' }}>
            <span style={{ color: 'var(--color-secondary)' }}>Detune (İnce Akort):</span>
            <span style={{ fontWeight: 'bold', color: 'var(--accent-purple)' }}>{customVoiceDetune} cent</span>
          </div>
          <input
            type="range"
            min="-1200"
            max="1200"
            step="50"
            value={customVoiceDetune}
            onChange={(e) => setCustomVoiceDetune(parseInt(e.target.value, 10))}
            style={{ width: '100%', accentColor: 'var(--accent-purple)' }}
          />
        </div>

        {/* Effect Selector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--color-secondary)' }}>Ses Efekti:</span>
          <select
            value={customVoiceEffect}
            onChange={(e) => setCustomVoiceEffect(e.target.value)}
            style={{
              background: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid var(--border-color)',
              color: 'var(--color-primary)',
              padding: '6px 10px',
              borderRadius: '8px',
              fontSize: '0.78rem',
              outline: 'none',
              cursor: 'pointer',
              width: '100%'
            }}
          >
            <option value="none">✨ Normal (Efektsiz)</option>
            <option value="robot">🤖 Robotik Metalik Efekt</option>
            <option value="telephone">📞 Telsiz / Telefon Efekti</option>
            <option value="echo">🌌 Yankı (Eko) Efekti</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
          <button
            className="btn btn-secondary"
            style={{ flex: 1, padding: '6px 0', fontSize: '0.75rem' }}
            onClick={() => playCustomVoice()}
          >
            ▶️ Test Et
          </button>
          <button
            className="btn btn-primary"
            style={{ flex: 1, padding: '6px 0', fontSize: '0.75rem' }}
            onClick={() => {
              localStorage.setItem('moni_custom_voice_pitch', String(customVoicePitch));
              localStorage.setItem('moni_custom_voice_detune', String(customVoiceDetune));
              localStorage.setItem('moni_custom_voice_effect', customVoiceEffect);
              localStorage.setItem('moni_custom_voice_enabled', 'true');
              setCustomVoiceEnabled(true);
              addBridgeLog(`Ses ayarları uygulandı: Pitch=${customVoicePitch}, Detune=${customVoiceDetune}, Efekt=${customVoiceEffect}`);
              speakText("Yeni ses ayarları uygulandı ve Moni uyanışına atandı.");
            }}
          >
            💾 Uygula
          </button>
        </div>
      </div>
    );
  };

  const renderSettingsView = () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%', height: '100%', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
          <button
            onClick={() => setCurrentView('home')}
            style={{ background: 'transparent', border: 'none', color: 'var(--accent-cyan)', cursor: 'pointer', fontSize: '0.9rem' }}
          >
            ← Geri
          </button>
          <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600 }}>⚙️ Sistem Ayarları</h3>
        </div>

        {/* Connectivity Mode */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>Ağ Bağlantı Modu</div>
            <div style={{ fontSize: '0.68rem', color: 'var(--color-secondary)' }}>
              {isOffline ? 'Offline / Local LLM' : 'Online / Cloud LLM'}
            </div>
          </div>
          <button
            className="btn btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.72rem' }}
            onClick={() => {
              setIsOffline(!isOffline);
              addBridgeLog(`Bağlantı modu değiştirildi: ${!isOffline ? 'Offline' : 'Online'}`);
            }}
          >
            Değiştir
          </button>
        </div>

        {/* Dashboard 2 / Klasik Ana Ekran Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>Executive Dashboard Arayüzü</div>
            <div style={{ fontSize: '0.68rem', color: 'var(--color-secondary)' }}>
              {isDashboard2Enabled ? 'Aktif (Gelişmiş Kontrol Paneli)' : 'Pasif (Klasik Arayüz)'}
            </div>
          </div>
          <button
            className={`btn ${isDashboard2Enabled ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '6px 12px', fontSize: '0.72rem' }}
            onClick={() => {
              const val = !isDashboard2Enabled;
              setIsDashboard2Enabled(val);
              localStorage.setItem('moni_is_dashboard2_enabled', String(val));
              addBridgeLog(`Executive Dashboard 2 ${val ? 'etkinleştirildi' : 'devre dışı bırakıldı'}.`);
            }}
          >
            {isDashboard2Enabled ? 'Açık' : 'Kapalı'}
          </button>
        </div>

        {/* Gemini API Key Configuration */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          border: !geminiApiKey ? '2px dashed var(--accent-cyan)' : '1px solid rgba(255,255,255,0.03)',
          borderRadius: '12px',
          padding: '12px',
          background: !geminiApiKey ? 'rgba(0, 240, 255, 0.03)' : 'transparent',
          boxShadow: !geminiApiKey ? '0 0 15px rgba(0, 240, 255, 0.1)' : 'none',
          marginBottom: '10px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: !geminiApiKey ? 'var(--accent-cyan)' : 'var(--color-primary)' }}>
              ✨ Gemini API Anahtarı {!geminiApiKey && '(Gerekli ⚠️)'}
            </span>
            <a
              href="https://aistudio.google.com/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', textDecoration: 'underline', fontWeight: 700 }}
            >
              Ücretsiz Anahtar Al (Google AI Studio) ↗
            </a>
          </div>
          <input
            type="password"
            placeholder="AI Studio API Anahtarınızı buraya yapıştırın..."
            value={geminiApiKey}
            onChange={(e) => {
              const val = e.target.value;
              setGeminiApiKey(val);
              localStorage.setItem('gemini_api_key', val);
              addBridgeLog('Gemini API anahtarı güncellendi.');
            }}
            style={{
              background: 'rgba(0, 0, 0, 0.5)',
              border: !geminiApiKey ? '2px solid var(--accent-cyan)' : '1px solid var(--border-color)',
              color: 'var(--color-primary)',
              padding: '10px 12px',
              borderRadius: '8px',
              fontSize: '0.82rem',
              outline: 'none',
              width: '100%',
              boxSizing: 'border-box',
              boxShadow: !geminiApiKey ? '0 0 10px rgba(0, 240, 255, 0.2)' : 'none'
            }}
          />
          <div style={{ fontSize: '0.66rem', color: !geminiApiKey ? 'var(--accent-cyan)' : 'var(--color-secondary)' }}>
            {!geminiApiKey
              ? 'Moni\'nin canlı konuşması ve her soruya cevap vermesi için buraya API anahtarı girmelisiniz.'
              : 'Canlı yapay zeka aktif! API anahtarınız yerel olarak saklanmaktadır.'}
          </div>
        </div>

        {/* Avatar and Appearance Configuration */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '12px', marginBottom: '10px' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-primary)' }}>👤 Asistan Görünümü</span>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--color-secondary)' }}>Asistan Göz Rengi:</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[
                { name: 'blue', color: '#00f0ff', label: 'Mavi' },
                { name: 'black', color: '#12141c', label: 'Siyah', border: '1px solid rgba(255,255,255,0.4)' },
                { name: 'purple', color: '#9d4edd', label: 'Mor' },
                { name: 'green', color: '#39ff14', label: 'Yeşil (Doğal)' },
                { name: 'gold', color: '#ffd700', label: 'Altın' },
                { name: 'green-glowing', color: '#00ff88', label: 'Yeşil (Işıltılı)' }
              ].map((colorItem) => (
                <button
                  key={colorItem.name}
                  onClick={() => {
                    setEyeColor(colorItem.name);
                    localStorage.setItem('moni_eye_color', colorItem.name);
                    addBridgeLog(`Göz rengi ayarlandı: ${colorItem.label}`);
                  }}
                  style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    backgroundColor: colorItem.color,
                    border: eyeColor === colorItem.name ? '2px solid #fff' : colorItem.border || '1px solid rgba(255,255,255,0.1)',
                    boxShadow: eyeColor === colorItem.name ? `0 0 10px ${colorItem.color}` : 'none',
                    cursor: 'pointer',
                    padding: 0,
                    transition: 'all 0.2s',
                    transform: eyeColor === colorItem.name ? 'scale(1.2)' : 'scale(1)',
                    outline: 'none'
                  }}
                  title={colorItem.label}
                />
              ))}
            </div>
          </div>

          {/* Avatar Tipi Seçimi */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--color-secondary)' }}>Avatar Tipi:</span>
            <select
              value={avatarType}
              onChange={(e) => {
                const val = e.target.value as 'image' | 'svg';
                setAvatarType(val);
                localStorage.setItem('moni_avatar_type', val);
                addBridgeLog(`Avatar tipi değiştirildi: ${val === 'image' ? 'Görsel Kadın' : 'Canlı Robot'}`);
              }}
              style={{
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid var(--border-color)',
                color: 'var(--color-primary)',
                padding: '6px 10px',
                borderRadius: '8px',
                fontSize: '0.76rem',
                outline: 'none',
                cursor: 'pointer',
                width: '100%'
              }}
            >
              <option value="image">👩 Görsel (Varsayılan Kadın)</option>
              <option value="svg">🤖 Canlı SVG Robot</option>
            </select>
          </div>

          {/* Avatar Animasyonları Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', borderTop: '1px solid rgba(255,255,255,0.02)' }}>
            <div>
              <div style={{ fontSize: '0.76rem', fontWeight: 600 }}>Avatar Animasyonları</div>
              <div style={{ fontSize: '0.64rem', color: 'var(--color-secondary)' }}>Nefes alma, yüzerlik ve göz hareketleri</div>
            </div>
            <button
              className={`btn ${avatarAnimationsEnabled ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '4px 10px', fontSize: '0.68rem', borderRadius: '8px' }}
              onClick={() => {
                const val = !avatarAnimationsEnabled;
                setAvatarAnimationsEnabled(val);
                localStorage.setItem('moni_avatar_animations_enabled', String(val));
                addBridgeLog(`Avatar animasyonları ${val ? 'açıldı' : 'kapatıldı'}.`);
              }}
            >
              {avatarAnimationsEnabled ? 'Açık' : 'Kapalı'}
            </button>
          </div>

          {/* Ağız Animasyonu Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', borderTop: '1px solid rgba(255,255,255,0.02)' }}>
            <div>
              <div style={{ fontSize: '0.76rem', fontWeight: 600 }}>Konuşurken Ağız / Ses Dalgası</div>
              <div style={{ fontSize: '0.64rem', color: 'var(--color-secondary)' }}>Konuşma sırasında ağız hareketi efekti</div>
            </div>
            <button
              className={`btn ${avatarMouthAnimationEnabled ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '4px 10px', fontSize: '0.68rem', borderRadius: '8px' }}
              onClick={() => {
                const val = !avatarMouthAnimationEnabled;
                setAvatarMouthAnimationEnabled(val);
                localStorage.setItem('moni_avatar_mouth_animation_enabled', String(val));
                addBridgeLog(`Ağız animasyonu ${val ? 'açıldı' : 'kapatıldı'}.`);
              }}
            >
              {avatarMouthAnimationEnabled ? 'Açık' : 'Kapalı'}
            </button>
          </div>

          {/* Görsel Efekt Yoğunluğu Seçici */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', borderTop: '1px solid rgba(255,255,255,0.02)', paddingTop: '6px' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--color-secondary)' }}>Görsel Efekt Yoğunluğu:</span>
            <div style={{ display: 'flex', gap: '4px' }}>
              {(['low', 'medium', 'high'] as const).map((intensity) => {
                const labels = { low: 'Düşük', medium: 'Orta', high: 'Yüksek' };
                return (
                  <button
                    key={intensity}
                    onClick={() => {
                      setAvatarEffectsIntensity(intensity);
                      localStorage.setItem('moni_avatar_effects_intensity', intensity);
                      addBridgeLog(`Efekt yoğunluğu ayarlandı: ${labels[intensity]}`);
                    }}
                    style={{
                      flex: 1,
                      padding: '6px 0',
                      borderRadius: '8px',
                      background: avatarEffectsIntensity === intensity
                        ? 'linear-gradient(135deg, rgba(0, 240, 255, 0.15), rgba(157, 78, 221, 0.15))'
                        : 'rgba(255,255,255,0.02)',
                      border: avatarEffectsIntensity === intensity ? '1px solid var(--accent-cyan)' : '1px solid transparent',
                      color: avatarEffectsIntensity === intensity ? 'var(--accent-cyan)' : 'var(--color-secondary)',
                      fontSize: '0.7rem',
                      fontWeight: avatarEffectsIntensity === intensity ? '600' : '400',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {labels[intensity]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Default Speech Voice Profiles */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>🎙️ Asistan Genel Sesi:</span>
          <select
            value={selectedVoice}
            onChange={(e) => {
              const voiceVal = e.target.value;
              setSelectedVoice(voiceVal);
              localStorage.setItem('moni_voice_type', voiceVal);
              addBridgeLog(`Ses tercihi değiştirildi: ${voiceVal}`);
              setTimeout(() => {
                speakText("Ses değiştirildi.", undefined, voiceVal);
              }, 100);
            }}
            style={{
              background: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid var(--border-color)',
              color: 'var(--color-primary)',
              padding: '8px 10px',
              borderRadius: '8px',
              fontSize: '0.78rem',
              outline: 'none',
              cursor: 'pointer',
              width: '100%'
            }}
          >
            <option value="selin">👩 Selin (Kadın - Kurumsal)</option>
            <option value="derin">👩 Derin (Kadın - Doğal)</option>
            <option value="google-assistant">🤖 Google Asistan (Kadın - Net)</option>
            <option value="gemini-vega">✨ Gemini Vega (Kadın - Parlak)</option>
            <option value="gemini-ursa">🪐 Gemini Ursa (Kadın - Sıcak)</option>
          </select>
        </div>

        {/* Sistem Türkçe Sesi */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>🗣️ Sistem Türkçe Sesi (Tarayıcı Fallback):</span>
            {/* Auto-select female voice button */}
            <button
              onClick={() => {
                const isMaleVoice = (name: string) =>
                  /tolga|cem|hakan|sabri|huseyin|male|erkek|man|boy/i.test(name.toLowerCase());
                const bestFemale = trVoicesList.find(v => {
                  const name = v.name.toLowerCase();
                  const lang = v.lang.toLowerCase().replace('_', '-');
                  const isTr = lang.startsWith('tr') || lang.includes('tr');
                  const hasFemale = /dilara|yelda|emel|seda|filiz|sibel|hazel|ayse|zeynep|yasemin|ipek|suna|female|bayan|woman|girl|siri|her|google/i.test(name);
                  return isTr && hasFemale && !isMaleVoice(name);
                }) || trVoicesList.find(v => {
                  const lang = v.lang.toLowerCase().replace('_', '-');
                  const isTr = lang.startsWith('tr') || lang.includes('tr');
                  return isTr && !isMaleVoice(v.name);
                });
                if (bestFemale) {
                  setSelectedSystemVoiceName(bestFemale.name);
                  localStorage.setItem('moni_speech_voice_name', bestFemale.name);
                  addBridgeLog(`Otomatik kadın ses seçildi: ${bestFemale.name}`);
                  setTimeout(() => speakText('Kadın ses otomatik seçildi.', undefined), 100);
                } else {
                  showAudioNotification('Bu cihazda Türkçe kadın sesi bulunamadı. Türkçe erkek ses veya varsayılan ses kullanılacak.');
                }
              }}
              style={{
                background: 'linear-gradient(135deg, rgba(157, 78, 221, 0.15), rgba(0, 240, 255, 0.1))',
                border: '1px solid rgba(157, 78, 221, 0.4)',
                borderRadius: '12px',
                color: 'var(--accent-purple)',
                fontSize: '0.66rem',
                fontWeight: '700',
                padding: '4px 10px',
                cursor: 'pointer',
                outline: 'none',
                fontFamily: 'var(--font-sans)',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s'
              }}
            >
              👩 Kadın Sesi Otomatik Seç
            </button>
          </div>

          {/* Active voice label */}
          {selectedSystemVoiceName && (
            <div style={{
              fontSize: '0.66rem',
              color: 'var(--accent-cyan)',
              background: 'rgba(0, 240, 255, 0.06)',
              border: '1px solid rgba(0, 240, 255, 0.15)',
              borderRadius: '8px',
              padding: '4px 10px',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}>
              🔊 Aktif ses: <strong>{selectedSystemVoiceName}</strong>
            </div>
          )}

          <select
            value={selectedSystemVoiceName}
            onChange={(e) => {
              const voiceName = e.target.value;
              setSelectedSystemVoiceName(voiceName);
              localStorage.setItem('moni_speech_voice_name', voiceName);
              addBridgeLog(`Sistem Türkçe ses tercihi güncellendi: ${voiceName || 'Varsayılan'}`);
              if (voiceName) {
                setTimeout(() => {
                  speakText('Yeni sistem Türkçe sesi seçildi.', undefined);
                }, 100);
              }
            }}
            style={{
              background: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid var(--border-color)',
              color: 'var(--color-primary)',
              padding: '8px 10px',
              borderRadius: '8px',
              fontSize: '0.78rem',
              outline: 'none',
              cursor: 'pointer',
              width: '100%'
            }}
          >
            <option value="">-- Profil Varsayılan Sesi --</option>
            {(() => {
              const isMaleVoice = (name: string) =>
                /tolga|cem|hakan|sabri|huseyin|male|erkek|man|boy/i.test(name.toLowerCase());
              const femaleTr = trVoicesList.filter(v => {
                const lang = v.lang.toLowerCase().replace('_', '-');
                const isTr = lang.startsWith('tr') || lang.includes('tr');
                const name = v.name.toLowerCase();
                const hasFemale = /dilara|yelda|emel|seda|filiz|sibel|hazel|ayse|zeynep|yasemin|ipek|suna|female|bayan|woman|girl|siri|her|google/i.test(name);
                return isTr && (hasFemale || name.includes('google')) && !isMaleVoice(v.name);
              });
              const otherTr = trVoicesList.filter(v => {
                const lang = v.lang.toLowerCase().replace('_', '-');
                const isTr = lang.startsWith('tr') || lang.includes('tr');
                return isTr && !femaleTr.includes(v);
              });
              const maleTr = otherTr.filter(v => isMaleVoice(v.name));
              const neutralTr = otherTr.filter(v => !isMaleVoice(v.name));
              const others = trVoicesList.filter(v => {
                const lang = v.lang.toLowerCase().replace('_', '-');
                return !lang.startsWith('tr') && !lang.includes('tr');
              });
              return (
                <>
                  {femaleTr.length > 0 && (
                    <optgroup label="👩 Türkçe Kadın Sesleri (Önerilen)">
                      {femaleTr.map(v => <option key={v.name} value={v.name}>{v.name} ({v.lang})</option>)}
                    </optgroup>
                  )}
                  {neutralTr.length > 0 && (
                    <optgroup label="🗣️ Türkçe Sesler">
                      {neutralTr.map(v => <option key={v.name} value={v.name}>{v.name} ({v.lang})</option>)}
                    </optgroup>
                  )}
                  {maleTr.length > 0 && (
                    <optgroup label="👨 Türkçe Erkek Sesler">
                      {maleTr.map(v => <option key={v.name} value={v.name}>{v.name} ({v.lang})</option>)}
                    </optgroup>
                  )}
                  {others.length > 0 && (
                    <optgroup label="🌐 Diğer Sistem Sesleri">
                      {others.map(v => <option key={v.name} value={v.name}>{v.name} ({v.lang})</option>)}
                    </optgroup>
                  )}
                </>
              );
            })()}
          </select>
          {trVoicesList.length === 0 ? (
            <span style={{ fontSize: '0.68rem', color: 'var(--accent-red)' }}>
              ⚠️ Bu cihazda sesli okuma motoru bulunamadı, metin modu aktif.
            </span>
          ) : (
            !trVoicesList.some(v => v.lang.toLowerCase().replace('_', '-').startsWith('tr') || v.lang.toLowerCase().includes('tr')) && (
              <span style={{ fontSize: '0.68rem', color: '#ffd700' }}>
                ℹ️ Bu cihazda Türkçe kadın sesi bulunamadı. Türkçe erkek ses veya varsayılan ses kullanılacak.
              </span>
            )
          )}
        </div>


        {/* Otomatik Seslendirme Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>Otomatik Seslendirme</div>
            <div style={{ fontSize: '0.68rem', color: 'var(--color-secondary)' }}>
              Cevapları otomatik sesli oku
            </div>
          </div>
          <button
            className={`btn ${autoSpeakEnabled ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '6px 12px', fontSize: '0.72rem' }}
            onClick={() => {
              const val = !autoSpeakEnabled;
              setAutoSpeakEnabled(val);
              localStorage.setItem('moni_auto_speak_enabled', String(val));
              addBridgeLog(`Otomatik seslendirme ${val ? 'açıldı' : 'kapatıldı'}.`);
            }}
          >
            {autoSpeakEnabled ? 'Açık' : 'Kapalı'}
          </button>
        </div>

        {/* Otomatik Gönderme Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>Sesli Komutu Otomatik Gönder</div>
            <div style={{ fontSize: '0.68rem', color: 'var(--color-secondary)' }}>
              Konuşmanız bitince doğrudan gönder
            </div>
          </div>
          <button
            className={`btn ${autoSubmitEnabled ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '6px 12px', fontSize: '0.72rem' }}
            onClick={() => {
              const val = !autoSubmitEnabled;
              setAutoSubmitEnabled(val);
              localStorage.setItem('moni_auto_submit_enabled', String(val));
              addBridgeLog(`Sesli otomatik gönderme ${val ? 'açıldı' : 'kapatıldı'}.`);
            }}
          >
            {autoSubmitEnabled ? 'Açık' : 'Kapalı'}
          </button>
        </div>

        {/* Konuşma Hızı Slider */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem' }}>
            <span style={{ color: 'var(--color-secondary)' }}>Konuşma Hızı:</span>
            <span style={{ fontWeight: 'bold', color: 'var(--accent-cyan)' }}>{speechRate.toFixed(1)}x</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="2.0"
            step="0.1"
            value={speechRate}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              setSpeechRate(val);
              localStorage.setItem('moni_speech_rate', String(val));
            }}
            style={{ width: '100%', accentColor: 'var(--accent-cyan)' }}
          />
        </div>

        {/* Ses Seviyesi Slider */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem' }}>
            <span style={{ color: 'var(--color-secondary)' }}>Ses Seviyesi:</span>
            <span style={{ fontWeight: 'bold', color: 'var(--accent-purple)' }}>{Math.round(speechVolume * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.0"
            max="1.0"
            step="0.05"
            value={speechVolume}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              setSpeechVolume(val);
              localStorage.setItem('moni_speech_volume', String(val));
            }}
            style={{ width: '100%', accentColor: 'var(--accent-purple)' }}
          />
        </div>

        {/* Wake word toggle */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>Uyanma Kelimesi ('Moni')</div>
            <div style={{ fontSize: '0.68rem', color: 'var(--color-secondary)' }}>
              Asistanın sesinizle uyanma tetikleyicisi
            </div>
          </div>
          <button
            className={`btn ${isWakeWordListening ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '6px 12px', fontSize: '0.72rem' }}
            onClick={() => {
              const nextVal = !isWakeWordListening;
              setIsWakeWordListening(nextVal);
              if (nextVal) {
                setTimeout(() => startWakeWordRecognition(), 100);
              } else {
                if (wakeRecognitionRef.current) {
                  try { wakeRecognitionRef.current.stop(); } catch (e) { }
                }
                addBridgeLog('Moni dinleme modu kapatıldı.');
              }
            }}
          >
            {isWakeWordListening ? 'Açık' : 'Kapalı'}
          </button>
        </div>

        {/* Native Bridge Logs */}
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: '120px', overflow: 'hidden' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 600, marginBottom: '6px' }}>■ Native Bridge Köprü Logları</span>
          <div style={{ flex: 1, overflowY: 'auto', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '10px', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {bridgeLogs.length === 0 ? (
              <span style={{ color: 'var(--color-muted)' }}>Henüz hiçbir köprü tetiklenmedi.</span>
            ) : (
              bridgeLogs.map((log, idx) => (
                <div key={idx} style={{
                  color: log.includes('Köprü tetiklendi') ? 'var(--accent-cyan)' : log.includes('Veritabanı') ? 'var(--accent-purple)' : 'var(--color-secondary)',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden'
                }}>
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderCalendarView = () => {
    const startMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1);
    const endMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0);
    const daysCount = endMonth.getDate();

    // Turkish day index shift (Monday is index 0)
    let startDayIdx = startMonth.getDay();
    startDayIdx = startDayIdx === 0 ? 6 : startDayIdx - 1;

    const calendarCells: (Date | null)[] = [];
    for (let i = 0; i < startDayIdx; i++) {
      calendarCells.push(null);
    }
    for (let i = 1; i <= daysCount; i++) {
      calendarCells.push(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), i));
    }

    // Filter appointments for the selected day
    const dayReminders = reminders.filter(r => {
      const d = new Date(r.dateTime);
      return (
        d.getDate() === selectedDate.getDate() &&
        d.getMonth() === selectedDate.getMonth() &&
        d.getFullYear() === selectedDate.getFullYear()
      );
    }).sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());

    const trMonths = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
          <button
            onClick={() => setCurrentView('home')}
            style={{ background: 'transparent', border: 'none', color: 'var(--accent-cyan)', cursor: 'pointer', fontSize: '0.9rem' }}
          >
            ← Geri
          </button>
          <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600 }}>📅 Takvim & Randevu Defteri</h3>
        </div>

        {/* Month Selector */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '8px 12px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <button
            onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))}
            style={{ background: 'transparent', border: 'none', color: 'var(--accent-cyan)', cursor: 'pointer', fontSize: '1rem', padding: '4px 8px' }}
          >
            ◀
          </button>
          <span style={{ fontWeight: '700', fontSize: '0.9rem', color: '#fff' }}>
            {trMonths[calendarMonth.getMonth()]} {calendarMonth.getFullYear()}
          </span>
          <button
            onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))}
            style={{ background: 'transparent', border: 'none', color: 'var(--accent-cyan)', cursor: 'pointer', fontSize: '1rem', padding: '4px 8px' }}
          >
            ▶
          </button>
        </div>

        {/* Week Days Header */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center' }}>
          {['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz'].map((d, i) => (
            <span key={i} style={{ fontSize: '0.7rem', color: 'var(--color-muted)', fontWeight: 'bold' }}>{d}</span>
          ))}
        </div>

        {/* Calendar Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
          {calendarCells.map((cell, idx) => {
            if (!cell) {
              return <div key={`empty-${idx}`} style={{ height: '36px' }} />;
            }

            const isToday = cell.getDate() === new Date().getDate() && cell.getMonth() === new Date().getMonth() && cell.getFullYear() === new Date().getFullYear();
            const isSelected = cell.getDate() === selectedDate.getDate() && cell.getMonth() === selectedDate.getMonth() && cell.getFullYear() === selectedDate.getFullYear();

            // Has appointments check
            const hasEvents = reminders.some(r => {
              const d = new Date(r.dateTime);
              return d.getDate() === cell.getDate() && d.getMonth() === cell.getMonth() && d.getFullYear() === cell.getFullYear();
            });

            return (
              <div
                key={idx}
                onClick={() => setSelectedDate(cell)}
                style={{
                  height: '36px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                  fontWeight: isToday ? '700' : '400',
                  color: isSelected ? '#07080d' : isToday ? 'var(--accent-cyan)' : 'var(--color-primary)',
                  background: isSelected
                    ? 'linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))'
                    : isToday
                      ? 'rgba(0, 240, 255, 0.08)'
                      : 'rgba(255,255,255,0.01)',
                  border: isSelected
                    ? 'none'
                    : isToday
                      ? '1px solid rgba(0, 240, 255, 0.3)'
                      : '1px solid rgba(255,255,255,0.03)',
                  boxShadow: isSelected ? '0 0 10px rgba(0, 240, 255, 0.3)' : 'none',
                  position: 'relative'
                }}
              >
                <span>{cell.getDate()}</span>
                {hasEvents && !isSelected && (
                  <span style={{
                    position: 'absolute',
                    bottom: '3px',
                    width: '4px',
                    height: '4px',
                    borderRadius: '50%',
                    background: 'var(--accent-purple)',
                    boxShadow: '0 0 4px var(--accent-purple)'
                  }} />
                )}
              </div>
            );
          })}
        </div>

        {/* Selected Day Agenda Book */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '14px', marginTop: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-cyan)' }}>
              📖 {selectedDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })} Randevuları
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--color-muted)' }}>{dayReminders.length} etkinlik</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '130px', overflowY: 'auto' }}>
            {dayReminders.length === 0 ? (
              <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)', padding: '10px 0' }}>Planlanmış randevu bulunmamaktadır.</span>
            ) : (
              dayReminders.map(rem => (
                <div key={rem.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '8px 12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-purple)' }}>
                      {new Date(rem.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: '#fff', textDecoration: rem.isCompleted ? 'line-through' : 'none', opacity: rem.isCompleted ? 0.5 : 1 }}>
                      {rem.title}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteReminder(rem.id)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--accent-red)', cursor: 'pointer', fontSize: '0.72rem' }}
                  >
                    Sil
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Quick Add Form */}
          <form onSubmit={handleAddCalendarAppointment} style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
            <input
              type="time"
              value={newReminderTime}
              onChange={(e) => setNewReminderTime(e.target.value)}
              style={{
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid var(--border-color)',
                color: '#fff',
                padding: '6px 8px',
                borderRadius: '8px',
                fontSize: '0.78rem',
                outline: 'none',
                width: '70px',
                cursor: 'pointer'
              }}
            />
            <input
              type="text"
              placeholder="Yeni randevu (ör: Misafir gelecek)..."
              value={newReminderTitle}
              onChange={(e) => setNewReminderTitle(e.target.value)}
              className="input-text"
              style={{ flex: 1, padding: '6px 10px', fontSize: '0.78rem' }}
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>Ekle</button>
          </form>
        </div>
      </div>
    );
  };

  const renderTodosView = () => {
    const filteredTodos = todos.filter(t => {
      if (todoFilter === 'pending') return !t.isCompleted;
      if (todoFilter === 'completed') return t.isCompleted;
      return true;
    });

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
          <button
            onClick={() => setCurrentView('home')}
            style={{ background: 'transparent', border: 'none', color: 'var(--accent-cyan)', cursor: 'pointer', fontSize: '0.9rem' }}
          >
            ← Geri
          </button>
          <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600 }}>📋 Yapılacaklar Listesi</h3>
        </div>

        {/* Quick Add Form */}
        <form onSubmit={handleAddTodo} style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', padding: '10px', borderRadius: '12px' }}>
          <input
            type="text"
            placeholder="Yapılacak bir görev yazın..."
            value={newTodoTask}
            onChange={(e) => setNewTodoTask(e.target.value)}
            className="input-text"
            style={{ padding: '8px 12px', fontSize: '0.8rem' }}
          />
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--color-secondary)' }}>Öncelik:</span>
              <select
                value={newTodoPriority}
                onChange={(e) => setNewTodoPriority(e.target.value as any)}
                style={{
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--color-primary)',
                  padding: '4px 6px',
                  borderRadius: '6px',
                  fontSize: '0.72rem',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="low">🟢 Düşük</option>
                <option value="medium">🟡 Orta</option>
                <option value="high">🔴 Yüksek</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '0.75rem' }}>Görev Ekle</button>
          </div>
        </form>

        {/* Filter Tab bar */}
        <div style={{ display: 'flex', gap: '4px', background: 'rgba(0,0,0,0.2)', padding: '3px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
          {[
            { id: 'all', label: 'Tümü' },
            { id: 'pending', label: 'Yapılacaklar' },
            { id: 'completed', label: 'Tamamlananlar' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setTodoFilter(tab.id as any)}
              style={{
                flex: 1,
                padding: '6px 0',
                border: 'none',
                borderRadius: '8px',
                background: todoFilter === tab.id ? 'rgba(255,255,255,0.06)' : 'transparent',
                color: todoFilter === tab.id ? 'var(--accent-cyan)' : 'var(--color-secondary)',
                fontWeight: todoFilter === tab.id ? '600' : '400',
                fontSize: '0.72rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Todos List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '240px', overflowY: 'auto' }}>
          {filteredTodos.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--color-muted)', fontSize: '0.78rem', padding: '30px 0' }}>Görev bulunmamaktadır.</div>
          ) : (
            filteredTodos.map(todo => {
              const pColor = todo.priority === 'high' ? 'rgba(255, 56, 56, 0.4)' : todo.priority === 'medium' ? 'rgba(255, 215, 0, 0.4)' : 'rgba(46, 196, 182, 0.4)';
              const pLabel = todo.priority === 'high' ? 'Yüksek' : todo.priority === 'medium' ? 'Orta' : 'Düşük';

              return (
                <div
                  key={todo.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 12px',
                    background: todo.isCompleted ? 'rgba(255,255,255,0.01)' : 'rgba(255,255,255,0.02)',
                    borderRadius: '12px',
                    border: '1px solid var(--border-color)',
                    borderLeft: `3px solid ${pColor}`,
                    opacity: todo.isCompleted ? 0.6 : 1,
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                    <input
                      type="checkbox"
                      checked={todo.isCompleted}
                      onChange={() => handleToggleTodo(todo)}
                      style={{ width: '16px', height: '16px', accentColor: 'var(--accent-cyan)', cursor: 'pointer' }}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ fontSize: '0.82rem', color: '#fff', textDecoration: todo.isCompleted ? 'line-through' : 'none' }}>
                        {todo.task}
                      </span>
                      <span style={{ fontSize: '0.62rem', color: 'var(--color-muted)' }}>
                        {new Date(todo.dateTime).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      fontSize: '0.62rem',
                      fontWeight: 600,
                      color: pColor.replace('0.4', '1'),
                      background: pColor.replace('0.4', '0.08'),
                      border: `1px solid ${pColor}`,
                      padding: '2px 6px',
                      borderRadius: '4px'
                    }}>
                      {pLabel}
                    </span>
                    <button
                      onClick={() => handleDeleteTodo(todo.id)}
                      style={{ background: 'transparent', border: 'none', color: 'var(--color-muted)', cursor: 'pointer', fontSize: '0.82rem' }}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  const renderNotesView = () => {
    const filteredNotes = notes.filter(note =>
      note.title.toLowerCase().includes(noteSearch.toLowerCase()) ||
      note.content.toLowerCase().includes(noteSearch.toLowerCase())
    );

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
          <button
            onClick={() => setCurrentView('home')}
            style={{ background: 'transparent', border: 'none', color: 'var(--accent-cyan)', cursor: 'pointer', fontSize: '0.9rem' }}
          >
            ← Geri
          </button>
          <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600 }}>📝 Not Defteri</h3>
        </div>

        {/* Quick Add Form */}
        <form onSubmit={handleAddNote} style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', padding: '12px', borderRadius: '14px' }}>
          <input
            type="text"
            placeholder="Not Başlığı..."
            value={newNoteTitle}
            onChange={(e) => setNewNoteTitle(e.target.value)}
            className="input-text"
            style={{ padding: '6px 10px', fontSize: '0.78rem' }}
          />
          <textarea
            placeholder="Not içeriğini yazın..."
            value={newNoteContent}
            onChange={(e) => setNewNoteContent(e.target.value)}
            className="input-text"
            style={{ padding: '8px 10px', fontSize: '0.78rem', minHeight: '50px', resize: 'none', fontFamily: 'inherit' }}
          />
          <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <span style={{ fontSize: '0.68rem', color: 'var(--color-secondary)' }}>Kart Rengi:</span>
              <div style={{ display: 'flex', gap: '6px' }}>
                {['#7b2cbf', '#00f0ff', '#2ec4b6', '#ffd700', '#ff3838'].map(color => (
                  <div
                    key={color}
                    onClick={() => setNewNoteColor(color)}
                    style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      background: color,
                      cursor: 'pointer',
                      border: newNoteColor === color ? '2px solid #fff' : '1px solid rgba(255,255,255,0.2)',
                      boxShadow: newNoteColor === color ? `0 0 6px ${color}` : 'none',
                      transform: newNoteColor === color ? 'scale(1.1)' : 'scale(1)',
                      transition: 'all 0.1s'
                    }}
                  />
                ))}
              </div>
            </div>
            <button type="submit" className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '0.75rem' }}>Kaydet</button>
          </div>
        </form>

        {/* Search Bar */}
        <input
          type="text"
          placeholder="Notlarda ara..."
          value={noteSearch}
          onChange={(e) => setNoteSearch(e.target.value)}
          className="input-text"
          style={{ padding: '8px 12px', fontSize: '0.78rem', background: 'rgba(0,0,0,0.2)' }}
        />

        {/* Notes Cards grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '200px', overflowY: 'auto' }}>
          {filteredNotes.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--color-muted)', fontSize: '0.78rem', padding: '24px 0' }}>Hiç not bulunamadı.</div>
          ) : (
            filteredNotes.map(note => (
              <div
                key={note.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  padding: '12px 14px',
                  background: 'rgba(12, 14, 22, 0.4)',
                  border: '1px solid var(--border-color)',
                  borderLeft: `4px solid ${note.color || '#7b2cbf'}`,
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#fff' }}>{note.title}</span>
                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--color-muted)', cursor: 'pointer', fontSize: '0.78rem' }}
                  >
                    Sil
                  </button>
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--color-secondary)', margin: 0, lineHeight: '1.4', whiteSpace: 'pre-wrap' }}>
                  {note.content}
                </p>
                <span style={{ fontSize: '0.6rem', color: 'var(--color-muted)', alignSelf: 'flex-end', marginTop: '2px' }}>
                  {new Date(note.dateTime).toLocaleDateString()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  const handleDeleteMemory = async (id: string) => {
    await databaseService.deleteMemory(id);
    const loaded = await databaseService.getMemories();
    setMemories(loaded);
    refreshExecutiveStatus(todos, reminders, loaded);
    addBridgeLog(`Hafıza Silindi: ${id}`);
  };

  const handleAddMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemoryContent.trim()) return;

    const memory: MemoryItem = {
      id: Date.now().toString(),
      category: newMemoryCategory,
      content: newMemoryContent.trim(),
      timestamp: new Date().toISOString()
    };

    await databaseService.saveMemory(memory);
    const loaded = await databaseService.getMemories();
    setMemories(loaded);
    refreshExecutiveStatus(todos, reminders, loaded);

    setNewMemoryContent('');
    addBridgeLog(`Hafıza Eklendi: [${memory.category}] -> "${memory.content}"`);
  };

  const renderMemoryView = () => {
    const categoryLabels: Record<MemoryCategory, string> = {
      name: 'Ad / İsim',
      job: 'Meslek / Görev',
      projects: 'Projeler',
      habits: 'Alışkanlıklar',
      importantNotes: 'Önemli Notlar',
      ongoingTasks: 'Devam Eden İşler',
      preferences: 'Tercihler',
      general: 'Genel Bilgiler'
    };

    const categoryIcons: Record<MemoryCategory, string> = {
      name: '👤',
      job: '💼',
      projects: '📂',
      habits: '🔁',
      importantNotes: '📌',
      ongoingTasks: '🚀',
      preferences: '❤️',
      general: '🧠'
    };

    const categoriesList: MemoryCategory[] = [
      'name',
      'job',
      'projects',
      'habits',
      'importantNotes',
      'ongoingTasks',
      'preferences',
      'general'
    ];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
          <button
            onClick={() => setCurrentView('home')}
            style={{ background: 'transparent', border: 'none', color: 'var(--accent-cyan)', cursor: 'pointer', fontSize: '0.9rem' }}
          >
            ← Geri
          </button>
          <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600 }}>🧠 Moni Hafıza Yönetimi</h3>
        </div>

        <p style={{ fontSize: '0.72rem', color: 'var(--color-secondary)', margin: 0 }}>
          Moni'nin sizinle ilgili kalıcı olarak aklında tuttuğu bilgiler. Bu bilgiler sohbetlerinizde bağlam (context) olarak kullanılır.
        </p>

        {/* Categories cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '350px', overflowY: 'auto', paddingRight: '4px' }}>
          {categoriesList.map(cat => {
            const items = memories.filter(m => m.category === cat);
            
            return (
              <div
                key={cat}
                style={{
                  background: 'rgba(12, 14, 22, 0.4)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '6px' }}>
                  <span style={{ fontSize: '1rem' }}>{categoryIcons[cat]}</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--accent-cyan)' }}>
                    {categoryLabels[cat]}
                  </span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--color-muted)', marginLeft: 'auto' }}>
                    ({items.length} kayıt)
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
                  {items.length === 0 ? (
                    <span style={{ fontSize: '0.74rem', color: 'var(--color-muted)', fontStyle: 'italic', paddingLeft: '4px' }}>
                      Henüz bilgi kaydedilmedi.
                    </span>
                  ) : (
                    items.map(item => (
                      <div
                        key={item.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          background: 'rgba(255, 255, 255, 0.02)',
                          borderRadius: '8px',
                          padding: '6px 8px',
                          border: '1px dashed rgba(255,255,255,0.05)'
                        }}
                      >
                        <span style={{ fontSize: '0.78rem', color: '#fff', lineHeight: '1.4', flex: 1, paddingRight: '10px' }}>
                          {item.content}
                        </span>
                        <button
                          onClick={() => handleDeleteMemory(item.id)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--accent-red)',
                            cursor: 'pointer',
                            fontSize: '0.7rem',
                            padding: '2px 4px'
                          }}
                        >
                          Sil
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Manual Add Memory Form */}
        <form
          onSubmit={handleAddMemory}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            background: 'rgba(255,255,255,0.01)',
            border: '1px solid var(--border-color)',
            padding: '12px',
            borderRadius: '14px',
            marginTop: '4px'
          }}
        >
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--color-secondary)' }}>Kategori:</span>
            <select
              value={newMemoryCategory}
              onChange={(e) => setNewMemoryCategory(e.target.value as MemoryCategory)}
              style={{
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid var(--border-color)',
                color: 'var(--color-primary)',
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                outline: 'none',
                cursor: 'pointer',
                flex: 1
              }}
            >
              {categoriesList.map(cat => (
                <option key={cat} value={cat}>
                  {categoryIcons[cat]} {categoryLabels[cat]}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="Hatırlanacak bilgiyi girin..."
              value={newMemoryContent}
              onChange={(e) => setNewMemoryContent(e.target.value)}
              className="input-text"
              style={{ flex: 1, padding: '6px 10px', fontSize: '0.78rem' }}
            />
            <button
              type="submit"
              className="btn btn-primary"
              style={{ padding: '6px 12px', fontSize: '0.75rem' }}
            >
              Ekle
            </button>
          </div>
        </form>
      </div>
    );
  };

  const handlePageClick = async () => {
    if ((window as any).moniAudioUnlocked) {
      // 2. Wake Word Trigger check
      if (isWakeWordListening && !isRecording && !isSpeakingRef.current) {
        if (!wakeRecognitionRef.current) {
          startWakeWordRecognition();
        } else {
          try {
            wakeRecognitionRef.current.start();
          } catch (e) { }
        }
      }
      return;
    }

    // 1. Mobile Audio Engine Unlock
    let tempCtx: AudioContext | null = null;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        if (!(window as any).moniAudioContext) {
          (window as any).moniAudioContext = new AudioContextClass();
        }
        const ctx = (window as any).moniAudioContext;
        tempCtx = ctx;
        if (ctx) {
          if (ctx.state === 'suspended') {
            await ctx.resume();
          }
          // Play silent sound to trigger hardware activation
          const buffer = ctx.createBuffer(1, 1, 22050);
          const source = ctx.createBufferSource();
          source.buffer = buffer;
          source.connect(ctx.destination);
          source.start(0);
        }
      }
    } catch (e) {
      console.error("AudioContext unlock failed:", e);
    }

    try {
      if (!(window as any).moniAudio) {
        const audio = new Audio();
        // Silently unlock HTMLAudioElement
        audio.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';
        await audio.play().catch(() => { });
        audio.pause();
        (window as any).moniAudio = audio;
      }
    } catch (e) {
      console.error("HTMLAudioElement unlock failed:", e);
    }

    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance('');
        window.speechSynthesis.speak(utterance);
      }
    } catch (e) {
      console.error("SpeechSynthesis unlock failed:", e);
    }

    // Play clean digital beep instead of chime music file
    if (tempCtx) {
      playAssistantBeep(tempCtx);
    }

    (window as any).moniAudioUnlocked = true;
    addBridgeLog("Moni Ses Motoru ve Donanımı telefonda başarıyla aktif edildi.");

    // 2. Wake Word Trigger check
    if (isWakeWordListening && !isRecording && !isSpeakingRef.current) {
      if (!wakeRecognitionRef.current) {
        startWakeWordRecognition();
      } else {
        try {
          wakeRecognitionRef.current.start();
        } catch (e) { }
      }
    }
  };

  return (
    <div onClick={handlePageClick} className="dashboard-root">
      {audioNotification && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'rgba(255, 56, 56, 0.95)',
          color: '#fff',
          padding: '12px 20px',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(255, 56, 56, 0.4)',
          zIndex: 9999,
          fontFamily: 'var(--font-sans)',
          fontSize: '0.82rem',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          minWidth: '280px',
          justifyContent: 'space-between',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>⚠️</span>
            <span>{audioNotification}</span>
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setAudioNotification(null);
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '1.1rem',
              padding: '0 0 0 10px',
              fontWeight: 'bold',
              lineHeight: 1,
              opacity: 0.8
            }}
          >
            ×
          </button>
        </div>
      )}
      {/* Phone Mockup Wrapper Container */}
      <div className="phone-container">

        {/* Slide-out Sidebar Drawer */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '280px',
          height: '100%',
          background: 'rgba(10, 11, 18, 0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          zIndex: 1000,
          borderRight: '1px solid var(--border-color)',
          transform: isSidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.4s cubic-bezier(0.1, 0.9, 0.2, 1)',
          display: 'flex',
          flexDirection: 'column',
          padding: '24px 20px',
          boxShadow: '10px 0 30px rgba(0,0,0,0.5)',
          boxSizing: 'border-box'
        }}>
          {/* Sidebar Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontWeight: 'bold', color: '#07080d', fontSize: '0.8rem' }}>M</span>
              </div>
              <span style={{ fontWeight: '700', fontSize: '1.1rem', letterSpacing: '-0.5px' }}>MONI MENU</span>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              style={{ background: 'transparent', border: 'none', color: 'var(--color-secondary)', fontSize: '1.2rem', cursor: 'pointer' }}
            >
              ✕
            </button>
          </div>

          {/* Sidebar Links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
            {[
              { id: 'home', label: 'Anasayfa', icon: '🏠' },
              { id: 'chat', label: 'Asistan Sohbet Odası', icon: '💬' },
              { id: 'contacts', label: 'Rehberim (Local DB)', icon: '👤' },
              { id: 'calendar', label: 'Takvim & Randevu Defteri', icon: '📅' },
              { id: 'todos', label: 'Yapılacaklar Listesi', icon: '📋' },
              { id: 'notes', label: 'Not Defteri', icon: '📝' },
              { id: 'memory', label: 'Hafıza Yönetimi', icon: '🧠' },
              { id: 'agenda', label: 'Tüm Hatırlatıcılar', icon: '⏰' },
              { id: 'modulator', label: 'Ses Efekt Modülatörü', icon: '🎙️' },
              { id: 'settings', label: 'Sistem Ayarları', icon: '⚙️' }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentView(item.id as any);
                  setIsSidebarOpen(false);
                  addBridgeLog(`Menü geçişi: ${item.label}`);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  border: 'none',
                  background: currentView === item.id
                    ? 'linear-gradient(135deg, rgba(0, 240, 255, 0.08), rgba(157, 78, 221, 0.08))'
                    : 'transparent',
                  borderLeft: currentView === item.id ? '3px solid var(--accent-cyan)' : '3px solid transparent',
                  color: currentView === item.id ? 'var(--accent-cyan)' : 'var(--color-primary)',
                  fontWeight: currentView === item.id ? '600' : '400',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '0.88rem',
                  transition: 'all 0.2s ease'
                }}
              >
                <span style={{ fontSize: '1.05rem' }}>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>

          {/* Sidebar Footer */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', fontSize: '0.72rem', color: 'var(--color-muted)', textAlign: 'center' }}>
            MONI v0.1.0 • Profesyonel Sürüm
          </div>
        </div>

        {/* Sidebar Backdrop Overlay */}
        {isSidebarOpen && (
          <div
            onClick={() => setIsSidebarOpen(false)}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'rgba(0, 0, 0, 0.4)',
              backdropFilter: 'blur(3px)',
              zIndex: 999
            }}
          />
        )}

        {/* Header Bar */}
        <header style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
          background: 'rgba(18, 20, 29, 0.4)',
          height: '56px',
          boxSizing: 'border-box',
          flexShrink: 0
        }}>
          <button
            onClick={() => setIsSidebarOpen(true)}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'white',
              fontSize: '1.05rem',
              transition: 'all 0.2s'
            }}
            className="hover-scale"
          >
            ☰
          </button>

          <span style={{
            fontSize: '1.1rem',
            fontWeight: '700',
            color: '#ffd700',
            letterSpacing: '1px',
            textShadow: '0 0 10px rgba(255, 215, 0, 0.2)'
          }}>
            MONI
          </span>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '1.1rem', cursor: 'pointer' }} title="Moni Profesyonel Sürüm">🏆</span>
            <span
              className={`status-dot ${isOffline ? 'offline' : 'online'}`}
              style={{ width: '8px', height: '8px', cursor: 'pointer' }}
              title={isOffline ? 'Çevrimdışı / Local LLM' : 'Çevrimiçi / Cloud LLM'}
              onClick={() => {
                setIsOffline(!isOffline);
                addBridgeLog(`Bağlantı modu değiştirildi: ${!isOffline ? 'Çevrimdışı' : 'Çevrimiçi'}`);
              }}
            />
          </div>
        </header>

        {/* Scrollable View Content Area */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box'
        }}>
          {currentView === 'home' && renderHomeView()}
          {currentView === 'chat' && renderChatView()}
          {currentView === 'contacts' && renderContactsView()}
          {currentView === 'agenda' && renderAgendaView()}
          {currentView === 'calendar' && renderCalendarView()}
          {currentView === 'todos' && renderTodosView()}
          {currentView === 'notes' && renderNotesView()}
          {currentView === 'memory' && renderMemoryView()}
          {currentView === 'modulator' && renderModulatorView()}
          {currentView === 'settings' && renderSettingsView()}
        </div>

        {/* Active Alarm Modal Overlay */}
        {activeAlarm && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(7, 8, 13, 0.9)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            zIndex: 2000,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            boxSizing: 'border-box'
          }}>
            <div style={{
              width: '100%',
              maxWidth: '320px',
              background: 'rgba(255,255,255,0.03)',
              border: '2px solid var(--accent-cyan)',
              borderRadius: '24px',
              padding: '28px 20px',
              boxShadow: '0 0 40px rgba(0, 240, 255, 0.25)',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px',
              boxSizing: 'border-box'
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'rgba(0, 240, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.0rem',
                animation: 'pulse-gold 1.5s infinite ease-in-out'
              }}>
                ⏰
              </div>
              <h2 style={{ fontSize: '1.25rem', margin: 0, color: 'var(--accent-cyan)', fontWeight: 700 }}>MONI UYARI</h2>
              <div style={{ fontSize: '1rem', fontWeight: 600, color: '#fff', margin: '4px 0' }}>
                {activeAlarm.title}
              </div>
              {activeAlarm.description && (
                <div style={{ fontSize: '0.8rem', color: 'var(--color-secondary)' }}>
                  {activeAlarm.description}
                </div>
              )}
              <div style={{ fontSize: '0.75rem', color: 'var(--accent-purple)', fontWeight: 600 }}>
                {new Date(activeAlarm.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              <button
                className="btn btn-primary"
                style={{ width: '100%', padding: '12px 0', borderRadius: '12px', marginTop: '10px' }}
                onClick={() => setActiveAlarm(null)}
              >
                Anlaşıldı
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mic recording style injection */}
      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.7; }
          100% { transform: scale(1); opacity: 1; }
        }
        .pulse {
          animation: pulse 1.5s infinite ease-in-out;
        }
        .hover-scale:hover {
          transform: scale(1.05);
          background: rgba(255,255,255,0.1) !important;
        }
        .home-nav-card {
          transition: all 0.2s ease-in-out;
        }
        .home-nav-card:hover {
          transform: translateY(-2px);
          border-color: rgba(255, 215, 0, 0.4) !important;
          background: rgba(255, 215, 0, 0.04) !important;
        }
        .btn-voice-trigger:hover {
          transform: scale(1.03);
          box-shadow: 0 0 25px rgba(255, 215, 0, 0.4), inset 0 0 10px rgba(255, 215, 0, 0.2);
        }
        .btn-voice-trigger.recording {
          animation: pulse-gold 1.5s infinite ease-in-out;
        }
        @keyframes pulse-gold {
          0% { transform: scale(1); box-shadow: 0 0 20px rgba(255, 215, 0, 0.2); }
          50% { transform: scale(1.05); box-shadow: 0 0 30px rgba(255, 215, 0, 0.5); }
          100% { transform: scale(1); box-shadow: 0 0 20px rgba(255, 215, 0, 0.2); }
        }
        @media (max-width: 500px) {
          .phone-container {
            max-width: 100% !important;
            height: 100vh !important;
            min-height: 0 !important;
            max-height: 100vh !important;
            border-radius: 0 !important;
            border: none !important;
            box-shadow: none !important;
          }
        }
        @media (max-width: 480px) {
          .dashboard2-header-card {
            flex-direction: column !important;
            align-items: center !important;
            text-align: center !important;
            padding: 20px 14px !important;
          }
          .dashboard2-header-card button {
            align-self: center !important;
          }
          .dashboard2-avatar-wrapper {
            width: 120px !important;
            height: 120px !important;
            margin-bottom: 8px !important;
          }
        }
      `}</style>
    </div>
  );
};
