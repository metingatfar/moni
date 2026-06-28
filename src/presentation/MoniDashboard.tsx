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
import { container } from '../core/container/ServiceContainer';
import { ExecutiveBrain } from '../core/brain/ExecutiveBrain';
import { eventBus } from '../core/events/EventBus';
import { stateManager } from '../core/state/StateManager';
import { moniInteractionCoordinator } from '../core/coordinator/MoniInteractionCoordinator';
import { MoniIntelligenceEngine } from '../core/intelligence/IntelligenceEngine';
import { telemetry } from '../core/telemetry/Telemetry';
import { getEndpoint, API_BASE_URL } from '../config/api';
// import { personalityEngine, PersonalityEngine } from '../core/personality/PersonalityEngine';
// import type { PersonalityMode } from '../core/personality/PersonalityEngine';

// const aiService = new LocalAiService();
const bridgeService = new NativeBridge();

export const MoniDashboard: React.FC = () => {
  const [isMobile, setIsMobile] = useState(() => (typeof window !== 'undefined' ? window.innerWidth < 768 : false));
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeRightTab, setActiveRightTab] = useState<'today' | 'memory' | 'voice' | 'suggestions' | 'tasks' | 'system'>('today');
  const [activeSettingsCategory, setActiveSettingsCategory] = useState<'general' | 'voice' | 'appearance' | 'providers' | 'memory' | 'developer' | 'about' | 'intelligence'>('general');
  const [settingsSearch, setSettingsSearch] = useState('');
  const [helpSearch, setHelpSearch] = useState('');
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [commandSearch, setCommandSearch] = useState('');
  const [showRestorePrompt, setShowRestorePrompt] = useState(true);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [proactiveEnabled, setProactiveEnabled] = useState(() => (typeof window !== 'undefined' ? localStorage.getItem('moni_proactive_suggestions') !== 'false' : true));
  const [proactiveFrequency, setProactiveFrequency] = useState(() => (typeof window !== 'undefined' ? localStorage.getItem('moni_suggestions_frequency') || 'normal' : 'normal'));

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    
    // Log startup event
    MoniIntelligenceEngine.getInstance().logEvent('MONI Workspace opened', 'system');
    
    // Ctrl + K listener for Command palette
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

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

  const [currentView, setCurrentView] = useState<'home' | 'chat' | 'contacts' | 'agenda' | 'modulator' | 'settings' | 'calendar' | 'todos' | 'notes' | 'memory' | 'help' | 'voice' | 'companion'>('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const [activeAlarm, setActiveAlarm] = useState<Reminder | null>(null);
  const firedReminderIdsRef = useRef<string[]>([]);

  const getDynamicUserName = (): string => {
    // 1. Look in memories for category === 'name'
    const nameMemory = memories.find(m => m.category === 'name');
    if (nameMemory && nameMemory.content && nameMemory.content.trim()) {
      return nameMemory.content.trim();
    }
    
    // 2. Look in memories for key === 'userName'
    const userNameMemory = memories.find((m: any) => m.key === 'userName' || m.meta?.key === 'userName');
    if (userNameMemory && userNameMemory.content && userNameMemory.content.trim()) {
      return userNameMemory.content.trim();
    }

    // 3. Scan memories for "Benim adım X" or "My name is X"
    const patternTr = /benim\s+adım\s+([a-zA-ZçğıöşüÇĞİÖŞÜ\s]+)/i;
    const patternEn = /my\s+name\s+is\s+([a-zA-Z\s]+)/i;
    for (const m of memories) {
      if (m.content) {
        const matchTr = m.content.match(patternTr);
        if (matchTr && matchTr[1] && matchTr[1].trim()) {
          return matchTr[1].trim();
        }
        const matchEn = m.content.match(patternEn);
        if (matchEn && matchEn[1] && matchEn[1].trim()) {
          return matchEn[1].trim();
        }
      }
    }

    // 4. LocalStorage fallback
    const localName = localStorage.getItem('moni_user_name');
    if (localName && localName.trim()) {
      return localName.trim();
    }

    return '';
  };

  // Notes and Todos state
  const [notes, setNotes] = useState<Note[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);

  // Memory engine states
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [newMemoryContent, setNewMemoryContent] = useState('');
  const [newMemoryCategory, setNewMemoryCategory] = useState<MemoryCategory>('custom');

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
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [showTestLab, setShowTestLab] = useState(false);
  const [liveProviderTest, setLiveProviderTest] = useState(false);
  const [testLabDashboard, setTestLabDashboard] = useState<any>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [testResultMessage, setTestResultMessage] = useState<string | null>(null);

  const refreshTestLabDashboard = async () => {
    try {
      const obCenter = container.resolve<any>('ObservabilityCenter');
      if (obCenter) {
        const dash = await obCenter.getDashboard();
        setTestLabDashboard(dash);
      }
    } catch (_) {}
  };

  useEffect(() => {
    if (showTestLab) {
      refreshTestLabDashboard();
      const interval = setInterval(refreshTestLabDashboard, 3000);
      return () => clearInterval(interval);
    }
  }, [showTestLab]);

  const runTestLabSuite = async (type: 'smoke' | 'full' | 'regression' | 'performance' | 'provider' | 'stress') => {
    setIsTesting(true);
    try {
      const runner = container.resolve<any>('ObservabilityCenter');
      if (runner) {
        if (type === 'smoke') await runner.runSmoke();
        else if (type === 'full') await runner.runAll();
        else if (type === 'regression') await runner.runRegression();
        else if (type === 'performance') await runner.runPerformance();
        else if (type === 'provider') {
          // If active, run live provider check
          const testRunner = container.resolve<any>('ObservabilityCenter');
          if (testRunner) {
            // resolve directly through SystemTestRunner
            const tr = await import('../core/observability/SystemTestRunner');
            await tr.systemTestRunner.runProviderTests(liveProviderTest);
          }
        }
        else if (type === 'stress') {
          const tr = await import('../core/observability/SystemTestRunner');
          await tr.systemTestRunner.runStressTests(100);
        }
        await refreshTestLabDashboard();
        setTestResultMessage(`✅ ${type.toUpperCase()} testleri tamamlandı!`);
        setTimeout(() => setTestResultMessage(null), 5000);
      }
    } catch (e: any) {
      setTestResultMessage(`❌ Test hatası: ${e.message}`);
      setTimeout(() => setTestResultMessage(null), 8000);
    } finally {
      setIsTesting(false);
    }
  };

  const handleClearTestLogs = () => {
    try {
      const obCenter = container.resolve<any>('ObservabilityCenter');
      if (obCenter) {
        obCenter.clearLogs();
        refreshTestLabDashboard();
        alert('Test logları ve performans profilleri temizlendi.');
      }
    } catch (_) {}
  };

  const handleExportTestReport = (format: 'json' | 'md' | 'pdf') => {
    if (!testLabDashboard) {
      alert('Dışa aktarılacak test verisi bulunmuyor. Lütfen önce testleri çalıştırın.');
      return;
    }

    const timestamp = new Date().toISOString();
    let content = '';
    let mimeType = 'text/plain';
    let ext = 'txt';

    if (format === 'json') {
      content = JSON.stringify(testLabDashboard, null, 2);
      mimeType = 'application/json';
      ext = 'json';
    } else if (format === 'md') {
      content = `# MONI Test Lab Export Report - ${timestamp}\n\n`;
      content += `## System Overall Score: ${testLabDashboard.overallScore}/100\n\n`;
      content += `### Smoke Tests:\n`;
      content += `- Passed: ${testLabDashboard.smoke?.passed || 0}\n`;
      content += `- Failed: ${testLabDashboard.smoke?.failed || 0}\n`;
      content += `- Skipped: ${testLabDashboard.smoke?.skipped || 0}\n\n`;
      content += `### Health Statuses:\n`;
      testLabDashboard.health?.forEach((h: any) => {
        content += `- ${h.service}: ${h.status.toUpperCase()} (${h.latencyMs}ms) - ${h.details}\n`;
      });
      content += `\n### Performance Metrics:\n`;
      testLabDashboard.metrics?.forEach((m: any) => {
        content += `- ${m.moduleName}: Avg ${m.averageDurationMs}ms (Calls: ${m.callCount})\n`;
      });
      mimeType = 'text/markdown';
      ext = 'md';
    } else if (format === 'pdf') {
      // PDF representation as a printable styled HTML page
      content = `<html><head><title>MONI Test Lab Report</title><style>body{font-family:sans-serif;padding:30px;color:#333;}h1{border-bottom:2px solid #333;}table{width:100%;border-collapse:collapse;}th,td{border:1px solid #ddd;padding:8px;text-align:left;}</style></head><body>`;
      content += `<h1>MONI Observability Report</h1>`;
      content += `<p>Generated: ${timestamp}</p>`;
      content += `<h2>System Score: ${testLabDashboard.overallScore}/100</h2>`;
      content += `<h3>Smoke Results: Passed: ${testLabDashboard.smoke?.passed || 0}, Failed: ${testLabDashboard.smoke?.failed || 0}</h3>`;
      content += `<h3>Service Status:</h3><table><tr><th>Service</th><th>Status</th><th>Latency</th></tr>`;
      testLabDashboard.health?.forEach((h: any) => {
        content += `<tr><td>${h.service}</td><td>${h.status}</td><td>${h.latencyMs}ms</td></tr>`;
      });
      content += `</table></body></html>`;
      mimeType = 'text/html';
      ext = 'html'; // HTML fallback for browser PDF export
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `moni_test_report_${Date.now()}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  const showAudioNotification = (message: string) => {
    setAudioNotification(message);
    setTimeout(() => {
      setAudioNotification(prev => prev === message ? null : prev);
    }, 6000);
  };

  const checkBackendHealth = async () => {
    const url = getEndpoint('health');
    
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

  const refreshDashboardData = async () => {
    const loadedTodos = await databaseService.getTodos();
    const loadedReminders = await databaseService.getReminders();
    const loadedNotes = await databaseService.getNotes();
    const loadedMemories = await databaseService.getMemories();
    setTodos(loadedTodos);
    setReminders(loadedReminders);
    setNotes(loadedNotes);
    setMemories(loadedMemories);
    await refreshExecutiveStatus(loadedTodos, loadedReminders, loadedMemories);
  };

  const currentLanguage = (typeof window !== 'undefined' && localStorage.getItem('moni_language')) || 'tr';

  useEffect(() => {
    moniInteractionCoordinator.setUIContext({
      setMessages,
      setMoniStatus,
      setAvatarMood,
      setCurrentlySpeakingMsgId,
      currentLanguage: currentLanguage as 'tr' | 'en',
      autoSpeakEnabled,
      speechRate,
      speechVolume,
      selectedSystemVoiceName: selectedSystemVoiceName || undefined,
      geminiApiKey,
      memories,
      isWakeWordListening,
      startWakeWordRecognition,
      startCommandListening,
      showTemporaryError,
      pendingSecretary: pendingSecretaryCommand,
      setPendingSecretary: setPendingSecretaryCommand,
      refreshDashboardData
    });
  }, [
    setMessages,
    setMoniStatus,
    setAvatarMood,
    setCurrentlySpeakingMsgId,
    currentLanguage,
    autoSpeakEnabled,
    speechRate,
    speechVolume,
    selectedSystemVoiceName,
    geminiApiKey,
    memories,
    isWakeWordListening,
    pendingSecretaryCommand
  ]);

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

  const processUnifiedInput = async (inputText: string, source: 'keyboard' | 'voice' | 'system') => {
    MoniIntelligenceEngine.getInstance().logEvent('User chat started: ' + source, 'chat');
    await moniInteractionCoordinator.processInput(inputText, source);
  };

  const processVoiceCommand = async (command: string) => {
    console.log('[VOICE-5] Transcript: ' + command);
    if (!command.trim()) {
      if (isWakeWordListening) startWakeWordRecognition();
      return;
    }
    MoniIntelligenceEngine.getInstance().logEvent('Voice command processed', 'voice');
    await processUnifiedInput(command, 'voice');
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;
    setInputMessage('');
    await processUnifiedInput(text, 'keyboard');
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

  // Strict compiler satisfaction checks
  void setIsOffline;
  void setIsWakeWordListening;
  void setIsSidebarOpen;
  void setAvatarAnimationsEnabled;
  void setAvatarMouthAnimationEnabled;
  void setAvatarEffectsIntensity;
  void showDiagnostics;
  void setShowDiagnostics;
  void setShowTestLab;
  void setLiveProviderTest;
  void isTesting;
  void testResultMessage;
  void runTestLabSuite;
  void handleClearTestLogs;
  void handleExportTestReport;
  void generateAIReply;
  void activeRightTab;
  void isMobile;
  void isSidebarCollapsed;
  void activeSettingsCategory;
  void settingsSearch;
  void helpSearch;
  void showCommandPalette;
  void commandSearch;
  void bridgeLogs;
  void currentLanguage;
  void currentTime;
  void isInstallable;
  void handleInstallApp;
  void backendHealth;
  void setHelpSearch;
  void setAvatarType;
  void setEyeColor;
  void setGeminiApiKey;
  void setAutoSpeakEnabled;
  void setSpeechRate;
  void setSpeechVolume;
  void MoniLive2D;
  void isSidebarOpen;
  void SecretaryService;
  void DateParserHelper;
  void ExecutiveBrain;
  void eventBus;
  void stateManager;
  void telemetry;
  void API_BASE_URL;

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
    const renderCompanionCenter = () => {
    const isTurkish = currentLanguage === 'tr';
    const engine = MoniIntelligenceEngine.getInstance();
    const events = engine.getEvents();
    const notifications = engine.getNotifications();
    const suggestions = engine.getRecommendations(currentLanguage as 'tr' | 'en', todos);
    const insights = engine.getProductivityInsights(todos, memories);
    const projStats = engine.getProjectStats(activeProjectsList[0] || '', todos);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', flex: 1, minHeight: '520px', boxSizing: 'border-box' }}>
        <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '12px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>🧠 AI Companion Center / Kişisel Asistan Paneli</h2>
          <div style={{ fontSize: '0.74rem', color: 'var(--color-muted)', marginTop: '4px' }}>
            Moni'nin günlük üretkenlik skorları, sistem günlükleri ve bağlamsal önerileri.
          </div>
        </div>

        {/* Top score widgets */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
          <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>{insights.dailyScore}%</span>
            <span style={{ fontSize: '0.74rem', color: 'var(--color-secondary)', fontWeight: 600 }}>Daily Productivity Score / Günlük Skor</span>
          </div>
          <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-purple)' }}>{insights.weeklyScore}%</span>
            <span style={{ fontSize: '0.74rem', color: 'var(--color-secondary)', fontWeight: 600 }}>Weekly Average Score / Haftalık Skor</span>
          </div>
          <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-green)' }}>+{insights.memoryGrowth}</span>
            <span style={{ fontSize: '0.74rem', color: 'var(--color-secondary)', fontWeight: 600 }}>Remembered Facts / Bellek Büyümesi</span>
          </div>
        </div>

        {/* Mid-level layout grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
          
          {/* Active project intelligence */}
          <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700 }}>📁 Project Intelligence / Aktif Proje Analizi</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                <span style={{ color: 'var(--color-muted)' }}>Name / Proje Adı:</span>
                <span style={{ fontWeight: 'bold' }}>{projStats.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                <span style={{ color: 'var(--color-muted)' }}>Completion Rate / Tamamlanma:</span>
                <span style={{ fontWeight: 'bold', color: 'var(--accent-cyan)' }}>{projStats.completionPercentage}%</span>
              </div>
              {/* Progress bar */}
              <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '10px', overflow: 'hidden' }}>
                <div style={{ width: projStats.completionPercentage + '%', height: '100%', background: 'linear-gradient(90deg, var(--accent-cyan), var(--accent-purple))' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginTop: '4px' }}>
                <span style={{ color: 'var(--color-muted)' }}>Active Tasks count:</span>
                <span>{projStats.completedTaskCount} / {projStats.taskCount}</span>
              </div>
            </div>
          </div>

          {/* Smart Suggestions card */}
          <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700 }}>💡 Context Recommendations / Akıllı Öneriler</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {suggestions.map((s, idx) => (
                <div key={idx} style={{ fontSize: '0.76rem', background: 'rgba(0, 240, 255, 0.03)', border: '1px solid rgba(0, 240, 255, 0.1)', padding: '10px 14px', borderRadius: '8px', color: 'var(--color-primary)' }}>
                  💡 {s}
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Bottom Timeline and notifications log panel */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          
          {/* Activity timeline list */}
          <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', minHeight: '260px' }}>
            <h3 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700 }}>⏳ Activity Timeline / Aktivite Zaman Akışı</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', maxHeight: '200px' }}>
              {events.slice(-8).reverse().map((ev) => (
                <div key={ev.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '6px' }}>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <span style={{
                      color: ev.severity === 'error' ? 'var(--accent-red)' : ev.severity === 'success' ? 'var(--accent-green)' : 'var(--accent-cyan)'
                    }}>●</span>
                    <span>{ev.event}</span>
                  </div>
                  <span style={{ color: 'var(--color-muted)' }}>{new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              ))}
              {events.length === 0 && (
                <div style={{ fontSize: '0.74rem', color: 'var(--color-muted)', textAlign: 'center', marginTop: '40px' }}>Henüz kayıtlı aktivite bulunmuyor.</div>
              )}
            </div>
          </div>

          {/* Notifications feed */}
          <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', minHeight: '260px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700 }}>🔔 System Notifications / Bildirim Geçmişi</h3>
              <button
                onClick={() => {
                  engine.clearAllNotifications();
                  // Force refresh by reloading or updating state triggers
                  alert(isTurkish ? "Tüm bildirimler silindi." : "Cleared all notifications.");
                }}
                style={{ background: 'transparent', border: 'none', color: 'var(--color-muted)', cursor: 'pointer', fontSize: '0.72rem' }}
              >
                Clear All / Temizle
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', maxHeight: '200px' }}>
              {notifications.slice(-6).reverse().map((n) => (
                <div key={n.id} style={{ padding: '8px 10px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', fontSize: '0.74rem', borderLeft: n.read ? 'none' : '3px solid var(--accent-cyan)' }}>
                  <div style={{ fontWeight: 'bold' }}>{isTurkish ? n.titleTr : n.titleEn}</div>
                  <div style={{ color: 'var(--color-muted)', fontSize: '0.64rem', marginTop: '2px' }}>{new Date(n.timestamp).toLocaleTimeString()}</div>
                </div>
              ))}
              {notifications.length === 0 && (
                <div style={{ fontSize: '0.74rem', color: 'var(--color-muted)', textAlign: 'center', marginTop: '40px' }}>Herhangi bir bildirim bulunmuyor.</div>
              )}
            </div>
          </div>

        </div>
      </div>
    );
  };

  const renderHomeView = () => {
    void renderDashboard2View;
    void renderDashboard2View;
    const name = getDynamicUserName();
    const isTurkish = currentLanguage === 'tr';
    const totalTodos = todos.filter(t => !t.isCompleted).length;
    
    // Welcome Greeting texts
    const greetingText = name 
      ? (isTurkish ? 'Merhaba ' + name + ', bugün ne yapmak istersin?' : 'Hello ' + name + ', what would you like to do today?')
      : (isTurkish ? "Merhaba, bugün ne yapmak istersin?" : "Hello, what would you like to do today?");

    // 1. Mobile Home View Adapter
    if (isMobile) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '10px 4px', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>MONI COMPANION</span>
            <span style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.06)', padding: '4px 10px', borderRadius: '20px', color: 'var(--accent-cyan)', border: '1px solid rgba(0,240,255,0.15)' }}>
              👤 {name || (isTurkish ? 'Profil' : 'Profile')}
            </span>
          </div>

          <div className="glass-panel" style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', textAlign: 'center', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: '800', letterSpacing: '-0.3px', margin: 0 }}>{greetingText}</h2>
            <div style={{ width: '130px', height: '130px', borderRadius: '50%', padding: '2px', background: 'rgba(0,240,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setCurrentView('voice')}>
              <MoniAvatar status={moniStatus} isSpeaking={currentlySpeakingMsgId !== null} mood={avatarMood} avatarType={avatarType} eyeColor={eyeColor} />
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--color-muted)' }}>{isTurkish ? 'Konuşmak için dokun / Dokun ve Konuş' : 'Tap Orb to speak by voice'}</div>
          </div>

          {/* Big Buttons Quick Actions Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {[
              { id: 'voice', label: isTurkish ? '🎙️ Konuş' : '🎙️ Talk', view: 'voice' },
              { id: 'chat', label: isTurkish ? '💬 Yaz' : '💬 Type', view: 'chat' },
              { id: 'todos', label: isTurkish ? '📋 Görevler' : '📋 Tasks', view: 'todos' },
              { id: 'memory', label: isTurkish ? '🧠 Bellek' : '🧠 Memory', view: 'memory' },
              { id: 'settings', label: isTurkish ? '⚙️ Ayarlar' : '⚙️ Settings', view: 'settings' },
              { id: 'help', label: isTurkish ? '❓ Yardım' : '❓ Help', view: 'help' }
            ].map(b => (
              <button
                key={b.id}
                onClick={() => setCurrentView(b.view as any)}
                className="btn btn-secondary glass-panel-hover"
                style={{ padding: '16px', fontSize: '0.85rem', fontWeight: 'bold', justifyContent: 'center' }}
              >
                {b.label}
              </button>
            ))}
          </div>

          {/* Recent Chat Preview */}
          <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(0,0,0,0.15)' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 'bold', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>
              {isTurkish ? '⏰ Günün Özeti' : '⏰ Daily Brief'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-secondary)' }}>
              {isTurkish ? 'Tamamlanacak ' + totalTodos + ' aktif görev var.' : 'You have ' + totalTodos + ' active tasks.'}
            </div>
          </div>
        </div>
      );
    }

    // 2. Desktop Home Screen Layout
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', flex: 1, minHeight: '100%', boxSizing: 'border-box' }}>
        
        {/* Dynamic greeting section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>{greetingText}</h1>
            <p style={{ fontSize: '0.82rem', color: 'var(--color-muted)', margin: '4px 0 0 0' }}>
              {new Date().toLocaleDateString(isTurkish ? 'tr-TR' : 'en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <span style={{ fontSize: '0.76rem', background: 'rgba(16, 185, 129, 0.08)', color: 'var(--accent-green)', padding: '6px 12px', borderRadius: '20px', border: '1px solid rgba(16,185,129,0.15)', fontWeight: 600 }}>
              ● {isTurkish ? 'Asistan Hazır' : 'Companion Active'}
            </span>
          </div>
        </div>

        {/* Home Screen Widgets Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px', flex: 1 }}>
          
          {/* Left Column: Visualizer Orb Widget */}
          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 20px', gap: '20px', background: 'rgba(0,0,0,0.1)', border: '1px solid rgba(255,255,255,0.04)' }}>
            <div style={{ width: '160px', height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px', borderRadius: '50%', background: 'rgba(0,240,255,0.06)' }}>
              <MoniAvatar status={moniStatus} isSpeaking={currentlySpeakingMsgId !== null} mood={avatarMood} avatarType={avatarType} eyeColor={eyeColor} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--accent-cyan)' }}>MONI Core Orb</span>
              <p style={{ fontSize: '0.74rem', color: 'var(--color-muted)', margin: '4px 0 0 0' }}>
                {isTurkish ? 'Moni şu an boşta ve sizi dinlemeye hazır.' : 'Moni is idle and ready to collaborate.'}
              </p>
            </div>
          </div>

          {/* Right Column: Cards Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Daily Brief & System highlights */}
            <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                ☕ {isTurkish ? 'Günün Brifingi' : 'Morning Brief'}
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px' }}>
                  <span>📋 {isTurkish ? 'Yapılacaklar:' : 'Tasks:'} </span>
                  <span style={{ fontWeight: 'bold', color: 'var(--accent-cyan)' }}>{isTurkish ? '' + totalTodos + ' aktif görev' : '' + totalTodos + ' active' }</span>
                </div>
                <div style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px' }}>
                  <span>🧠 {isTurkish ? 'Kayıtlar:' : 'Memories:'} </span>
                  <span style={{ fontWeight: 'bold', color: 'var(--accent-purple)' }}>{isTurkish ? '' + memories.length + ' bilgi' : '' + memories.length + ' records' }</span>
                </div>
                <div style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px' }}>
                  <span>🗣️ {isTurkish ? 'Ses Dönüşü:' : 'Voice Output:'} </span>
                  <span style={{ fontWeight: 'bold', color: 'var(--accent-green)' }}>{autoSpeakEnabled ? 'ON' : 'OFF'}</span>
                </div>
                <div style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px' }}>
                  <span>🤖 {isTurkish ? 'Zeka:' : 'AI Provider:'} </span>
                  <span style={{ fontWeight: 'bold', color: 'var(--accent-cyan)' }}>Local Fallback</span>
                </div>
              </div>
            </div>

            {/* Continue Working & Quick Actions Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '20px' }}>
              {/* Continue Working panel */}
              <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <h3 style={{ margin: 0, fontSize: '0.88rem', fontWeight: 700 }}>💾 {isTurkish ? 'Çalışmaya Devam Et' : 'Continue Working'}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, justifyContent: 'center' }}>
                  <button onClick={() => setCurrentView('chat')} className="btn btn-secondary" style={{ width: '100%', fontSize: '0.78rem', padding: '8px 10px', justifyContent: 'flex-start' }}>
                    💬 {isTurkish ? 'Son Sohbete Dön' : 'Resume Last Chat'}
                  </button>
                  <button onClick={() => setCurrentView('todos')} className="btn btn-secondary" style={{ width: '100%', fontSize: '0.78rem', padding: '8px 10px', justifyContent: 'flex-start' }}>
                    📋 {isTurkish ? 'Görevleri Düzenle' : 'Open Tasks List'}
                  </button>
                </div>
              </div>

              {/* Quick Actions widget */}
              <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <h3 style={{ margin: 0, fontSize: '0.88rem', fontWeight: 700 }}>⚡ {isTurkish ? 'Hızlı Aksiyonlar' : 'Quick Actions'}</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <button onClick={() => setCurrentView('chat')} className="btn btn-primary" style={{ fontSize: '0.74rem', padding: '8px 4px' }}>+ {isTurkish ? 'Sohbet' : 'Chat'}</button>
                  <button onClick={() => setCurrentView('modulator')} className="btn btn-secondary" style={{ fontSize: '0.74rem', padding: '8px 4px' }}>🎙️ {isTurkish ? 'Ses Ayarı' : 'Voice FX'}</button>
                  <button onClick={() => setCurrentView('memory')} className="btn btn-secondary" style={{ fontSize: '0.74rem', padding: '8px 4px' }}>🧠 {isTurkish ? 'Hafıza' : 'Memory'}</button>
                  <button onClick={() => setCurrentView('settings')} className="btn btn-secondary" style={{ fontSize: '0.74rem', padding: '8px 4px' }}>⚙️ {isTurkish ? 'Ayarlar' : 'Settings'}</button>
                </div>
              </div>
            </div>

            {/* Smart Suggestions */}
            <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <h3 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700 }}>💡 {isTurkish ? 'Moni Önerileri' : 'Smart Suggestions'}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {[
                  isTurkish ? "Bellekte yeni kişiselleştirilmiş kayıtlar var, kontrol edin." : "New personalization records available. Click to review.",
                  isTurkish ? "Mikrofonu simüle ederek sesli komutla asistanı test edebilirsiniz." : "Try voice modulation settings to modify pitches."
                ].map((s, i) => (
                  <div key={i} style={{ fontSize: '0.74rem', color: 'var(--color-secondary)', background: 'rgba(255,255,255,0.01)', padding: '6px 10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.02)' }}>
                    💡 {s}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  };

  const renderMobileVoiceView = () => {
    const isTurkish = currentLanguage === 'tr';
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: '20px', minHeight: '80vh', textAlign: 'center' }}>
        <button
          onClick={() => setCurrentView('home')}
          className="btn btn-secondary"
          style={{ position: 'absolute', top: '16px', left: '16px', padding: '6px 12px', fontSize: '0.8rem' }}
        >
          ← Back
        </button>
        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--accent-cyan)' }}>
          {moniStatus === 'listening' ? (isTurkish ? 'Dinliyorum...' : 'Listening...') : (isTurkish ? 'Moni Asistan' : 'Moni Companion')}
        </div>
        <div style={{ width: '180px', height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '20px 0' }}>
          <MoniAvatar status={moniStatus} isSpeaking={currentlySpeakingMsgId !== null} mood={avatarMood} avatarType={avatarType} eyeColor={eyeColor} />
        </div>
        <div style={{ fontSize: '0.82rem', color: 'var(--color-secondary)', padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', width: '90%', minHeight: '60px' }}>
          {isRecording ? (isTurkish ? 'Ses alınıyor...' : 'Receiving stream...') : (isTurkish ? 'Konuşmak için asistan Orbuna dokunun veya alttaki simülasyona basın.' : 'Tap Orb to toggle active recording.')}
        </div>
        <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
          <button onClick={simulateMicListening} className="btn btn-primary" style={{ padding: '10px 24px' }}>
            {isTurkish ? 'Mikrofon Simüle Et' : 'Simulate Voice'}
          </button>
          <button onClick={() => voiceService.cancelAllSpeech()} className="btn btn-danger" style={{ padding: '10px 24px' }}>
            {isTurkish ? 'Sesi Durdur' : 'Stop Audio'}
          </button>
        </div>
      </div>
    );
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
    const categories = [
      { id: 'general', label: 'General / Genel', icon: '⚙️' },
      { id: 'intelligence', label: 'Companion / Zeka', icon: '🧠' },
      { id: 'voice', label: 'Voice & TTS / Ses', icon: '🗣️' },
      { id: 'appearance', label: 'Appearance / Tasarım', icon: '🎨' },
      { id: 'providers', label: 'AI Providers / Yapay Zeka', icon: '🤖' },
      { id: 'memory', label: 'Memory / Hafıza', icon: '🧠' },
      { id: 'developer', label: 'Developer Labs / Geliştirici', icon: '🧪' },
      { id: 'about', label: 'About MONI / Hakkında', icon: '🏆' }
    ];

    const isMatched = (text: string) => text.toLowerCase().includes(settingsSearch.toLowerCase());

    return (
      <div className="glass-panel" style={{ display: 'flex', flex: 1, minHeight: '520px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
        {/* Left Category Sidebar */}
        <div style={{ width: '220px', borderRight: '1px solid rgba(255,255,255,0.06)', padding: '16px 12px', background: 'rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <input
            type="text"
            value={settingsSearch}
            onChange={(e) => setSettingsSearch(e.target.value)}
            placeholder="Settings Search / Arayın..."
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.06)',
              background: 'rgba(0,0,0,0.2)',
              color: '#fff',
              fontSize: '0.8rem',
              outline: 'none',
              marginBottom: '12px'
            }}
          />
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveSettingsCategory(c.id as any)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 12px',
                borderRadius: '8px',
                border: 'none',
                background: activeSettingsCategory === c.id ? 'rgba(0, 240, 255, 0.08)' : 'transparent',
                color: activeSettingsCategory === c.id ? 'var(--accent-cyan)' : 'var(--color-primary)',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '0.82rem',
                fontWeight: activeSettingsCategory === c.id ? '600' : '400',
                transition: 'all 0.2s ease'
              }}
              className="hover-scale"
            >
              <span>{c.icon}</span>
              <span>{c.label}</span>
            </button>
          ))}
        </div>

        {/* Right Tab Content */}
        <div style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* GENERAL CATEGORY */}
          {activeSettingsCategory === 'general' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '8px' }}>⚙️ General Settings / Genel Ayarlar</h2>
              
              {isMatched("Moni Dashboard Style") && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '10px' }}>
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>Alternative Hub Mode / Alternatif Hub Paneli</div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--color-muted)' }}>Moni'nin ana ekranını detaylı bilgi merkezine dönüştürür.</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={isDashboard2Enabled}
                    onChange={(e) => {
                      setIsDashboard2Enabled(e.target.checked);
                      localStorage.setItem('moni_is_dashboard2_enabled', String(e.target.checked));
                    }}
                    style={{ width: '38px', height: '20px', cursor: 'pointer' }}
                  />
                </div>
              )}

              {isMatched("Auto Submit Voice Command") && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '10px' }}>
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>Auto Submit Voice Transcript / Otomatik Ses Gönderme</div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--color-muted)' }}>Ses kaydı bittikten sonra doğrudan komutu çalıştırır.</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoSubmitEnabled}
                    onChange={(e) => {
                      setAutoSubmitEnabled(e.target.checked);
                      localStorage.setItem('moni_auto_submit_enabled', String(e.target.checked));
                    }}
                    style={{ width: '38px', height: '20px', cursor: 'pointer' }}
                  />
                </div>
              )}
            </div>
          )}

          {/* INTELLIGENCE / COMPANION CATEGORY */}
          {activeSettingsCategory === 'intelligence' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '8px' }}>🧠 Intelligence & Companion Settings</h2>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '10px' }}>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>Proactive Suggestions / Proaktif Öneriler</div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--color-muted)' }}>Asistanın kendi inisiyatifiyle akıllı bildirim ve öneriler sunması.</div>
                </div>
                <input
                  type="checkbox"
                  checked={proactiveEnabled}
                  onChange={(e) => {
                    setProactiveEnabled(e.target.checked);
                    localStorage.setItem('moni_proactive_suggestions', String(e.target.checked));
                    MoniIntelligenceEngine.getInstance().logEvent('Proactive suggestions toggle: ' + e.target.checked, 'system');
                  }}
                  style={{ width: '38px', height: '20px', cursor: 'pointer' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '10px' }}>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>Suggestion Frequency / Öneri Sıklığı</div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--color-muted)' }}>Moni'nin tavsiyelerde bulunma sıklık düzeyi.</div>
                </div>
                <select
                  value={proactiveFrequency}
                  onChange={(e) => {
                    setProactiveFrequency(e.target.value);
                    localStorage.setItem('moni_suggestions_frequency', e.target.value);
                  }}
                  style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '6px 12px', borderRadius: '8px', outline: 'none' }}
                >
                  <option value="low">Low / Düşük</option>
                  <option value="normal">Normal</option>
                  <option value="high">High / Sık</option>
                </select>
              </div>
            </div>
          )}

          {/* VOICE & TTS CATEGORY */}
          {activeSettingsCategory === 'voice' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '8px' }}>🗣️ Voice & Speech Settings / Ses Ayarları</h2>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '10px' }}>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>Text-to-Speech Output / Sesli Geri Bildirim</div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--color-muted)' }}>Yapay zeka cevaplarının sesli okunmasını aktif eder.</div>
                </div>
                <input
                  type="checkbox"
                  checked={autoSpeakEnabled}
                  onChange={(e) => {
                    setAutoSpeakEnabled(e.target.checked);
                    localStorage.setItem('moni_auto_speak_enabled', String(e.target.checked));
                  }}
                  style={{ width: '38px', height: '20px', cursor: 'pointer' }}
                />
              </div>
            </div>
          )}

          {/* APPEARANCE CATEGORY */}
          {activeSettingsCategory === 'appearance' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '8px' }}>🎨 Appearance & Customization / Görünüm</h2>
            </div>
          )}

          {/* AI PROVIDERS CATEGORY */}
          {activeSettingsCategory === 'providers' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '8px' }}>🤖 AI Providers / Zeka Motorları</h2>
            </div>
          )}

          {/* MEMORY & DATA CATEGORY */}
          {activeSettingsCategory === 'memory' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '8px' }}>🧠 Memory & Storage / Depolama</h2>
            </div>
          )}

          {/* DEVELOPER LABS */}
          {activeSettingsCategory === 'developer' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '8px' }}>🧪 Developer Labs / Geliştirici Test Grubu</h2>
            </div>
          )}

          {/* ABOUT CATEGORY */}
          {activeSettingsCategory === 'about' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(255,255,255,0.01)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>MONI AI Operating System</h3>
              <div style={{ fontSize: '0.82rem', color: 'var(--color-secondary)' }}>Companion Edition • Version 3.5.0 Pro</div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderHelpView = () => {
    const documentation = [
      { q: "Moni nedir?", a: "Moni, tüm dosyalarınızı, randevularınızı, notlarınızı ve yapılacaklar listelerinizi entegre zeka motorları üzerinden yöneten bir Yapay Zeka Asistanı ve Kalem Yöneticisidir." }
    ];

    return (
      <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '24px', gap: '20px', border: '1px solid rgba(255,255,255,0.06)' }}>
        {documentation.map((item, idx) => (
          <div key={idx}>
            <h4>{item.q}</h4>
            <p>{item.a}</p>
          </div>
        ))}
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
    const categoryLabels: Record<string, string> = {
      identity: 'Kimlik Bilgisi',
      preference: 'Tercihler',
      health: 'Sağlık',
      sport: 'Spor & Egzersiz',
      work: 'İş & Projeler',
      relationship: 'İlişkiler',
      routine: 'Alışkanlık & Rutin',
      goal: 'Hedefler',
      location: 'Konumlar',
      custom: 'Diğer Notlar'
    };

    const categoryIcons: Record<string, string> = {
      identity: '👤',
      preference: '❤️',
      health: '🩺',
      sport: '🏃',
      work: '💼',
      relationship: '👥',
      routine: '🔁',
      goal: '🎯',
      location: '📍',
      custom: '📌'
    };

    const categoriesList: MemoryCategory[] = [
      'identity',
      'preference',
      'health',
      'sport',
      'work',
      'relationship',
      'routine',
      'goal',
      'location',
      'custom'
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

    const unreadNotifications = MoniIntelligenceEngine.getInstance().getNotifications().filter(n => !n.read);
  const engine = MoniIntelligenceEngine.getInstance();
  const allNotifications = engine.getNotifications();
  const isTurkish = currentLanguage === 'tr';

  return (
    <div onClick={handlePageClick} style={{ width: '100vw', height: '100vh', background: '#0B0F17', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
      {/* 1. Global Diagnostic Warnings & Banner Alerts */}
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
          zIndex: 99999,
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

      {/* 2. Startup Restore State dialog banner */}
      {showRestorePrompt && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 99999,
          width: '320px',
          background: 'rgba(17, 24, 39, 0.95)',
          border: '1px solid var(--accent-cyan)',
          borderRadius: '16px',
          padding: '16px',
          boxShadow: '0 10px 40px rgba(0, 240, 255, 0.2)',
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ fontSize: '0.84rem', fontWeight: 'bold' }}>
            {isTurkish ? 'Kaldığın yerden devam et?' : 'Continue where you left off?'}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--color-secondary)' }}>
            {isTurkish 
              ? 'Son çalışma alanını ve sohbet geçmişini otomatik olarak geri yükleyebiliriz.'
              : 'We can restore your last project, active tab, and companion settings.'}
          </div>
          <div style={{ display: 'flex', gap: '10px', alignSelf: 'flex-end' }}>
            <button onClick={() => setShowRestorePrompt(false)} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.72rem' }}>
              {isTurkish ? 'İptal' : 'No'}
            </button>
            <button
              onClick={() => {
                setShowRestorePrompt(false);
                engine.logEvent('Workspace state restored', 'system');
                alert(isTurkish ? 'Çalışma alanı başarıyla yüklendi.' : 'Workspace successfully restored.');
              }}
              className="btn btn-primary"
              style={{ padding: '6px 12px', fontSize: '0.72rem' }}
            >
              {isTurkish ? 'Yükle' : 'Restore'}
            </button>
          </div>
        </div>
      )}

      {/* 3. Main Mobile Experience / Bottom Navigation Layout */}
      {isMobile ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
          {/* Mobile Header */}
          <header style={{ height: '56px', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(17,24,39,0.85)', backdropFilter: 'blur(10px)' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>MONI</span>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <span className={"status-dot " + (isOffline ? 'offline' : 'online')} />
              <button onClick={() => {
                localStorage.setItem('moni_language', currentLanguage === 'tr' ? 'en' : 'tr');
                window.location.reload();
              }} style={{ border: 'none', background: 'transparent', color: '#cbd5e1', fontSize: '0.8rem', cursor: 'pointer' }}>
                {currentLanguage === 'tr' ? 'TR 🌐' : 'EN 🌐'}
              </button>
            </div>
          </header>

          {/* Mobile Main Content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px', boxSizing: 'border-box' }}>
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
            {currentView === 'help' && renderHelpView()}
            {currentView === 'voice' && renderMobileVoiceView()}
            {currentView === 'companion' && renderCompanionCenter()}
          </div>

          {/* Mobile Bottom Navigation Bar */}
          <nav style={{ height: '56px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', background: 'rgba(17,24,39,0.95)', backdropFilter: 'blur(10px)' }}>
            {[
              { id: 'home', label: 'Home', icon: '🏠' },
              { id: 'chat', label: 'Chat', icon: '💬' },
              { id: 'voice', label: 'Voice', icon: '🎙️' },
              { id: 'companion', label: 'AI', icon: '🧠' },
              { id: 'settings', label: 'Settings', icon: '⚙️' }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id as any)}
                style={{
                  flex: 1,
                  border: 'none',
                  background: 'transparent',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  color: currentView === item.id ? 'var(--accent-cyan)' : 'var(--color-secondary)',
                  cursor: 'pointer'
                }}
              >
                <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
                <span style={{ fontSize: '0.65rem' }}>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      ) : (
        /* 4. Desktop Premium Multi-Pane Workspace Layout */
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
          
          {/* Header (64px) */}
          <header style={{
            height: '64px',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            background: 'rgba(11, 15, 23, 0.8)',
            backdropFilter: 'blur(20px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 20px',
            boxSizing: 'border-box',
            zIndex: 10
          }}>
            {/* Left Header Logo & Title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))', display: 'flex', alignItems: 'center', justifyContent: 'center' }} />
              <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>MONI</span>
              <span style={{ fontSize: '0.65rem', background: 'rgba(255,255,255,0.08)', color: 'var(--color-secondary)', padding: '2px 8px', borderRadius: '20px', fontWeight: 600 }}>Companion</span>
            </div>

            {/* Center Header Command Search */}
            <div onClick={() => setShowCommandPalette(true)} style={{ width: '380px', height: '36px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', padding: '0 12px', cursor: 'pointer', color: 'var(--color-secondary)', fontSize: '0.8rem', gap: '8px' }} className="hover-scale">
              <span>🔍</span>
              <span>Search settings, contacts, files...</span>
              <span style={{ marginLeft: 'auto', background: 'rgba(255,255,255,0.08)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.68rem', color: 'var(--color-muted)' }}>Ctrl+K</span>
            </div>

            {/* Right Header User Avatar Profile & Quick Controls */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              {/* Notification dropdown bell icon */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowNotifMenu(!showNotifMenu)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.25rem', position: 'relative', display: 'flex', alignItems: 'center' }}
                >
                  <span>🔔</span>
                  {unreadNotifications.length > 0 && (
                    <span style={{
                      position: 'absolute',
                      top: '-4px',
                      right: '-4px',
                      background: 'var(--accent-red)',
                      color: '#fff',
                      fontSize: '0.6rem',
                      fontWeight: 'bold',
                      borderRadius: '50%',
                      width: '14px',
                      height: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {unreadNotifications.length}
                    </span>
                  )}
                </button>

                {showNotifMenu && (
                  <div className="glass-panel" style={{
                    position: 'absolute',
                    top: '36px',
                    right: 0,
                    width: '300px',
                    background: '#111827',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    zIndex: 99999,
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 'bold' }}>Notifications / Bildirimler</span>
                      <button
                        onClick={() => {
                          engine.markAllAsRead();
                          setShowNotifMenu(false);
                        }}
                        style={{ background: 'transparent', border: 'none', color: 'var(--accent-cyan)', cursor: 'pointer', fontSize: '0.68rem' }}
                      >
                        Mark Read / Okundu Yap
                      </button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '200px', overflowY: 'auto' }}>
                      {allNotifications.slice(-5).map(n => (
                        <div key={n.id} style={{ fontSize: '0.72rem', color: n.read ? 'var(--color-secondary)' : '#fff', padding: '4px', borderLeft: n.read ? 'none' : '3px solid var(--accent-cyan)' }}>
                          {isTurkish ? n.titleTr : n.titleEn}
                        </div>
                      ))}
                      {allNotifications.length === 0 && (
                        <div style={{ fontSize: '0.7,rem', color: 'var(--color-muted)', textAlign: 'center', padding: '10px 0' }}>No notification / Bildirim yok</div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  localStorage.setItem('moni_language', currentLanguage === 'tr' ? 'en' : 'tr');
                  window.location.reload();
                }}
                className="btn btn-secondary"
                style={{ padding: '6px 12px', fontSize: '0.78rem', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                {currentLanguage === 'tr' ? 'TR 🌐' : 'EN 🌐'}
              </button>
              <button
                onClick={() => {
                  setCurrentView('chat');
                  setMessages([]);
                  databaseService.clearChatHistory().then(async () => {
                    const loaded = await databaseService.getChatHistory();
                    setMessages(loaded);
                  });
                  addBridgeLog('Yeni sohbet başlatıldı.');
                }}
                className="btn btn-primary"
                style={{ padding: '6px 12px', fontSize: '0.78rem' }}
              >
                + New Chat
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.03)', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <span className={"status-dot " + (isOffline ? 'offline' : 'online')} />
                <span style={{ fontSize: '0.72rem', fontWeight: 600 }}>{isOffline ? 'Offline' : 'Online'}</span>
              </div>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: '1px solid var(--accent-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.8rem', fontWeight: 'bold' }}>
                {getDynamicUserName().substring(0, 1) || 'M'}
              </div>
            </div>
          </header>

          {/* Command Palette Modal Overlay */}
          {showCommandPalette && (
            <div onClick={() => setShowCommandPalette(false)} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.6)', zIndex: 99999, display: 'flex', justifyContent: 'center', paddingTop: '80px' }}>
              <div onClick={(e) => e.stopPropagation()} className="glass-panel" style={{ width: '450px', padding: '16px', background: '#111827', border: '1px solid var(--accent-cyan)' }}>
                <input
                  type="text"
                  value={commandSearch}
                  onChange={(e) => setCommandSearch(e.target.value)}
                  placeholder="Command Search / Komut Arayın..."
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: '#000', color: '#fff', outline: 'none' }}
                  autoFocus
                />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '12px' }}>
                  {[
                    { label: '🏠 Go to Home Dashboard', action: () => setCurrentView('home') },
                    { label: '🧠 Go to Companion Center', action: () => setCurrentView('companion') },
                    { label: '💬 Open AI Assistant Chat', action: () => setCurrentView('chat') },
                    { label: '📋 Open Task Checklist', action: () => setCurrentView('todos') },
                    { label: '🧠 Open Memory Center', action: () => setCurrentView('memory') },
                    { label: '⚙️ Open System Settings', action: () => setCurrentView('settings') },
                    { label: '❓ Open FAQ & Help', action: () => setCurrentView('help') }
                  ].filter(cmd => cmd.label.toLowerCase().includes(commandSearch.toLowerCase())).map((cmd, idx) => (
                    <button
                      key={idx}
                      onClick={() => { cmd.action(); setShowCommandPalette(false); }}
                      style={{ padding: '8px 12px', background: 'transparent', border: 'none', color: '#cbd5e1', textAlign: 'left', cursor: 'pointer', borderRadius: '6px' }}
                      className="hover-scale"
                    >
                      {cmd.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Core App Columns Grid */}
          <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
            
            {/* Left Sidebar (260px or Collapsed) */}
            <div style={{
              width: isSidebarCollapsed ? '64px' : '260px',
              borderRight: '1px solid rgba(255,255,255,0.05)',
              background: 'rgba(11, 15, 23, 0.4)',
              display: 'flex',
              flexDirection: 'column',
              padding: '16px 8px',
              boxSizing: 'border-box',
              transition: 'width 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              overflow: 'hidden'
            }}>
              {/* Collapsible toggle */}
              <button
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                style={{ border: 'none', background: 'transparent', color: 'var(--color-secondary)', cursor: 'pointer', alignSelf: isSidebarCollapsed ? 'center' : 'flex-end', marginBottom: '16px', fontSize: '1rem' }}
              >
                {isSidebarCollapsed ? '→' : '←'}
              </button>

              {/* Navigation list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                {[
                  { id: 'home', label: 'Dashboard / Anasayfa', icon: '🏠' },
                  { id: 'companion', label: 'AI Companion Center / Zeka', icon: '🧠' },
                  { id: 'chat', label: 'AI Chat Room / Sohbet', icon: '💬' },
                  { id: 'todos', label: 'Checklist / Görevler', icon: '📋' },
                  { id: 'notes', label: 'Notes Agenda / Not Defteri', icon: '📝' },
                  { id: 'calendar', label: 'Schedule Calendar / Takvim', icon: '📅' },
                  { id: 'memory', label: 'Memory Storage / Hafıza', icon: '🧠' },
                  { id: 'contacts', label: 'Contacts database / Rehber', icon: '👤' },
                  { id: 'agenda', label: 'Reminders list / Hatırlatıcı', icon: '⏰' },
                  { id: 'modulator', label: 'Voice FX Modulator / Ses', icon: '🎙️' },
                  { id: 'settings', label: 'System Settings / Ayarlar', icon: '⚙️' },
                  { id: 'help', label: 'FAQ Help Center / Yardım', icon: '❓' }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setCurrentView(item.id as any)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: 'none',
                      background: currentView === item.id ? 'rgba(255, 255, 255, 0.04)' : 'transparent',
                      color: currentView === item.id ? 'var(--accent-cyan)' : 'var(--color-primary)',
                      fontWeight: currentView === item.id ? '600' : '400',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: '0.82rem',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden'
                    }}
                    className="hover-scale"
                    title={item.label}
                  >
                    <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
                    {!isSidebarCollapsed && <span>{item.label}</span>}
                  </button>
                ))}
              </div>

              {/* Bottom sidebar footer card showing MONI Orb status info */}
              {!isSidebarCollapsed && (
                <div className="glass-panel" style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px', border: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.15)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', overflow: 'hidden' }}>
                      <MoniAvatar status={moniStatus} isSpeaking={currentlySpeakingMsgId !== null} mood={avatarMood} avatarType={avatarType} eyeColor={eyeColor} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.74rem', fontWeight: 'bold' }}>MONI Core</div>
                      <div style={{ fontSize: '0.64rem', color: 'var(--color-muted)' }}>Status: {moniStatus}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.64rem', color: 'var(--color-muted)', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '6px' }}>
                    Enterprise Edition • v3.5.0
                  </div>
                </div>
              )}
            </div>

            {/* Center Workspace */}
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              background: '#0B0F17',
              overflowY: 'auto',
              padding: '24px 16px',
              alignItems: 'center',
              boxSizing: 'border-box'
            }}>
              <div style={{ width: '100%', maxWidth: '900px', display: 'flex', flexDirection: 'column', flex: 1 }}>
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
                {currentView === 'help' && renderHelpView()}
                {currentView === 'voice' && renderMobileVoiceView()}
                {currentView === 'companion' && renderCompanionCenter()}
              </div>
            </div>

            {/* Right Utility Sidebar (280px) */}
            <div style={{
              width: '280px',
              borderLeft: '1px solid rgba(255,255,255,0.05)',
              background: 'rgba(11, 15, 23, 0.4)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}>
              {/* Tab Navigation header */}
              <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.1)' }}>
                {[
                  { id: 'today', label: 'Today', icon: '📅' },
                  { id: 'memory', label: 'Memory', icon: '🧠' },
                  { id: 'voice', label: 'Voice', icon: '🗣️' },
                  { id: 'suggestions', label: 'Suggest', icon: '💡' },
                  { id: 'tasks', label: 'Tasks', icon: '📋' },
                  { id: 'system', label: 'System', icon: '🔬' }
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setActiveRightTab(t.id as any)}
                    style={{
                      flex: 1,
                      padding: '10px 4px',
                      border: 'none',
                      background: activeRightTab === t.id ? 'rgba(255,255,255,0.04)' : 'transparent',
                      color: activeRightTab === t.id ? 'var(--accent-cyan)' : 'var(--color-secondary)',
                      fontSize: '0.62rem',
                      fontWeight: activeRightTab === t.id ? '700' : '400',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '2px',
                      borderBottom: activeRightTab === t.id ? '2px solid var(--accent-cyan)' : '2px solid transparent'
                    }}
                    title={t.label}
                  >
                    <span>{t.icon}</span>
                    <span>{t.label}</span>
                  </button>
                ))}
              </div>

              {/* Tab Content body */}
              <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {activeRightTab === 'today' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 'bold', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>📅 Today's Focus</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-secondary)' }}>
                      {getDynamicUserName() ? 'Hello ' + getDynamicUserName() + ', today is ' : 'Hello, today is '}
                      <strong>{new Date().toLocaleDateString(currentLanguage === 'tr' ? 'tr-TR' : 'en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</strong>.
                    </div>
                    {reminders.length > 0 && (
                      <div style={{ fontSize: '0.74rem', background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <strong>Upcoming:</strong> {reminders[0].title} ({new Date(reminders[0].dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                      </div>
                    )}
                  </div>
                )}

                {activeRightTab === 'memory' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 'bold', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>🧠 Memory Center</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-secondary)' }}>Moni has remembered <strong>{memories.length}</strong> items in total.</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px' }}>
                      {memories.slice(0, 6).map((m, idx) => (
                        <div key={idx} style={{ background: 'rgba(255,255,255,0.02)', padding: '8px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.04)', fontSize: '0.72rem' }}>
                          <span style={{ color: 'var(--accent-cyan)', fontWeight: 'bold' }}>[{m.category}]: </span>
                          <span>{m.content}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeRightTab === 'voice' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 'bold', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>🗣️ Voice Output</div>
                    <div style={{ fontSize: '0.74rem' }}>
                      <strong>Feedback mode:</strong> {autoSpeakEnabled ? 'Enabled / Sesli Okuma Aktif' : 'Disabled / Sessiz Mod'}
                    </div>
                    <div style={{ fontSize: '0.74rem' }}>
                      <strong>Active Speech Pitch:</strong> {Math.round(speechVolume * 100)}% volume, {speechRate}x rate.
                    </div>
                  </div>
                )}

                {activeRightTab === 'suggestions' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 'bold', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>💡 Smart Suggestions</div>
                    {[
                      currentLanguage === 'tr' ? "Sohbet odasında mimari tartışmasına devam et." : "Continue architectural discussion in chat.",
                      currentLanguage === 'tr' ? "Ses modülatörü efektlerini test et." : "Test voice modulator settings.",
                      currentLanguage === 'tr' ? "Bugün bitmesi gereken görevleri incele." : "Check tasks due today."
                    ].map((sug, idx) => (
                      <div key={idx} style={{ fontSize: '0.74rem', background: 'rgba(0, 240, 255, 0.02)', border: '1px solid rgba(0, 240, 255, 0.05)', padding: '8px 12px', borderRadius: '8px' }}>
                        💡 {sug}
                      </div>
                    ))}
                  </div>
                )}

                {activeRightTab === 'tasks' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 'bold', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>📋 Today's Checklist</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {todos.slice(0, 6).map((todo, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.74rem' }}>
                          <input type="checkbox" checked={todo.isCompleted} onChange={() => {}} style={{ cursor: 'pointer' }} />
                          <span style={{ textDecoration: todo.isCompleted ? 'line-through' : 'none', color: todo.isCompleted ? 'var(--color-muted)' : 'var(--color-primary)' }}>{todo.task}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeRightTab === 'system' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 'bold', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>🔬 System Status</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.74rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>SQLite database:</span>
                        <span style={{ color: 'var(--accent-green)' }}>✅ Connect</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Active provider:</span>
                        <span style={{ color: 'var(--accent-cyan)' }}>Local Fallback</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Visualizer state:</span>
                        <span style={{ color: 'var(--accent-purple)' }}>{moniStatus}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Thin Status Bar at footer */}
          <footer style={{
            height: '24px',
            borderTop: '1px solid rgba(255,255,255,0.05)',
            background: 'rgba(11, 15, 23, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 12px',
            fontSize: '0.68rem',
            color: 'var(--color-muted)',
            boxSizing: 'border-box'
          }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <span>🤖 Provider: Local Fallback</span>
              <span>🗣️ Voice Output: {autoSpeakEnabled ? 'ON' : 'OFF'}</span>
              <span>🧠 Database: Local SQLite</span>
            </div>
            <div>
              <span>MONI OS Companion • v3.5.0</span>
            </div>
          </footer>
        </div>
      )}

      {/* 5. Global Alarm / Reminder Overlays */}
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
          zIndex: 99999,
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
  );
};
