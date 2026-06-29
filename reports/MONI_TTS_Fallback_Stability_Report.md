# MONI TTS Fallback Stability Report

## Executive Summary
This report covers the stabilization of the text-to-speech (TTS) pipeline in MONI. ElevenLabs API calls returned persistent auth/quota errors (401/402). We implemented session-level caching of ElevenLabs' disabled status, improved fallback routing, and built browser SpeechSynthesis safety mechanisms.

## Diagnostic Findings
1. **Persistent Authentication & Quota Issues:** The ElevenLabs backend endpoint returned `401 Unauthorized` or `402 Payment Required` (paid plan required).
2. **Infinite Error Retries:** When ElevenLabs failed, the client would repeatedly request ElevenLabs or its Rachel voice fallback for subsequent messages, degrading latency and usability.
3. **SpeechSynthesis Garbage Collection Bug:** In the local SpeechSynthesis browser fallback, the local `SpeechSynthesisUtterance` instance was garbage collected before completion, preventing `onend` and `onerror` callbacks from firing.

## Solutions Implemented

### 1. Session-Level Provider Blacklisting
- Added an `elevenLabsDisabled` flag to [VoiceService.ts](file:///c:/Users/user/Desktop/moni/src/data/services/VoiceService.ts).
- If any ElevenLabs TTS request fails with a `401` or `402` status, it logs the appropriate event (`ELEVENLABS_DISABLED_401` or `ELEVENLABS_DISABLED_402`) and sets `elevenLabsDisabled = true`.
- Subsequent TTS requests skip ElevenLabs and fall back immediately to Browser SpeechSynthesis (`BROWSER_TTS_FALLBACK_ACTIVE`), avoiding unnecessary requests and latency.

### 2. SpeechSnythesis Garbage Collection Prevention
- Assigned the `SpeechSynthesisUtterance` instance to `(window as any).activeUtterance` to retain a reference during audio output, preventing Chrome and Safari's garbage collectors from destroying the listener bindings.

### 3. Dynamic Safety Timeout Fallback
- Implemented a dynamic fallback timer in [VoiceService.ts](file:///c:/Users/user/Desktop/moni/src/data/services/VoiceService.ts) based on character count (`Math.max(5000, text.length * 120 + 2000)`).
- If the browser fails to trigger `onend` or `onerror` within the timeout window, the system fires `TTS_TIMEOUT_FALLBACK_TRIGGERED`, cancels the active synthesis, and invokes the callback to release the runtime state.

## Event Logs Integrated
- `ELEVENLABS_DISABLED_401`
- `ELEVENLABS_DISABLED_402`
- `BROWSER_TTS_FALLBACK_ACTIVE`
- `TTS_ONEND_TRIGGERED`
- `TTS_ONERROR_TRIGGERED`
- `TTS_TIMEOUT_FALLBACK_TRIGGERED`

## Verification Results
- ElevenLabs simulation with simulated `402` errors verified that ElevenLabs was disabled (`ELEVENLABS_DISABLED_402`).
- The pipeline successfully routed to browser SpeechSynthesis (`BROWSER_TTS_FALLBACK_ACTIVE`).
- Audio was successfully produced and finished, triggering the completion hook (`TTS_ONEND_TRIGGERED`).
