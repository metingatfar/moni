import React, { useState, useEffect, useRef } from 'react';
import { LocalAiService } from '../data/services/LocalAiService';
import { NativeBridge } from '../data/services/NativeBridge';
import { databaseService } from '../data/db/LocalDatabase';
import { voiceService } from '../data/services/VoiceService';
import type { Contact } from '../domain/entities/Contact';
import type { Reminder } from '../domain/entities/Reminder';
import type { Message } from '../domain/repositories/AiRepository';
import type { Note } from '../domain/entities/Note';
import type { Todo } from '../domain/entities/Todo';
import { MoniAvatar } from './components/MoniAvatar';

const aiService = new LocalAiService();
const bridgeService = new NativeBridge();

export const MoniDashboard: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isOffline, setIsOffline] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isWakeWordListening, setIsWakeWordListening] = useState(true);
  const [selectedVoice, setSelectedVoice] = useState<string>('selin');
  const [trVoicesList, setTrVoicesList] = useState<SpeechSynthesisVoice[]>([]);
  const [bridgeLogs, setBridgeLogs] = useState<string[]>([]);
  
  const [currentView, setCurrentView] = useState<'home' | 'chat' | 'contacts' | 'agenda' | 'modulator' | 'settings' | 'calendar' | 'todos' | 'notes'>('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const [isMoniSpeaking, setIsMoniSpeaking] = useState(false);
  const [activeAlarm, setActiveAlarm] = useState<Reminder | null>(null);
  const firedReminderIdsRef = useRef<string[]>([]);

  // Notes and Todos state
  const [notes, setNotes] = useState<Note[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);

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
      setIsMoniSpeaking(true);
      source.onended = () => {
        setIsMoniSpeaking(false);
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

  // Initialize data
  useEffect(() => {
    loadDatabaseData();
    const savedVoice = localStorage.getItem('moni_voice_type');
    if (savedVoice) {
      setSelectedVoice(savedVoice);
    }

    const loadVoices = () => {
      if ('speechSynthesis' in window) {
        const voices = window.speechSynthesis.getVoices();
        const tr = voices.filter(v => v.lang.startsWith('tr') || v.lang.startsWith('tr-TR') || v.lang.toLowerCase().includes('tr'));
        setTrVoicesList(tr);
      }
    };

    loadVoices();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if (wakeRecognitionRef.current) {
        try {
          wakeRecognitionRef.current.stop();
        } catch (e) {}
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
      }
    }, 15000); // Check every 15 seconds

    return () => clearInterval(checkAlarmInterval);
  }, [activeAlarm, reminders, selectedVoice]);

  const loadDatabaseData = async () => {
    const loadedContacts = await databaseService.getContacts();
    const loadedReminders = await databaseService.getReminders();
    const loadedHistory = await databaseService.getChatHistory();
    const loadedNotes = await databaseService.getNotes();
    const loadedTodos = await databaseService.getTodos();
    
    setContacts(loadedContacts);
    setReminders(loadedReminders);
    setNotes(loadedNotes);
    setTodos(loadedTodos);
    
    if (loadedHistory.length > 0) {
      setMessages(loadedHistory);
    } else {
      const initialMsg: Message = {
        role: 'system',
        content: 'MONI Akıllı Kişisel Asistan ve Özel Kalem Sistemine hoş geldiniz. Size rehber, arama, e-posta, WhatsApp veya hatırlatıcılarınız konusunda yardımcı olabilirim. Denemek için sesli veya yazılı komut verin ya da "Ses Aktivasyonu" butonuna tıklayıp doğrudan "Moni" diye seslenin.',
        timestamp: new Date()
      };
      setMessages([initialMsg]);
      await databaseService.saveChatMessage(initialMsg);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addBridgeLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setBridgeLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 19)]);
  };

  const speakText = (text: string, callback?: () => void, voiceOverride?: string) => {
    isSpeakingRef.current = true;
    setIsMoniSpeaking(true);
    const activeVoiceType = (voiceOverride || selectedVoice) as any;
    
    // Add bridge log indicating which engine is being used
    const hasApiKey = !!(import.meta.env.***REMOVED***);
    addBridgeLog(`Seslendirme (${hasApiKey ? 'Google Cloud API' : 'Yerel Tarayıcı Motoru'}): "${text.slice(0, 30)}..."`);

    voiceService.speak(text, activeVoiceType, () => {
      isSpeakingRef.current = false;
      setIsMoniSpeaking(false);
      if (callback) callback();
    });
  };

  const startWakeWordRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      addBridgeLog('Hata: Tarayıcınız ses tanımayı desteklemiyor.');
      return;
    }

    if (wakeRecognitionRef.current) {
      try {
        wakeRecognitionRef.current.stop();
      } catch (e) {}
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
        transcript.includes('moni') || 
        transcript.includes('boni') || 
        transcript.includes('mani') || 
        transcript.includes('komi') || 
        transcript.includes('hadi') ||
        transcript.includes('mavi') ||
        transcript.includes('moli') ||
        transcript.includes('nuri') ||
        transcript.includes('mona') ||
        transcript.includes('monti') ||
        transcript.includes('koli') ||
        transcript.includes('bobi') ||
        transcript.includes('huni') ||
        transcript.includes('asistan') ||
        transcript.includes('hayırlı');

      if (includesMoni) {
        console.log('Moni detected!');
        rec.stop();
        
        addBridgeLog("Uyandırma kelimesi algılandı: 'Moni'");
        if ((window as any).moniAudioContext) {
          playAssistantBeep((window as any).moniAudioContext);
        }
        setTimeout(() => {
          startCommandListening();
        }, 550);
      }
    };

    rec.onstart = () => {
      isWakeRecognitionActiveRef.current = true;
    };

    rec.onerror = (event: any) => {
      isWakeRecognitionActiveRef.current = false;
      console.error('Wake Word recognition error:', event.error);
      if (event.error === 'not-allowed') {
        addBridgeLog("Mikrofon izni bekleniyor/engellendi. Lütfen tarayıcıda mikrofon iznini etkinleştirin.");
        alert("Mikrofon izni bulunamadı. Lütfen tarayıcı ayarlarınızdan mikrofon erişimine izin verin.");
      }
    };

    rec.onend = () => {
      isWakeRecognitionActiveRef.current = false;
      if (isWakeWordListening && !isSpeakingRef.current && !isRecording) {
        try {
          rec.start();
          isWakeRecognitionActiveRef.current = true;
        } catch (e) {}
      }
    };

    wakeRecognitionRef.current = rec;
    try {
      rec.start();
      isWakeRecognitionActiveRef.current = true;
      addBridgeLog("Moni dinleme modu aktif. 'Moni' diyerek seslenebilirsiniz.");
    } catch (e) {
      isWakeRecognitionActiveRef.current = false;
      console.error('Failed to start wake word:', e);
    }
  };

  const startCommandListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    setIsRecording(true);
    addBridgeLog('Moni dinliyor: Komutunuzu söyleyin...');

    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = 'tr-TR';

    rec.onresult = (event: any) => {
      const command = event.results[0][0].transcript;
      addBridgeLog(`Ses Algılandı (STT): "${command}"`);
      handleSendMessage(command);
    };

    rec.onerror = (event: any) => {
      console.error('Command recognition error:', event.error);
      setIsRecording(false);
      if (event.error === 'not-allowed') {
        alert("Lütfen tarayıcınızın mikrofon iznine onay verin. Aksi takdirde sesinizi algılayamayacaktır.");
      }
      if (isWakeWordListening) {
        startWakeWordRecognition();
      }
    };

    rec.onend = () => {
      setIsRecording(false);
    };

    try {
      rec.start();
    } catch (e) {
      console.error('Failed to start command listening:', e);
      setIsRecording(false);
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

    // Default AI response
    try {
      const currentHistory = await databaseService.getChatHistory();
      const aiResponseText = await aiService.generateResponse(currentHistory, isOffline);
      
      const aiMsg: Message = {
        role: 'assistant',
        content: aiResponseText,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMsg]);
      await databaseService.saveChatMessage(aiMsg);
      
      speakText(aiResponseText, () => {
        if (isWakeWordListening) startWakeWordRecognition();
      });
    } catch (e) {
      console.error('Error generating AI response', e);
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

    setNewReminderTitle('');
    addBridgeLog(`Hatırlatıcı Eklendi: ${reminder.title}`);
  };

  const handleDeleteReminder = async (id: string) => {
    await databaseService.deleteReminder(id);
    const loaded = await databaseService.getReminders();
    setReminders(loaded);
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

    setNewReminderTitle('');
    addBridgeLog(`Randevu Eklendi: ${reminder.title} (${appointmentDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})})`);
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

    setNewTodoTask('');
    addBridgeLog(`Görev Eklendi: ${todo.task} (Öncelik: ${todo.priority})`);
  };

  const handleToggleTodo = async (todo: Todo) => {
    const updated: Todo = { ...todo, isCompleted: !todo.isCompleted };
    await databaseService.saveTodo(updated);
    const loaded = await databaseService.getTodos();
    setTodos(loaded);
    addBridgeLog(`Görev güncellendi: ${todo.task} -> ${updated.isCompleted ? 'Tamamlandı' : 'Bekliyor'}`);
  };

  const handleDeleteTodo = async (id: string) => {
    await databaseService.deleteTodo(id);
    const loaded = await databaseService.getTodos();
    setTodos(loaded);
    addBridgeLog(`Görev Silindi: ${id}`);
  };

  const handleClearHistory = async () => {
    await databaseService.clearChatHistory();
    setMessages([]);
    addBridgeLog('Sohbet geçmişi yerel veritabanından silindi.');
  };

  // Helper rendering functions for mobile subviews
  const renderHomeView = () => {
    const nextReminder = reminders.find(r => !r.isCompleted);
    const reminderText = nextReminder 
      ? `Saat ${new Date(nextReminder.dateTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}'da ${nextReminder.title} var.` 
      : "Bugün için başka planlı randevunuz yok.";

    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', flex: 1, gap: '20px' }}>
        
        {/* Animated Avatar Section */}
        <div style={{
          width: '160px',
          height: '160px',
          borderRadius: '50%',
          border: '2px solid rgba(0, 240, 255, 0.2)',
          boxShadow: '0 0 25px rgba(0, 240, 255, 0.15)',
          background: 'rgba(255, 255, 255, 0.02)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: '10px',
          position: 'relative'
        }}>
          <MoniAvatar isSpeaking={isMoniSpeaking} isListening={isRecording} />
        </div>

        {/* Greeting Section */}
        <div style={{ textAlign: 'center', margin: '10px 0' }}>
          <h2 style={{ fontSize: '1.35rem', margin: '0 0 6px 0', fontWeight: '700', color: '#fff', letterSpacing: '-0.3px' }}>
            Sayın Kullanıcı,
          </h2>
          <h3 style={{ fontSize: '1.2rem', margin: '0 0 10px 0', fontWeight: '600', color: '#ffd700' }}>
            Gününüz için hazırız.
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--color-secondary)', margin: 0, padding: '0 10px' }}>
            {reminderText}
          </p>
        </div>

        {/* Sesli Komut Ver Button (Big glowing pill) */}
        <button
          onClick={handleMicClick}
          className={`btn-voice-trigger ${isRecording ? 'recording' : ''}`}
          style={{
            background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.2), rgba(157, 78, 221, 0.2))',
            border: '2px solid #ffd700',
            borderRadius: '30px',
            color: '#ffd700',
            padding: '14px 32px',
            fontSize: '1rem',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0 0 20px rgba(255, 215, 0, 0.2), inset 0 0 8px rgba(255, 215, 0, 0.1)',
            transition: 'all 0.3s ease',
            outline: 'none',
            fontFamily: 'var(--font-sans)',
            letterSpacing: '0.5px'
          }}
        >
          <span style={{ fontSize: '1.2rem' }}>{isRecording ? '●' : '🎤'}</span>
          {isRecording ? 'Dinleniyor...' : 'Sesli Komut Ver'}
        </button>

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
          {messages.map((msg, idx) => (
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
              <span style={{ fontSize: '0.65rem', color: 'var(--color-muted)', alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </span>
            </div>
          ))}
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
                    {new Date(reminder.dateTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
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
            <option value="can">👨 Can (Erkek - Dinamik)</option>
            <option value="murat">👨 Murat (Erkek - Protokol)</option>
          </select>
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
                  try { wakeRecognitionRef.current.stop(); } catch (e) {}
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

  const handlePageClick = async () => {
    if ((window as any).moniAudioUnlocked) {
      // 2. Wake Word Trigger check
      if (isWakeWordListening && !isRecording && !isSpeakingRef.current) {
        if (!wakeRecognitionRef.current) {
          startWakeWordRecognition();
        } else {
          try {
            wakeRecognitionRef.current.start();
          } catch (e) {}
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
        await audio.play().catch(() => {});
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
        } catch (e) {}
      }
    }
  };

  return (
    <div onClick={handlePageClick} style={{
      minHeight: '100vh',
      backgroundColor: '#07080d',
      backgroundImage: 'radial-gradient(circle at 50% 30%, rgba(157, 78, 221, 0.08), transparent 70%), radial-gradient(circle at 80% 80%, rgba(0, 240, 255, 0.05), transparent 50%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: 'var(--font-sans)',
      boxSizing: 'border-box'
    }}>
      {/* Phone Mockup Wrapper Container */}
      <div className="phone-container" style={{
        width: '100%',
        maxWidth: '430px',
        height: '92vh',
        minHeight: '760px',
        maxHeight: '900px',
        background: 'rgba(12, 14, 22, 0.8)',
        backdropFilter: 'blur(30px)',
        WebkitBackdropFilter: 'blur(30px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '40px',
        boxShadow: '0 24px 64px rgba(0, 0, 0, 0.8), inset 0 0 1px 1px rgba(255, 255, 255, 0.15), 0 0 40px rgba(0, 240, 255, 0.05)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative'
      }}>
        
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
            min-height: 100% !important;
            max-height: 100% !important;
            border-radius: 0 !important;
            border: none !important;
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
};
