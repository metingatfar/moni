# MONI Voice Engine 2.0 Report

## Executive Summary
This report details the architectural enhancements made to the MONI Voice Engine (Version 2.0) to completely eliminate self-listening feedback loops. Speech recognition is now rigidly isolated from speech synthesis using complete lifecycle destruction, post-synthesis cooldown windows, active audio checks, and multi-tier self-audio guarding.

---

## BUG 1: Self-Listening & Overlapping Audio Loops

### Diagnosis
- The browser's native `SpeechRecognition` engine remained active (or restarted prematurely) while MONI's text-to-speech (TTS) was still playing greeting or response audio. 
- As a result, the microphone captured the output of the local speakers (MONI speaking "Buradayım Metin, seni dinliyorum" or answers), transcribed it as user input, and repeatedly sent duplicate command requests to the AI pipeline.

### Architectural Solution — Hard Recognition Isolation
- **Total Instance Teardown:** Implemented `destroyRecognition()` in [MoniRuntime.ts](file:///c:/Users/user/Desktop/moni/src/core/runtime/MoniRuntime.ts). Instead of calling `stop()` (which processes the remaining audio buffers and fires callbacks), we:
  1. Remove all listeners (`onstart`, `onresult`, `onerror`, `onend`).
  2. Call `abort()` on the native `SpeechRecognition` instance to terminate capture instantly.
  3. Clear HMR/restart timers (`recognitionRestartTimer`).
  4. Nullify the instance.
- **Strict Post-Speech Cooldown:** Before any TTS begins, recognition is aggressively destroyed. After TTS completes, the runtime waits for a minimum **1000ms silence cooldown window**.
- **Active Synthesis Guard:** Recognition is never restarted if the browser's native `speechSynthesis.speaking` is `true`. The cooldown loop continuously polls the browser status until it is completely silent.
- **Unique Recognition Instances:** Mode transitions create a brand-new `SpeechRecognition` instance instead of reusing previous ones, preventing event loop leaking or overlapping streams.

---

## BUG 2: Safety Timeout Premature Release

### Diagnosis
- In our previous SpeechSynthesis safety fallback, a timer triggered a premature release after an estimated period of time, even if speech was still audible.

### Architectural Solution — Safety Status Polling
- Implemented a single-callback pattern in [VoiceService.ts](file:///c:/Users/user/Desktop/moni/src/data/services/VoiceService.ts) using the `isCallbackCalled` flag to guarantee `onEnd` is executed exactly once.
- Refactored the safety timeout fallback. If the timeout triggers but `speechSynthesis.speaking` or `speechSynthesis.pending` is `true`, it logs `TTS_TIMEOUT_WAITING_STILL_SPEAKING` and polls every 250ms until speaking is completed.
- Incorporated a **15-second emergency release boundary**. If polling exceeds this threshold, it invokes `window.speechSynthesis.cancel()`, logs `TTS_EMERGENCY_RELEASE`, and releases the callback.

---

## BUG 3: Self-Audio Transcript Guards

### Diagnosis
- Substring filters were sometimes bypassable or overly restrictive for short user answers. We needed a precise, multi-tier self-audio validation shield.

### Architectural Solution — Multi-Tier Guard
We introduced `isSelfAudio(transcript)` inside `MoniRuntime.ts` validating:
1. **Time-Based Cooldown:** Transcripts captured within **1500ms** after `ttsEndedAt` are discarded immediately (`SELF_AUDIO_IGNORED_COOLDOWN`).
2. **Normalized Edit-Distance Similarity:** If the edit-distance similarity between the raw transcript and `lastTtsText` exceeds **60%**, it is discarded (`SELF_AUDIO_IGNORED_SIMILARITY`).
3. **Phrase Matching:** Any transcript containing known MONI greeting keywords is instantly discarded (`SELF_AUDIO_IGNORED_GREETING_PHRASE`). Checked phrases:
   - `buradayım`
   - `seni dinliyorum`
   - `nasıl yardımcı`
   - `yardımcı olabilirim`
   - `merhaba metin ben de seni dinliyorum`

---

## VOICE ENGINE 2.0 LOGS TRACE
Below is the execution trace logged during the voice lifecycle sequence:
- `VOICE_ENGINE_DESTROY_RECOGNITION`
- `VOICE_ENGINE_CREATE_RECOGNITION_WAKE`
- `VOICE_ENGINE_TTS_START`
- `VOICE_ENGINE_TTS_END_CONFIRMED`
- `VOICE_ENGINE_SILENCE_COOLDOWN_START`
- `VOICE_ENGINE_SILENCE_COOLDOWN_END`
- `VOICE_ENGINE_CREATE_RECOGNITION_COMMAND`
- `VOICE_ENGINE_COMMAND_ACCEPTED`
- `VOICE_ENGINE_COMMAND_REJECTED_SELF_AUDIO`
- `VOICE_ENGINE_RETURN_WAKE`
