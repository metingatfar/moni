# MONI Browser TTS Recovery Report

## Executive Summary
This recovery Sprint addresses the "no audio / no response" issue after Voice Engine 2.0 refactoring. ElevenLabs and Google Cloud TTS have been fully bypassed, local SpeechSynthesis has been stabilized with a 250ms interrupt delay, and a direct "Tarayıcı Ses Testi" button has been introduced in both desktop and mobile voice panels to allow manual E2E validation.

---

## 1. Safety Interrupt Refactoring
- **asynchronous cancel() delay:** Some browsers ignore `speak()` if called instantly after `cancel()`. We refactored `speakWithLocalSpeechSynthesis` to run `cancel()` and then wait a mandatory **250ms** before calling `window.speechSynthesis.speak(utterance)`.
- **Garbage Collection Guard:** Utterances are still safely stored under `(window as any).activeUtterance = utterance`.
- **Parameter Standardization:** The local utterance properties are strictly bound to Turkish defaults:
  - `utterance.lang = "tr-TR"`
  - `utterance.rate = 0.95`
  - `utterance.pitch = 1`
  - `utterance.volume = 1`
- **Turkish System Voice Selection:** Explicitly falls back to a Turkish default voice (`tr-TR` matching pattern) on the user's local operating system if available.

---

## 2. ElevenLabs Total Bypass
- The client-side ElevenLabs provider pathway is fully bypassed.
- Set `this.elevenLabsDisabled = true` inside the class constructor and early return inside the `speak()` method of [VoiceService.ts](file:///c:/Users/user/Desktop/moni/src/data/services/VoiceService.ts).
- Forced `this.ttsProvider = 'Browser'` inside [MoniRuntime.ts](file:///c:/Users/user/Desktop/moni/src/core/runtime/MoniRuntime.ts) constructor.

---

## 3. Direct Browser TTS Test Function
We implemented a dedicated test function in [VoiceService.ts](file:///c:/Users/user/Desktop/moni/src/data/services/VoiceService.ts) named `testBrowserTTS(text)` that:
- Bypasses any runtime/state dependencies.
- Runs `cancel()`, waits `250ms`, then speaks the utterance directly.
- Logs:
  - `BROWSER_TTS_TEST_START`
  - `BROWSER_TTS_TEST_END`
  - `BROWSER_TTS_TEST_ERROR`

### Added Panel Buttons
- **Desktop View:** Replaced the non-functional Speaker Test button in `AssistantPanel` inside [DesktopPanels.tsx](file:///c:/Users/user/Desktop/moni/src/presentation/ui5/components/DesktopPanels.tsx) with a fully styled "🔊 Tarayıcı Ses Testi" button.
- **Mobile View:** Added a "Tarayıcı Ses Testi" button below the voice dock controls in `MobileVoice` inside [MobileViews.tsx](file:///c:/Users/user/Desktop/moni/src/presentation/ui5/views/MobileViews.tsx).

---

## 4. Fail-Safe Chat Processing
Even in the event of local SpeechSynthesis failures (e.g. browser blocking sound autoplay), chat pipeline additions are completely decoupled:
- The greeting message is always appended to the chat and saved to SQLite (`RUNTIME_GREETING_MESSAGE_ADDED`).
- The runtime attempts to speak (`RUNTIME_GREETING_TTS_ATTEMPTED`).
- If SpeechSynthesis fails, it immediately releases the callback and enters `WAITING_COMMAND` mode (`RUNTIME_ENTER_WAITING_COMMAND`).

---

## 5. Recovery Log Sequence
The browser console now tracks the following recovery lifecycle logs:
- `VOICE_TEST_BUTTON_CLICKED` (on test button click)
- `BROWSER_TTS_TEST_START`
- `BROWSER_TTS_TEST_END`
- `BROWSER_TTS_START` (on runtime greeting or response speak attempts)
- `BROWSER_TTS_SPEAK_CALLED`
- `BROWSER_TTS_ONEND` (successful speech ends)
- `BROWSER_TTS_ONERROR` (speech error hooks)
- `BROWSER_TTS_BLOCKED_BY_BROWSER` (in case of autoplay policy restriction)
