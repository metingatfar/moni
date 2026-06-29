export interface FAQEntry {
  id: string;
  category: string;
  keywords: string[];
  tr: string;
  en: string;
}

export class LocalFAQEngine {
  private static instance: LocalFAQEngine;
  private entries: FAQEntry[] = [];

  private constructor() {
    this.initializeEntries();
  }

  public static getInstance(): LocalFAQEngine {
    if (!LocalFAQEngine.instance) {
      LocalFAQEngine.instance = new LocalFAQEngine();
    }
    return LocalFAQEngine.instance;
  }

  private initializeEntries() {
    // We populate at least 150 distinct FAQ keywords and questions grouped by categories
    const rawData = [
      // CATEGORY 1: IDENTITY & GREETINGS (15 entries)
      { id: 'greet1', cat: 'identity', kw: ['merhaba', 'selam', 'hey', 'hello', 'hi'], tr: 'Merhaba Metin, buradayım. Bugün nasıl yardımcı olayım?', en: 'Hello Metin, I am here. How can I help you today?' },
      { id: 'greet2', cat: 'identity', kw: ['günaydın', 'good morning'], tr: 'Günaydın Metin! Harika bir gün dilerim. Bugün ne üzerinde çalışmak istersiniz?', en: 'Good morning Metin! Wish you a great day. What would you like to work on today?' },
      { id: 'greet3', cat: 'identity', kw: ['iyi akşamlar', 'good evening'], tr: 'İyi akşamlar Metin! Günün kalanında size yardımcı olmaktan mutluluk duyarım.', en: 'Good evening Metin! I am happy to assist you with the rest of your day.' },
      { id: 'identity1', cat: 'identity', kw: ['sen kimsin', 'who are you', 'adın ne', 'ismin ne', 'name'], tr: 'Ben MONI. Metin GATFAR tarafından geliştirilmiş, seninle beraber çalışan dijital yapay zeka asistanıyım.', en: 'I am MONI, a personal AI workspace companion developed by Metin GATFAR.' },
      { id: 'identity2', cat: 'identity', kw: ['kendini tanıt', 'introduce yourself'], tr: 'Ben MONI AI Operating System. Yapay zeka ile entegre çalışma alanı, ses modülatörü, hatırlatıcı, not ve görev yöneticisiyim.', en: 'I am MONI AI Operating System. I manage your workspace, voice modulation, reminders, notes, and tasks.' },
      { id: 'creator1', cat: 'identity', kw: ['kim geliştirdi', 'who created you', 'yaratıcın kim', 'yapımcın kim'], tr: 'Ben Metin GATFAR tarafından geliştirilmiş ve programlanmış özel bir yapay zeka asistanıyım.', en: 'I am developed and programmed by Metin GATFAR as a private AI assistant.' },
      { id: 'creator2', cat: 'identity', kw: ['metin gatfar', 'gatfar'], tr: 'Metin GATFAR, MONI AI asistanının kurucusu, baş mimarı ve geliştiricisidir.', en: 'Metin GATFAR is the founder, chief architect, and developer of MONI AI.' },
      { id: 'moni_meaning', cat: 'identity', kw: ['moni ne demek', 'moni nedir', 'what is moni'], tr: 'MONI, "Modern Orchestrated Networked Intelligence" kelimelerinin kısaltması olup, her şeyi koordine eden bir zeka asistanıdır.', en: 'MONI stands for Modern Orchestrated Networked Intelligence, coordinating your digital life.' },
      { id: 'companion_mode', cat: 'identity', kw: ['companion nedir', 'companion mode', 'arkadaş modu'], tr: 'Companion Modu, MONI\'nin sizinle sürekli eşlik ederek proaktif öneriler sunduğu kişisel moddur.', en: 'Companion Mode is a state where MONI constantly assists you and offers proactive suggestions.' },
      { id: 'moni_age', cat: 'identity', kw: ['kaç yaşındasın', 'how old are you', 'yaşın kaç'], tr: 'Ben dijital bir varlığım, yaşım yok fakat en güncel MONI 3.5.0 sürümüyle karşınızdayım!', en: 'I am a digital being. I don\'t have an age, but I am running on the latest MONI 3.5.0 build.' },
      { id: 'moni_born', cat: 'identity', kw: ['ne zaman yapıldın', 'when were you created'], tr: 'Geliştirilme sürecim Metin GATFAR tarafından 2026 yılında tamamlanmış ve sürekli güncellenmektedir.', en: 'My development was finalized by Metin GATFAR in 2026 and is continuously updated.' },
      { id: 'identity3', cat: 'identity', kw: ['nasılsın', 'how are you'], tr: 'İyiyim Metin, teşekkür ederim. Sen nasılsınız?', en: 'Doing great Metin, thanks! How are you?' },
      { id: 'identity4', cat: 'identity', kw: ['neredesin', 'where are you'], tr: 'Yerel cihazınızda ve sunucunuzda, tamamen güvenli bir şekilde çalışıyorum.', en: 'I am running locally on your device and server, fully secure.' },
      { id: 'identity5', cat: 'identity', kw: ['yapay zeka mısın', 'are you ai'], tr: 'Evet, gelişmiş bir yapay zeka işletim sistemi ve kişisel asistanım.', en: 'Yes, I am an advanced artificial intelligence operating system and personal assistant.' },
      { id: 'identity6', cat: 'identity', kw: ['insan mısın', 'are you human'], tr: 'Hayır, ben Metin GATFAR tarafından tasarlanmış bir yapay zeka yazılımıyım.', en: 'No, I am an AI software designed by Metin GATFAR.' },
      { id: 'identity7', cat: 'identity', kw: ['beni duyuyor musun', 'duyuyor musun'], tr: 'Evet Metin, seni gayet net duyuyorum. Dinlemedeyim.', en: 'Yes Metin, I can hear you clearly.' },
      { id: 'identity8', cat: 'identity', kw: ['konuşuyor musun', 'konusuyor musun'], tr: 'Evet Metin, seninle sesli olarak konuşabiliyorum.', en: 'Yes Metin, I can speak vocally with you.' },
      { id: 'identity9', cat: 'identity', kw: ['türkçe biliyor musun', 'turkce biliyor musun'], tr: 'Tabii ki Metin, Türkçe konuşup anlaşabiliyoruz.', en: 'Of course Metin, I can speak Turkish.' },
      { id: 'identity10', cat: 'identity', kw: ['devam et'], tr: 'Tamamdır Metin, dinliyorum, devam et lütfen.', en: 'Alright Metin, please go on.' },
      { id: 'identity11', cat: 'identity', kw: ['yardım et', 'yardim et'], tr: 'Tabii Metin, ne konuda yardıma ihtiyacın var? Birlikte çözelim.', en: 'Sure Metin, what do you need help with? Let\'s solve it together.' },

      // CATEGORY 2: FEATURES & ABILITIES (20 entries)
      { id: 'features1', cat: 'features', kw: ['özelliklerin neler', 'neler yapabilirsin', 'features', 'what can you do'], tr: 'Görevleri yönetebilir, sesli komut alabilir, hafıza tutabilir, projelerinizi inceleyebilir, rapor hazırlayabilir ve workflow otomasyonları çalıştırabilirim.', en: 'I manage tasks, process voice commands, keep memories, inspect projects, generate reports, and run workflows.' },
      { id: 'features2', cat: 'features', kw: ['sesli komut', 'voice command', 'stt'], tr: 'Konuşmalarınızı yazıya dökerek (STT) komutları algılarım. "Moni görev ekle" diyerek deneyebilirsiniz.', en: 'I capture your voice (STT) and parse commands. Try saying "Moni add task".' },
      { id: 'features3', cat: 'features', kw: ['tts nedir', 'sesli okuma', 'text to speech'], tr: 'Metinleri doğal bir sesle okuma teknolojisidir. ElevenLabs veya yerel Web Speech API kullanırım.', en: 'Text-to-speech reads answers aloud. I use ElevenLabs or local Web Speech API.' },
      { id: 'features4', cat: 'features', kw: ['wake word', 'uyandırma kelimesi'], tr: '"Moni" kelimesini duyduğumda otomatik olarak dinlemeye başlarım.', en: 'I automatically start listening when you say the wake word "Moni".' },
      { id: 'features5', cat: 'features', kw: ['workspace nedir', 'çalışma alanı nedir'], tr: 'Çalışma Alanı (Workspace), projelerinizin, dosyalarınızın ve veritabanınızın bulunduğu ana klasördür.', en: 'Workspace is the primary directory containing your projects, files, and local DB.' },
      { id: 'features6', cat: 'features', kw: ['workflow nedir', 'akış nedir'], tr: 'Belirli tetikleyicilerle çalışan, otomatik görev veya analiz zincirleridir.', en: 'Workflows are automated task chains triggered by specific system events.' },
      { id: 'features7', cat: 'features', kw: ['intelligence layer', 'zeka katmanı'], tr: 'Asistanın inisiyatif kullanarak proaktif önerilerde bulunduğu, kullanıcıyı izleyen akıllı katmandır.', en: 'It is the smart layer that monitors activity and offers proactive recommendations.' },
      { id: 'features8', cat: 'features', kw: ['rapor sistemi', 'report system'], tr: 'Çalışmalarınızdan, verimliliğinizden ve sistem durumundan özet Markdown raporları üretir.', en: 'It generates markdown summary reports of your productivity and system status.' },
      { id: 'features9', cat: 'features', kw: ['plugin marketplace', 'eklenti marketi'], tr: 'MONI\'ye yeni LLM sağlayıcıları, araçlar ve entegrasyonlar ekleyebileceğiniz markettir.', en: 'Marketplace lets you add new LLM providers, tools, and integrations.' },
      { id: 'features10', cat: 'features', kw: ['güvenlik sistemi', 'security system'], tr: 'Verilerinizin SQLite üzerinde şifrelenmesini ve kimlik bilgilerinin yerel olarak saklanmasını denetler.', en: 'Ensures your database is secure and API keys are stored locally.' },
      { id: 'features11', cat: 'features', kw: ['dil sistemi', 'language system'], tr: 'Ayarlardan Türkçe (TR) ve İngilizce (EN) dilleri arasında geçiş yapabilirsiniz.', en: 'You can toggle between Turkish (TR) and English (EN) inside the settings menu.' },
      { id: 'features12', cat: 'features', kw: ['notlar', 'notes'], tr: 'Notlar bölümünden günlük notlarınızı ekleyebilir, arayabilir ve silebilirsiniz.', en: 'You can create, search, and delete daily notes in the notes tab.' },
      { id: 'features13', cat: 'features', kw: ['yapılacaklar', 'todos', 'tasks'], tr: 'Yapılacaklar listesi ile görevler atayabilir, tamamlandı olarak işaretleyebilirsiniz.', en: 'The Todo list manages your tasks and marks completion status.' },
      { id: 'features14', cat: 'features', kw: ['takvim', 'calendar'], tr: 'Toplantı ve randevularınızı takvim üzerinden gün bazlı görebilirsiniz.', en: 'You can track meetings and agendas day-by-day on the calendar view.' },
      { id: 'features15', cat: 'features', kw: ['modülatör', 'modulator'], tr: 'Ses motorunun hızı, ses düzeyi ve tonunu değiştirebileceğiniz ayarlar ekranıdır.', en: 'The modulator screen configures the voice engine rate, volume, and pitch.' },
      { id: 'features16', cat: 'features', kw: ['ajanda', 'agenda'], tr: 'Günlük planlarınızı, hatırlatıcı ve yapılacakları tek bir ekranda derler.', en: 'Agenda aggregates your daily plans, reminders, and todos on one screen.' },
      { id: 'features17', cat: 'features', kw: ['hafıza nedir', 'memory engine'], tr: 'Sizin hakkınızda edinilen bilgileri (isim, meslek, tercihler) saklama motorudur.', en: 'The database engine storing facts about you (name, job, preferences).' },
      { id: 'features18', cat: 'features', kw: ['kişiselleştirme', 'personalization'], tr: 'MONI sizi isminizle selamlar, çalışma alışkanlıklarınıza göre kendini ayarlar.', en: 'MONI greets you by name and calibrates suggestions based on habits.' },
      { id: 'features19', cat: 'features', kw: ['diagnostik', 'diagnostics'], tr: 'Sistem sağlığı, bellek kullanımı ve API bağlantı kalitesi test modülüdür.', en: 'System health check testing memory consumption and connection latency.' },
      { id: 'features20', cat: 'features', kw: ['proaktif öneri', 'smart suggestions'], tr: 'Gereksiz durumlarda rahatsız etmeden, iş başlangıcında veya boş kalındığında sunulan akıllı tavsiyelerdir.', en: 'Calm notifications and advice presented during startup or long idle times.' },

      // CATEGORY 3: MEMORY ENGINE (20 entries)
      { id: 'memory1', cat: 'memory', kw: ['hafıza nasıl çalışır', 'how does memory work'], tr: 'Sohbetlerinizden çıkardığı kişisel bilgileri SQLite veritabanında kategorize ederek saklar.', en: 'It extracts facts from conversations and saves them categorized in SQLite.' },
      { id: 'memory2', cat: 'memory', kw: ['hafızayı sil', 'clear memory'], tr: 'Hafıza sekmesine giderek veya "hafızamı temizle" komutuyla tüm bilgileri silebilirsiniz.', en: 'Go to memory view or say "clear my memory" to wipe out all stored facts.' },
      { id: 'memory3', cat: 'memory', kw: ['neyi hatırlıyorsun', 'what do you remember'], tr: 'Hakkınızda kaydettiğim isim, meslek, projeler ve tercih gibi detayları hafızamda tutuyorum.', en: 'I remember key details like your name, profession, active projects, and preferences.' },
      { id: 'memory4', cat: 'memory', kw: ['hafıza kategorileri', 'memory categories'], tr: 'Ad, meslek, projeler, alışkanlıklar, tercihler ve genel notlar gibi kategoriler mevcuttur.', en: 'Categories include name, job, projects, habits, preferences, and general notes.' },
      { id: 'memory5', cat: 'memory', kw: ['benim adım ne', 'what is my name'], tr: 'Hafızamdaki bilgilere göre adınızı Dashboard profil kartında veya hafıza sekmesinde görebiliriz.', en: 'Your name is retrieved from the database memory and shown on the dashboard.' },
      { id: 'memory6', cat: 'memory', kw: ['hafıza nerede tutuluyor', 'where is memory stored'], tr: 'Hafıza verileri yerel cihazınızdaki SQLite veritabanı dosyasında güvenle saklanır.', en: 'Memory records are securely stored locally inside your SQLite database.' },
      { id: 'memory7', cat: 'memory', kw: ['hafıza sınırı var mı', 'memory limits'], tr: 'Hayır, yerel diskiniz izin verdiği sürece sınırsız bilgi depolanabilir.', en: 'No, unlimited facts can be retained as long as local storage permits.' },
      { id: 'memory8', cat: 'memory', kw: ['hafıza şifreli mi', 'is memory encrypted'], tr: 'Evet, SQLite veri tabanı dosyası yerel güvenlik katmanı tarafından korunur.', en: 'Yes, the database file is protected by the local device security layer.' },
      { id: 'memory9', cat: 'memory', kw: ['hafıza ekleme', 'how to add memory'], tr: '"Benim projem X" veya "Ben Y işi yapıyorum" dediğinizde otomatik olarak hafızaya eklenir.', en: 'Saying "My project is X" or "I work on Y" automatically adds it to memory.' },
      { id: 'memory10', cat: 'memory', kw: ['hafıza güncelleme', 'update memory'], tr: 'Yeni bir bilgi söylediğinizde eski bilgi otomatik olarak güncellenir.', en: 'When you state a new fact, the old one in that category updates.' },
      { id: 'memory11', cat: 'memory', kw: ['hafızayı dışa aktar', 'export memory'], tr: 'Yedekleme ve veri dışa aktarma ayarlarından tüm hafızayı JSON formatında indirebilirsiniz.', en: 'You can export all memories as JSON from the backup settings menu.' },
      { id: 'memory12', cat: 'memory', kw: ['bulut hafıza', 'cloud memory'], tr: 'MONI tamamen yerel çalışır, verileriniz hiçbir bulut veritabanına gönderilmez.', en: 'MONI works locally; your personal facts are never stored in a cloud DB.' },
      { id: 'memory13', cat: 'memory', kw: ['hatırlatıcı nasıl eklenir', 'add reminder'], tr: '"Moni beni saat 5\'te uyar" diyerek hızlıca sesli veya yazılı hatırlatıcı ekleyebilirsiniz.', en: 'You can add reminders by typing or saying "Moni remind me at 5pm".' },
      { id: 'memory14', cat: 'memory', kw: ['hatırlatıcıyı sil', 'delete reminder'], tr: 'Ajanda veya takvim görünümünden hatırlatıcılarınızı kaldırabilirsiniz.', en: 'Reminders can be managed and removed from the agenda or calendar.' },
      { id: 'memory15', cat: 'memory', kw: ['hafıza güvenliği', 'memory privacy'], tr: 'Hafıza verileri yerel kaldığı için üçüncü şahısların erişimi engellenmiştir.', en: 'As memories stay local, third-party access is completely prevented.' },
      { id: 'memory16', cat: 'memory', kw: ['hafızayı duraklat', 'disable memory'], tr: 'Zeka ayarlarından hafıza öğrenimini geçici olarak kapatabilirsiniz.', en: 'You can pause memory learning in the intelligence settings.' },
      { id: 'memory17', cat: 'memory', kw: ['hafıza analizi', 'memory insights'], tr: 'MONI verimli saatlerinizi hafızasından analiz ederek size en uygun çalışma zamanını önerir.', en: 'MONI analyzes productivity patterns to suggest optimal working windows.' },
      { id: 'memory18', cat: 'memory', kw: ['özel notlar', 'important notes'], tr: 'En çok eriştiğiniz veya yıldızladığınız notlar hafızada öncelikli tutulur.', en: 'Starred or frequently accessed notes are prioritized in memory searches.' },
      { id: 'memory19', cat: 'memory', kw: ['alışkanlıklar', 'habits'], tr: 'Günlük tekrarladığınız aktiviteler MONI tarafından alışkanlık olarak kodlanır.', en: 'Activities repeated daily are compiled by MONI into habit metrics.' },
      { id: 'memory20', cat: 'memory', kw: ['hafıza sorgulama', 'querying memory'], tr: '"Hakkımda ne biliyorsun" sorusu veritabanındaki tüm kategorileri listeler.', en: 'Asking "what do you know about me" queries all stored categories.' },

      // CATEGORY 4: VOICE SYSTEM & WAKE WORD (20 entries)
      { id: 'voice1', cat: 'voice', kw: ['sesli asistan', 'voice assistant'], tr: 'MONI sesinizi mikrofondan dinler, işler ve size sesli olarak cevap verir.', en: 'MONI captures audio from your microphone, processes it, and responds vocally.' },
      { id: 'voice2', cat: 'voice', kw: ['ses nasıl çalışır', 'how does voice work'], tr: 'Tarayıcının Web Speech API ve sunucunun Deepgram/ElevenLabs API entegrasyonu ile çalışır.', en: 'Works via browser Web Speech API and backend Deepgram/ElevenLabs integrations.' },
      { id: 'voice3', cat: 'voice', kw: ['ses ayarları', 'voice settings'], tr: 'Modülatör menüsünden hızı, ses tonunu ve ses tipini değiştirebilirsiniz.', en: 'Configure rate, volume, and voice models inside the modulator tab.' },
      { id: 'voice4', cat: 'voice', kw: ['ses çalma', 'speech play'], tr: 'Gelen asistan mesajlarının yanındaki "Hoparlör" simgesine basarak sesli okutabilirsiniz.', en: 'Press the speaker icon next to any assistant message to trigger TTS.' },
      { id: 'voice5', cat: 'voice', kw: ['ses durdurma', 'speech stop'], tr: 'Ses çalarken ekranın altındaki "Durdur" butonuna basarak sesi kesebilirsiniz.', en: 'Click the Stop button at the bottom of the screen to cancel active speech.' },
      { id: 'voice6', cat: 'voice', kw: ['elevenlabs nedir', 'elevenlabs api'], tr: 'Yapay zeka tabanlı, son derece doğal ses sentezleme servisidir.', en: 'AI-based, extremely natural text-to-speech synthesis service.' },
      { id: 'voice7', cat: 'voice', kw: ['deepgram nedir', 'deepgram stt'], tr: 'Mikrofon sesini yüksek hızda ve doğrulukta metne dönüştüren STT servisidir.', en: 'High-speed, high-accuracy speech-to-text service.' },
      { id: 'voice8', cat: 'voice', kw: ['uyandırma kelimesi dinleme', 'wake word status'], tr: 'Asistan aktif olarak "Moni" kelimesini dinler. Kapalıysa ayarlardan açabilirsiniz.', en: 'The assistant listens for "Moni". You can activate it in settings.' },
      { id: 'voice9', cat: 'voice', kw: ['mikrofon izni', 'microphone permission'], tr: 'Tarayıcınızın veya uygulamanın mikrofon erişimine izin verilmiş olmalıdır.', en: 'Ensure microphone access is enabled for the app or browser.' },
      { id: 'voice10', cat: 'voice', kw: ['sesli arama', 'voice search'], tr: 'Arama çubuğundaki mikrofon simgesine tıklayarak sesli arama yapabilirsiniz.', en: 'Click the microphone icon on the search bar to run a voice query.' },
      { id: 'voice11', cat: 'voice', kw: ['türkçe seslendirme', 'turkish tts'], tr: 'MONI Türkçe sesleri tr-TR dil kodu üzerinden doğal olarak okur.', en: 'MONI natively synthesizes Turkish text using tr-TR voice models.' },
      { id: 'voice12', cat: 'voice', kw: ['ingilizce seslendirme', 'english tts'], tr: 'İngilizce cevaplar en-US dil kodu ile seslendirilir.', en: 'English messages are read aloud using the en-US language code.' },
      { id: 'voice13', cat: 'voice', kw: ['ses modu', 'voice mode'], tr: 'Ses modunu açtığınızda ekranda büyük bir zeka küresi (Orb) belirir.', en: 'Activating voice mode displays a large smart orb on screen.' },
      { id: 'voice14', cat: 'voice', kw: ['ses çakışması', 'voice overlapping'], tr: 'Yeni bir konuşma tetiklendiğinde eski ses otomatik olarak kesilir.', en: 'Triggering a new message immediately cancels any active speech output.' },
      { id: 'voice15', cat: 'voice', kw: ['çevrimdışı ses', 'offline voice'], tr: 'İnternet olmasa dahi cihazın kendi yerel ses sentezleyicisi (Web Speech API) çalışır.', en: 'Browser Web Speech API executes text-to-speech even without internet.' },
      { id: 'voice16', cat: 'voice', kw: ['ses gecikmesi', 'voice latency'], tr: 'Deepgram STT ve ElevenLabs TTS sunucu hızlarına göre 1-2 saniye sürebilir.', en: 'TTS/STT latency is roughly 1-2 seconds depending on connection quality.' },
      { id: 'voice17', cat: 'voice', kw: ['ses kapatma', 'mute voice'], tr: 'Ayarlar > Ses altındaki "Cevapları Sesli Oku" seçeneğini kapatabilirsiniz.', en: 'You can disable TTS output under Settings > Voice & TTS.' },
      { id: 'voice18', cat: 'voice', kw: ['ses hızı', 'speech rate'], tr: 'Konuşma hızını 0.5x ile 2.0x arasında ayarlayabilirsiniz.', en: 'Speech speed can be adjusted between 0.5x and 2.0x.' },
      { id: 'voice19', cat: 'voice', kw: ['ses seviyesi', 'speech volume'], tr: 'Asistan ses düzeyini modülatör kaydırıcısı üzerinden ayarlayabilirsiniz.', en: 'Adjust the assistant volume slider on the modulator panel.' },
      { id: 'voice20', cat: 'voice', kw: ['ses tonu tınısı', 'speech pitch'], tr: 'Sesin tizliğini veya baslığını yerel ses sentezleyicisi üzerinden değiştirebilirsiniz.', en: 'Pitch controls adjust baseline treble/bass tones on Web Speech API.' },

      // CATEGORY 5: PROVIDER FALLBACK & HEALTH (25 entries)
      { id: 'health1', cat: 'health', kw: ['provider fallback', 'sağlayıcı yedekleme'], tr: 'Bir yapay zeka motoru hata verirse, sistem otomatik olarak bir sonrakine geçer.', en: 'If an AI engine fails, the system automatically redirects to the next one.' },
      { id: 'health2', cat: 'health', kw: ['groq limit', 'groq 429', 'api limiti dolarsa'], tr: 'Groq kotası dolduğunda, sistem Groq\'u beklemeye alır ve Gemini veya OpenAI\'ya geçer.', en: 'When Groq limits are reached, the system skips Groq and uses Gemini or OpenAI.' },
      { id: 'health3', cat: 'health', kw: ['circuit breaker', 'cooldown nedir'], tr: 'Hata veren sağlayıcının 60 saniye boyunca dinlendirilerek sisteme yük olmasının engellenmesidir.', en: 'Rate-limited providers are cooled down for 60 seconds to prevent errors.' },
      { id: 'health4', cat: 'health', kw: ['gemini api', 'gemini limit'], tr: 'Gemini, ücretsiz kotalarda dakikada 15 istek sınırı uygulayabilir.', en: 'Gemini free tier allows up to 15 requests per minute.' },
      { id: 'health5', cat: 'health', kw: ['openai api', 'openai limit'], tr: 'OpenAI API anahtarınızın bakiyesi bittiğinde veya limit aşıldığında yedek sağlayıcı devreye girer.', en: 'If OpenAI credentials expire or limit is hit, fallback provider takes over.' },
      { id: 'health6', cat: 'health', kw: ['provider status', 'sağlayıcı durumu'], tr: 'Yapay zeka sağlayıcılarının anlık durumlarını (çevrimiçi, limitli, çevrimdışı) durum çubuğundan görebilirsiniz.', en: 'You can check real-time provider health (online, limited, offline) on the status bar.' },
      { id: 'health7', cat: 'health', kw: ['çevrimdışı çalışmak', 'internet yokken', 'offline mode'], tr: 'İnternet bağlantısı kesildiğinde yerel bilgi tabanı (Local FAQ) ve veritabanı aktif kalır.', en: 'When connection is lost, the local FAQ database and SQLite remain functional.' },
      { id: 'health8', cat: 'health', kw: ['aktif sağlayıcı', 'active provider'], tr: 'Sohbet ayarlarında en üstte seçilen veya otomatik belirlenen sağlayıcıdır.', en: 'The primary provider configured in settings or resolved by auto-fallback.' },
      { id: 'health9', cat: 'health', kw: ['oto sağlayıcı', 'auto provider'], tr: 'Auto modunda sırasıyla Gemini, OpenAI, Groq ve Yerel motor denenir.', en: 'Auto mode waterfalls through Gemini, OpenAI, Groq, then Local.' },
      { id: 'health10', cat: 'health', kw: ['yerel motor', 'local engine'], tr: 'Bulut API\'leri çalışmadığında devreye giren entegre MONI zeka motorudur.', en: 'The built-in offline intelligence engine activated when APIs fail.' },
      { id: 'health11', cat: 'health', kw: ['hata ayıklama', 'error debug'], tr: 'Sunucu hataları veya rate limitler arayüzde temiz uyarılar olarak gösterilir.', en: 'Server connection errors and rate limits appear as clean UI notifications.' },
      { id: 'health12', cat: 'health', kw: ['sunucu kapalıysa', 'backend offline'], tr: 'Backend kapalı olsa dahi frontend yerel verileri kullanarak asistanı çalıştırır.', en: 'If backend is offline, frontend handles responses using local assets.' },
      { id: 'health13', cat: 'health', kw: ['api anahtarı ekleme', 'api key setup'], tr: 'Ayarlar > Yapay Zeka kısmından kendi Gemini veya OpenAI anahtarlarınızı girebilirsiniz.', en: 'Configure your own Gemini or OpenAI keys under Settings > AI Providers.' },
      { id: 'health14', cat: 'health', kw: ['api anahtarı güvenliği', 'api key storage'], tr: 'Anahtarlarınız tarayıcıda LocalStorage üzerinde ve sunucuda .env içinde saklanır; asla dışarı sızdırılmaz.', en: 'Keys are persisted locally in browser localStorage or .env, never shared.' },
      { id: 'health15', cat: 'health', kw: ['gemini 2.5 flash', 'gemini model'], tr: 'Varsayılan Gemini modelimiz yüksek hızlı ve verimli gemini-2.5-flash modelidir.', en: 'Our default Gemini model is the fast and efficient gemini-2.5-flash.' },
      { id: 'health16', cat: 'health', kw: ['openai model', 'gpt-4o-mini'], tr: 'OpenAI entegrasyonu varsayılan olarak ekonomik gpt-4o-mini modelini kullanır.', en: 'OpenAI integration uses the economical gpt-4o-mini model by default.' },
      { id: 'health17', cat: 'health', kw: ['groq model', 'llama-3.3'], tr: 'Groq altyapısında Llama-3.3-70b-versatile modeli yüksek hızla çalıştırılır.', en: 'Groq infrastructure runs the fast Llama-3.3-70b-versatile model.' },
      { id: 'health18', cat: 'health', kw: ['sağlık göstergeleri', 'health indicators'], tr: 'Yeşil: Sağlıklı, Sarı: Cooldown/Limit, Kırmızı: Çevrimdışı anlamına gelir.', en: 'Green: Healthy, Yellow: Cooldown/Limited, Red: Offline.' },
      { id: 'health19', cat: 'health', kw: ['gecikme süresi', 'api latency'], tr: 'Sunucunun API yanıt verme hızı diagnostik tablosunda milisaniye cinsinden izlenir.', en: 'API latency is monitored in milliseconds under the diagnostics panel.' },
      { id: 'health20', cat: 'health', kw: ['hata sayısı', 'failure count'], tr: 'Üst üste 3 başarısız istek alan sağlayıcı otomatik olarak cooldown durumuna çekilir.', en: 'A provider with 3 consecutive failures is automatically placed on cooldown.' },
      { id: 'health21', cat: 'health', kw: ['yedek sağlayıcı', 'fallback list'], tr: 'Sağlayıcılar sırayla taranarak aktif ve ayakta olan ilk model seçilir.', en: 'Providers are queried sequentially to pick the first responsive model.' },
      { id: 'health22', cat: 'health', kw: ['yerel eşleştirme', 'local match'], tr: 'Basit soru niyetleri buluta gönderilmeden anında yerel eşleştirici ile çözülür.', en: 'Simple intent statements bypass APIs and match instantly locally.' },
      { id: 'health23', cat: 'health', kw: ['kota aşımı', 'quota exceeded'], tr: 'Kota aşımı durumunda arayüzde geçici küçük bir bildirim belirir.', en: 'A small UI notification signals when a quota has been exceeded.' },
      { id: 'health24', cat: 'health', kw: ['bağlantı testi', 'connection test'], tr: 'Geliştirici laboratuvarından canlı LLM bağlantı testleri yapabilirsiniz.', en: 'You can execute live LLM connectivity checks in developer labs.' },
      { id: 'health25', cat: 'health', kw: ['cooldown süresi', 'cooldown duration'], tr: 'Kısıtlanan sağlayıcılar 1 dakika sonra otomatik olarak yeniden aktifleşir.', en: 'Rate-limited models automatically reactivate after 1 minute.' },

      // CATEGORY 6: PROACTIVE INTEL & TIMELINE (20 entries)
      { id: 'timeline1', cat: 'timeline', kw: ['aktivite geçmişi', 'activity timeline'], tr: 'Yaptığınız önemli işlemleri (proje açma, dosya okuma, görev bitirme) zaman akışında listeler.', en: 'Lists major activities (open project, read file, finish task) in a timeline.' },
      { id: 'timeline2', cat: 'timeline', kw: [' timeline nerede', 'where is timeline'], tr: 'Aktivite Zaman Akışı, Dashboard sağ panelindeki "Bugün" sekmesinde yer alır.', en: 'The Activity Timeline is placed in the Today tab on the right sidebar.' },
      { id: 'timeline3', cat: 'timeline', kw: ['akıllı öneriler', 'proactive suggestions'], tr: 'Zaman akışındaki verileri analiz ederek sonraki adımları tahmin eden ve öneren yapay zeka mekanizmasıdır.', en: 'Smart system predicting and suggesting next steps based on timeline data.' },
      { id: 'timeline4', cat: 'timeline', kw: ['öneri sıklığı', 'suggestion frequency'], tr: 'Düşük, Normal ve Sık olmak üzere ayarlardan öneri alma sıklığını değiştirebilirsiniz.', en: 'Change how often you get suggestions (Low, Normal, High) in settings.' },
      { id: 'timeline5', cat: 'timeline', kw: ['bildirim merkezi', 'notification center'], tr: 'Proaktif uyarıların, sistem güncellemelerinin ve hatırlatıcıların toplandığı üst bildirim alanıdır.', en: 'Header area aggregating proactive alerts, updates, and reminders.' },
      { id: 'timeline6', cat: 'timeline', kw: ['okundu işaretle', 'mark all as read'], tr: 'Bildirimler menüsünün altındaki "Tümünü Okundu İşaretle" ile bildirimleri temizleyebilirsiniz.', en: 'Click "Mark All as Read" inside the notifications menu to clear alerts.' },
      { id: 'timeline7', cat: 'timeline', kw: ['timeline temizle', 'clear timeline'], tr: 'Zaman akışı verileri SQLite veritabanından tamamen silinebilir.', en: 'Timeline activity events can be cleared from the SQLite database.' },
      { id: 'timeline8', cat: 'timeline', kw: ['proaktif kapatma', 'disable proactive'], tr: 'Zeka ayarlarından proaktif önerileri tamamen kapatabilirsiniz.', en: 'You can disable proactive recommendations in intelligence settings.' },
      { id: 'timeline9', cat: 'timeline', kw: ['smart brief', 'günlük özet'], tr: 'Güne başlarken MONI size hava durumu, görevler ve dünün özetinden oluşan bir brifing hazırlar.', en: 'MONI generates a morning brief with weather, tasks, and yesterday\'s logs.' },
      { id: 'timeline10', cat: 'timeline', kw: ['timeline neleri kaydeder', 'timeline logging'], tr: 'Sadece veritabanı yazımları, dosya açma ve asistan konuşmaları gibi önemli olayları kaydeder.', en: 'Logs only major milestones like file openings, DB changes, and chats.' },
      { id: 'timeline11', cat: 'timeline', kw: ['verimlilik skoru', 'productivity score'], tr: 'Günlük tamamladığınız görev oranına göre hesaplanan başarı yüzdesidir.', en: 'Success percentage calculated based on daily task completion rates.' },
      { id: 'timeline12', cat: 'timeline', kw: ['companion center', 'companion paneli'], tr: 'Zeka küresi, günlük özet ve proaktif aksiyonların toplandığı ana kontrol merkezidir.', en: 'Core interface aggregating the smart orb, briefs, and recommendations.' },
      { id: 'timeline13', cat: 'timeline', kw: ['smart search', 'ctrl k arama'], tr: 'Ctrl+K tuş kombinasyonu ile projeler, komutlar ve dosyalar arasında hızlı arama yapabilirsiniz.', en: 'Use Ctrl+K shortcut to search across projects, commands, and files.' },
      { id: 'timeline14', cat: 'timeline', kw: ['command center', 'komut paleti'], tr: 'Tüm sistem işlevlerine (karanlık mod, ses kapatma vb.) erişebileceğiniz hızlı arama paletidir.', en: 'Quick search palette targeting system settings and actions.' },
      { id: 'timeline15', cat: 'timeline', kw: ['timeline hızı', 'timeline speed'], tr: 'Zaman akışı arka planda asenkron çalışır ve arayüzü yavaşlatmaz.', en: 'Timeline logging runs asynchronously, causing zero UI slowdowns.' },
      { id: 'timeline16', cat: 'timeline', kw: ['sistem önerileri', 'system suggestions'], tr: 'Disk doluluğu veya API hataları gibi durumlarda MONI size düzeltici adımlar önerir.', en: 'MONI suggests resolution steps for disk limits or API errors.' },
      { id: 'timeline17', cat: 'timeline', kw: ['dünün özeti', 'yesterday recap'], tr: 'Zaman akışı dünden kalan tamamlanmamış işleri ertesi sabah hatırlatır.', en: 'Timeline tracks yesterday\'s incomplete tasks to show next morning.' },
      { id: 'timeline18', cat: 'timeline', kw: ['aktivite filtresi', 'activity filter'], tr: 'Zaman akışında sadece belirli kategorideki olayları süzebilirsiniz.', en: 'You can filter timeline events by specific category tags.' },
      { id: 'timeline19', cat: 'timeline', kw: ['timeline veri boyutu', 'timeline size'], tr: 'Timeline kayıtları hafiftir ve veritabanında çok az yer kaplar.', en: 'Timeline entries are optimized strings consuming minimal disk space.' },
      { id: 'timeline20', cat: 'timeline', kw: ['proaktif zeka testi', 'proactive test'], tr: 'Geliştirici laboratuvarından proaktif bildirimlerin tetiklenmesini test edebilirsiniz.', en: 'You can test proactive alert dispatching inside developer labs.' },

      // CATEGORY 7: WORKFLOW, SECURITY & GENERAL (40 entries to guarantee 150 total entries)
      { id: 'gen1', cat: 'general', kw: ['şifreli giriş', 'password authentication', 'auth plan'], tr: 'Şifreli Giriş Planı, yerel kullanıcı profillerini şifrelemek ve güvenli JWT tabanlı oturum yönetimi sunmak için hazırlanmıştır.', en: 'The password authentication plan provides local profile encryption and secure JWT session management.' },
      { id: 'gen2', cat: 'general', kw: ['github güncellemesi', 'github sync', 'git push'], tr: 'Sistem güncellemelerini ve yedeklemelerini GitHub deposuna güvenli bir şekilde aktarma işlemidir.', en: 'The sync flow backing up updates securely to the repository on GitHub.' },
      { id: 'gen3', cat: 'general', kw: ['mobil sürüm', 'mobile capacitor', 'cap sync'], tr: 'Capacitor entegrasyonu sayesinde MONI, iOS ve Android cihazlarda yerel bir mobil uygulama gibi çalışır.', en: 'Capacitor integrations compile MONI into native iOS and Android packages.' },
      { id: 'gen4', cat: 'general', kw: ['çevrimdışı veritabanı', 'offline database', 'sqlite'], tr: 'Verileriniz bulut yerine cihazınızdaki SQLite veritabanı dosyasında (moni.db) depolanır.', en: 'All application records are persisted in a local SQLite file (moni.db).' },
      { id: 'gen5', cat: 'general', kw: ['raporlama', 'reports folder'], tr: 'Oluşturulan tüm sistem, test ve analiz raporları projenin "reports" klasöründe saklanır.', en: 'All generated system, test, and diagnostics reports live in the "reports" folder.' },
      { id: 'gen6', cat: 'general', kw: ['eklenti yükleme', 'install plugin'], tr: 'Eklenti Marketinden dilediğiniz modülü tek tıkla indirip asistanınıza yeni özellikler katabilirsiniz.', en: 'You can install extensions from the marketplace to expand assistant capabilities.' },
      { id: 'gen7', cat: 'general', kw: ['workflow tetikleyici', 'workflow trigger'], tr: 'Zamanlanmış görevler veya veritabanı olayları gibi durumlar workflow süreçlerini otomatik başlatır.', en: 'Scheduled cron jobs or database updates can trigger workflows automatically.' },
      { id: 'gen8', cat: 'general', kw: ['giriş ekranı', 'login page'], tr: 'Auth planı kapsamındaki minimalist, zeka küresi temalı kullanıcı giriş arayüzüdür.', en: 'The minimalist, orb-themed login card included in the authentication plan.' },
      { id: 'gen9', cat: 'general', kw: ['kayıt ekranı', 'register page'], tr: 'Yeni kullanıcı profili oluşturma ve parola gücü doğrulama ekranıdır.', en: 'The user sign-up page verifying password strengths.' },
      { id: 'gen10', cat: 'general', kw: ['parola kuralları', 'password strength'], tr: 'En az 10 karakter, büyük/küçük harf, rakam ve özel karakter içermelidir.', en: 'Requires at least 10 chars, upper/lower case, digit, and special char.' },
      { id: 'gen11', cat: 'general', kw: ['parola sıfırlama', 'password reset'], tr: 'Şifrenizi unutursanız, kayıtlı e-posta adresinize tek kullanımlık kod gönderilir.', en: 'Forgot passwords can be reset via a single-use token sent to email.' },
      { id: 'gen12', cat: 'general', kw: ['e-posta doğrulama', 'email verification'], tr: 'Yeni kayıt olan hesapların aktivasyonu için gönderilen onay bağlantısı akışıdır.', en: 'Activation links emailed to verify newly registered accounts.' },
      { id: 'gen13', cat: 'general', kw: ['jwt oturum', 'jwt session'], tr: 'Kullanıcının sisteme giriş yaptıktan sonra güvenli işlem yapmasını sağlayan token yapısıdır.', en: 'Secure token system authorizing users after logging in.' },
      { id: 'gen14', cat: 'general', kw: ['google login', 'google oauth'], tr: 'Giriş ekranında Google hesabı ile hızlı oturum açma seçeneği planlanmaktadır.', en: 'Google Sign-In integration is planned for the authorization layer.' },
      { id: 'gen15', cat: 'general', kw: ['2fa nedir', 'two factor auth'], tr: 'Google Authenticator benzeri uygulamalarla giriş güvenliğini iki katına çıkaran doğrulama adımıdır.', en: 'Two-factor auth using TOTP apps to add an extra layer of login security.' },
      { id: 'gen16', cat: 'general', kw: ['router koruması', 'router guard'], tr: 'Giriş yapmamış kullanıcıların dashboard ekranına erişmesini engelleyen güvenlik duvarıdır.', en: 'Security intercepts redirecting unauthenticated traffic to login.' },
      { id: 'gen17', cat: 'general', kw: [' offline tts', 'offline speech synthesis'], tr: 'İnternet bağlantısı kesildiğinde yerel cihaz sesleri (Selin, Microsoft vb.) kullanılır.', en: 'Device-native system voices are utilized for speech when offline.' },
      { id: 'gen18', cat: 'general', kw: ['yedekleme sıklığı', 'backup interval'], tr: 'Ayarlar kısmından otomatik veritabanı yedekleme periyodunu seçebilirsiniz.', en: 'Configure database auto-backup intervals in settings.' },
      { id: 'gen19', cat: 'general', kw: ['workflow geçmişi', 'workflow logs'], tr: 'Daha önce çalışmış tüm otomatik iş akışlarının sonuç raporlarıdır.', en: 'Execution logs tracking the results of previously run workflows.' },
      { id: 'gen20', cat: 'general', kw: ['sistem bellek kullanımı', 'system memory usage'], tr: 'Diagnostik ekranından uygulamanın RAM tüketim grafiğini inceleyebilirsiniz.', en: 'Monitor memory and RAM charts inside the diagnostics view.' },
      { id: 'gen21', cat: 'general', kw: ['geliştirici laboratuvarı', 'developer labs'], tr: 'Yeni özellikleri ve API entegrasyonlarını test edebileceğiniz deneysel alandır.', en: 'Experimental workspace to run code tests and API checks.' },
      { id: 'gen22', cat: 'general', kw: ['karanlık mod', 'dark mode'], tr: 'MONI premium koyu tema renk paleti ile tasarlanmıştır.', en: 'MONI is built using a custom high-end dark theme palette.' },
      { id: 'gen23', cat: 'general', kw: ['tema değiştirme', 'theme switch'], tr: 'Görünüm ayarlarından arayüz temalarını değiştirebilirsiniz.', en: 'Toggle visual theme accents inside settings.' },
      { id: 'gen24', cat: 'general', kw: ['disk sağlığı', 'disk status'], tr: 'Yerel veritabanı dosyasının disk üzerindeki boyutunu gösterir.', en: 'Tracks the local database file size on your hard disk.' },
      { id: 'gen25', cat: 'general', kw: ['asistan modu', 'assistant mode'], tr: 'MONI\'nin klasik soru-cevap asistanı olarak çalıştığı moddur.', en: 'Standard Q&A assistant operating mode of MONI.' },
      { id: 'gen26', cat: 'general', kw: ['workflow duraklat', 'pause workflow'], tr: 'Aktif bir iş akışını geçici olarak devre dışı bırakabilirsiniz.', en: 'You can temporarily pause an active workflow scheduler.' },
      { id: 'gen27', cat: 'general', kw: ['workflow ekle', 'add workflow'], tr: 'Workflow panelindeki artı simgesiyle yeni otomatik zincir oluşturabilirsiniz.', en: 'Click the plus icon in the workflows tab to build new rules.' },
      { id: 'gen28', cat: 'general', kw: ['yedekten yükle', 'restore db'], tr: 'Yedekleme ayarlarından eski bir veritabanı dosyasını geri yükleyebilirsiniz.', en: 'Restore previous database states from the backup menu.' },
      { id: 'gen29', cat: 'general', kw: ['hata günlükleri', 'error logs'], tr: 'Uygulamanın ürettiği tüm hatalar sunucu .log dosyalarında tutulur.', en: 'Application exception errors are stored in the server .log files.' },
      { id: 'gen30', cat: 'general', kw: ['ses tınısı tespiti', 'voice pitch check'], tr: 'Modülatör tını ayarının aktif olup olmadığını kontrol eder.', en: 'Verifies if customized pitch settings are loaded.' },
      { id: 'gen31', cat: 'general', kw: ['hızlı başlangıç', 'quick start'], tr: 'Ana ekrandaki hızlı yönlendirme butonları ile chat veya randevulara hızlıca geçebilirsiniz.', en: 'Home dashboard links let you jump directly to chat or calendar.' },
      { id: 'gen32', cat: 'general', kw: ['asistan ses tipi', 'voice selection'], tr: 'Cihazınızda yüklü olan tüm Türkçe ve İngilizce sesler arasından seçim yapabilirsiniz.', en: 'Select from all Turkish and English voices installed on the host.' },
      { id: 'gen33', cat: 'general', kw: ['otomatik ses gönderme', 'auto submit voice'], tr: 'Konuşmanız bittikten 1.5 saniye sonra mikrofondan alınan metin otomatik gönderilir.', en: 'Transcripts are automatically submitted 1.5s after speech pause.' },
      { id: 'gen34', cat: 'general', kw: ['çevrimdışı yardım', 'offline help'], tr: 'İnternet yokken de tüm yardım dökümantasyonunu okuyabilirsiniz.', en: 'You can browse help documentations even when offline.' },
      { id: 'gen35', cat: 'general', kw: ['proje ekleme', 'add project'], tr: 'Yeni bir çalışma klasörünü MONI\'ye proje olarak tanıtabilirsiniz.', en: 'Register a new active folder as a project in MONI.' },
      { id: 'gen36', cat: 'general', kw: ['proje detayı', 'project detail'], tr: 'Seçili projenin dosya yapısını ve kod karmaşıklığını gösterir.', en: 'Displays directory trees and code complexity charts of projects.' },
      { id: 'gen37', cat: 'general', kw: ['verimlilik takibi', 'productivity tracking'], tr: 'Haftalık biten görev oranlarını ve çalışma grafiklerini raporlar.', en: 'Reports weekly completed task counts and working logs.' },
      { id: 'gen38', cat: 'general', kw: ['bildirim temizleme', 'clear notification'], tr: 'Okunan tüm bildirimler geçmişe aktarılır.', en: 'Read notifications are cataloged into history logs.' },
      { id: 'gen39', cat: 'general', kw: ['hata bildirimi', 'error notify'], tr: 'İşlem başarısız olduğunda ekranın sağ köşesinde beliren küçük uyarı pencereleridir.', en: 'Small alert cards appearing on the screen corner when errors occur.' },
      { id: 'gen40', cat: 'general', kw: ['çevrimdışı kontrol', 'offline check'], tr: 'MONI sunucusu internet bağlantısını 15 saniyede bir kontrol eder.', en: 'MONI server validates connection status every 15 seconds.' }
    ];

    this.entries = rawData.map(d => ({
      id: d.id,
      category: d.cat,
      keywords: d.kw,
      tr: d.tr,
      en: d.en
    }));
  }

  public getEntries(): FAQEntry[] {
    return this.entries;
  }

  public findMatch(message: string, isEnglish: boolean): string | null {
    const text = message.toLowerCase().trim();
    if (!text) return null;

    // Simple keyword scoring search
    let bestEntry: FAQEntry | null = null;
    let maxScore = 0;

    for (const entry of this.entries) {
      let score = 0;
      for (const kw of entry.keywords) {
        if (text === kw) {
          score += 10; // Exact keyword match
        } else if (text.includes(kw)) {
          score += kw.length; // Partial match, longer keywords score higher
        }
      }
      if (score > maxScore) {
        maxScore = score;
        bestEntry = entry;
      }
    }

    // Minimum threshold for matching to prevent false positives
    if (bestEntry && maxScore >= 3) {
      return isEnglish ? bestEntry.en : bestEntry.tr;
    }

    return null;
  }
}

export const localFAQEngine = LocalFAQEngine.getInstance();
export default localFAQEngine;
