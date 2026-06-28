# MONI LLM & TTS Runtime Diagnostics & Fix Report

This report outlines the technical changes introduced to solve LLM provider rate limits (429) and single voice text-to-speech collision issues.

---

## 1. LLM Provider Fallback Waterfall

### Issue
When token limits or Groq rate limits (429) were exhausted, the backend returned raw 500 JSON exceptions that broke the chat feed.

### Solution
- **History Payload Trimmer**:
  - Automatically calculates total character length of the current payload.
  - If length exceeds `6000` characters, trims the chat history array to the last 5 messages, avoiding limits.
- **Failover Waterfall Sequence**:
  - Implements waterfall execution order in backend: selected provider $\rightarrow$ Gemini $\rightarrow$ Groq $\rightarrow$ Offline safe fallback message.
  - Intercepts 429 status codes. If a rate limit occurred, streams a friendly notify note to the client (`"Groq kullanım limiti doldu. Alternatif yapay zeka sağlayıcısına geçiyorum."` / `"Groq rate limit reached. Switching to an alternative AI provider."`) before completing the rest of the stream via the fallback provider.
  - If all options are rate limited or unavailable, returns a clean localized message:
    - TR: `"Şu anda yapay zeka sağlayıcısı yoğun veya limit dolu. Biraz sonra tekrar deneyebiliriz."`
    - EN: `"The AI provider is currently busy or rate-limited. Please try again shortly."`

---

## 2. Single Voice Playback Lock Controller

### Issue
Multiple voices spoke concurrently (browser local SpeechSynthesis overlapping with ElevenLabs audio).

### Solution
- **Unified Speech Sentezleyici Lock**:
  - Added `cancelAllSpeech()` inside [VoiceService.ts](file:///c:/Users/user/Desktop/moni/src/data/services/VoiceService.ts).
  - Explicitly invokes `window.speechSynthesis.cancel()`, pauses active HTMLAudioElement instances, resets audio timelines, and revokes unused blob stream resources.
- **TTS Lifecycle States**:
  - Exposes states: `'idle' | 'preparing' | 'speaking' | 'cancelled' | 'fallback'`.
  - Dispatches custom browser events (`'moni_voice_state_changed'`) on transitions to allow clean integration.
  - Ensures that if the ElevenLabs server connection succeeds, browser local speech synthesis is prevented from running. Local speech synthesis only kicks in as a fallback on play failures.

---

## 3. Language & Voice Matching Selection Fixes

### Issue
Female voice spoke English content while the UI was set to Turkish mode.

### Solution
- **Language Bindings**:
  - Automatically assigns `utterance.lang = "tr-TR"` in Turkish locale and `utterance.lang = "en-US"` in English locale.
- **Turkish Voice Checks**:
  - Verifies presence of TR speech synthesizers. If none exist, dispatches a UI warning notification: `"Türkçe sistem sesi bulunamadı, varsayılan ses kullanılıyor."`
- **Voice Custom Selection**:
  - Added a dropdown selector inside the Settings Panel voice tab allowing users to configure preferred voice mode options:
    - Auto (Default language mode)
    - Turkish Voice Only
    - English Voice Only
    - Male Voice Only
    - Female Voice Only
  - Settings are persisted in local storage (`'moni_preferred_voice_mode'`).

---

## 4. Frontend Warning & Retry Cards

### Issue
Raw backend JSON errors or tracebacks were shown inside the chat bubble.

### Solution
- **Error Interception**:
  - Raw JSON messages are filtered out inside the chat loop.
  - Catch routines inside `processUnifiedInput` capture errors and represent them as friendly localized system messages.
- **Interactive Warning Card**:
  - If the assistant returns a rate limit or busy notice, renders a red warning card in the chat view:
    - ⚠️ **Connection Rate Limited** / **Bağlantı Limiti Aşıldı**
  - Includes a retry button ("Retry Later" / "15 Dakika Sonra Tekrar Dene") that automatically re-submits the last user message.
