# MONI 2.0 — Natural Conversation + Avatar Voice Polish Report

## 1. Increased Command Listening Window
- **Silence Cooldown Adjustments:** Wait duration after wake greeting is set to `1500ms` (by changing `minCooldownDuration = 1500` inside `MoniRuntime.ts`) to let TTS synthesis finish completely before starting recognition.
- **Command Duration:** Extended command listening time from 10 seconds to **20 seconds** (`20000ms`).
- **Interactive Listening Status:** Replaced generic starting/listening statuses with the clear visual status `"Seni dinliyorum..."` on `MoniRuntime.ts`.

---

## 2. Better Command Capture (Interim / Partial Support)
- **Active Transcription:** Initialized `rec.interimResults = true;` inside `startCommandListening` to capture and stream real-time partial transcripts.
- **Timeout Extension:** Whenever user starts or continues speaking (interim result event fires), the 20-second timeout automatically resets/extends.
- **Allowed Short Commands Bypass:** Configured an explicit bypass array (`['merhaba', 'nasilsin', 'nasilsiniz', 'devam et', 'anlat', 'tamam']`) inside `isSelfAudio` method to prevent short, natural commands from being ignored by similarity checks or TTS cooldown limits.

---

## 3. Natural MONI response style & Fallback Conversation
- Removed robotic phrases (e.g. *"Talebinizle ilgileniyorum."*, *"Çok iyiyim, teşekkürler. Size hizmet etmek için hazırım."*) inside [LocalAiService.ts](file:///c:/Users/user/Desktop/moni/src/data/services/LocalAiService.ts) and [LocalFAQEngine.ts](file:///c:/Users/user/Desktop/moni/src/core/knowledge/LocalFAQEngine.ts).
- Replaced with Turkish, warm, short, natural MONI responses addressing the user:
  - *Merhaba* → `"Merhaba Metin, buradayım. Bugün nasıl yardımcı olayım?"`
  - *Nasılsın* → `"İyiyim Metin, teşekkür ederim. Sen nasılsın?"`
  - *Kimsin* → `"Ben MONI. Metin GATFAR tarafından geliştirilmiş, seninle beraber çalışan dijital yapay zeka asistanıyım."`
  - *Beni duyuyor musun* → `"Evet Metin, seni gayet net duyuyorum. Dinlemedeyim."`
  - *Konuşuyor musun* → `"Evet Metin, seninle sesli olarak konuşabiliyorum."`
  - *Türkçe biliyor musun* → `"Tabii ki Metin, Türkçe konuşup anlaşabiliyoruz."`
  - *Devam et* → `"Tamamdır Metin, dinliyorum, devam et lütfen."`
  - *Yardım et* → `"Tabii Metin, ne konuda yardıma ihtiyacın var? Birlikte çözelim."`

---

## 4. Avatar State Synchronization
Updated `MoniRuntime.ts` and `ChatProvider.tsx` to handle the expanded 8-state schema:
- **WAITING_WAKE:** idle
- **WAKE_DETECTED:** listening
- **WAITING_COMMAND:** listening (showing *"Seni dinliyorum..."*)
- **PROCESSING / PROVIDER:** thinking
- **TTS speaking:** speaking
- **provider error:** error
- **fallback local answer:** speaking (during local TTS play)
- **offline:** offline (grayscale filter automatically applied when browser triggers `navigator.onLine === false`)

---

## 5. UI Elements
- Added a visible `Seçilen Ses: {selectedSystemVoiceName}` status indicator in settings for both desktop sidebar panels and mobile settings view.
