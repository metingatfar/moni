# MONI Final Stability Bugfix Sprint Report

This report documents the diagnoses and resolutions implemented during the final stability sprint for the MONI AI companion system.

---

## BUG 1 & BUG 4: ElevenLabs Disable & Fallback Stability

### Diagnosis
- The frontend was trying to catch ElevenLabs errors and set `elevenLabsDisabled = true`, but subsequent requests still queried `/api/tts` because the session flag was not persistently stored across page refreshes or was losing state.
- In `server.js`, if `/api/tts` received a request when the ElevenLabs API key was invalid or hit quota limit (401/402), it would log "Rachel fallback" and attempt to query ElevenLabs' voices list or Rachel voice ID directly. This triggered repetitive internal API calls on every message, resulting in multiple 401/402 logs in the backend.

### Fix Implemented
- **Backend Cache:** Added a global `elevenLabsDisabledSession` variable in [server.js](file:///c:/Users/user/Desktop/moni/server.js). If a 401 or 402 is received from any ElevenLabs request (voice list query or TTS text-to-speech query), `elevenLabsDisabledSession` is set to `true`, and it immediately logs:
  ```
  ELEVENLABS_DISABLED_SESSION
  Browser TTS Active
  ```
- **Backend Prevention:** Subsequent calls to `/api/tts` are immediately rejected with a `403 Forbidden` status code, completely bypassing any connection attempts to ElevenLabs, voice list queries, or Rachel voice fallbacks.
- **Frontend Session Cache:** In [VoiceService.ts](file:///c:/Users/user/Desktop/moni/src/data/services/VoiceService.ts), if the client receives a 401, 402, or 403 response, it caches the disabled status in `sessionStorage` (`sessionStorage.setItem('moni_elevenlabs_disabled_session', 'true')`) and dispatches a `moni_tts_provider_changed` event.
- **Permanent Browser TTS:** On subsequent calls to `speak()`, `VoiceService` checks `this.elevenLabsDisabled` first, and if true, redirects output directly to the Browser SpeechSynthesis fallback, ensuring ElevenLabs is never called again during the session.

---

## BUG 2: ChatProvider Fast Refresh Incompatibility

### Diagnosis
- `ChatProvider.tsx` exported both the `ChatProvider` React component and the `useChat` custom hook. In React/Vite Fast Refresh, exporting hooks/functions alongside components in the same file causes HMR to invalidate module boundaries, resulting in full-page refreshes and HMR warnings.

### Fix Implemented
- Created [ChatContext.tsx](file:///c:/Users/user/Desktop/moni/src/presentation/ui5/providers/ChatContext.tsx) to declare the interface, the React context, and the custom `useChat` hook in a dedicated data module.
- Modified [ChatProvider.tsx](file:///c:/Users/user/Desktop/moni/src/presentation/ui5/providers/ChatProvider.tsx) to only export the `ChatProvider` component.
- Updated all files importing `useChat` to import directly from `./providers/ChatContext`, eliminating all HMR Fast Refresh warnings.

---

## BUG 3: MoniRuntime HMR Singleton Preservation

### Diagnosis
- When HMR reloaded `MoniRuntime.ts`, the entire module re-evaluated, creating a new class definition. Since the static class member `instance` on the new class definition was `undefined`, calling `getInstance()` created a duplicate instance, leading to memory leaks and multiple active listeners.

### Fix Implemented
- Attached the singleton instance to the global window context (`(window as any).__moniRuntimeInstance`) inside `getInstance()`.
- Implemented instance counter tracking on `(window as any).__moniRuntimeInstanceCount` inside the constructor. When constructor runs, it logs the unique instance ID and total instance counts.
- Caching on `window` ensures the constructor runs exactly once, so `__moniRuntimeInstanceCount` always equals `1` even after multiple HMR updates.

---

## BUG 5: Status Bar TTS Provider Rendering

### Diagnosis
- The status bar did not render the current active TTS provider, making it difficult to verify if the fallback became active.

### Fix Implemented
- Added `ttsProvider: 'ElevenLabs' | 'Browser'` to `RuntimeStateData` and class fields in `MoniRuntime.ts`.
- Subscribed to `moni_tts_provider_changed` event in `MoniRuntime` constructor to automatically update the provider and trigger UI notifications when VoiceService disables ElevenLabs.
- Updated the `StatusBar` component in [DesktopPanels.tsx](file:///c:/Users/user/Desktop/moni/src/presentation/ui5/components/DesktopPanels.tsx) to subscribe to `moniRuntime` updates and render the active provider: `🗣️ TTS: {runtimeState.ttsProvider}` dynamically.

---

## Verification Summary
1. Build compiled successfully (`npm run build`).
2. Run `npm run dev:full`.
3. Terminal logs outputted exactly once:
   ```
   ELEVENLABS_DISABLED_SESSION
   Browser TTS Active
   ```
4. Fast Refresh warnings have been fully resolved.
5. MoniRuntime instance count remains at exactly `1`.
