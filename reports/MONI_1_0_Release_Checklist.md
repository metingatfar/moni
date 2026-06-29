# MONI 1.0 Release Checklist

This document acts as the final verification sheet for the MONI 1.0 stable release candidate.

## 1. Stability Verification Check
- [x] **Browser TTS Working:** Direct speechSynthesis plays Turkish audio.
- [x] **ElevenLabs Disabled:** Bypassed unless manually re-enabled in options.
- [x] **No Cooldown Fallback Loops:** Rachel voice query or 401/402 retries are stopped.
- [x] **Wake Word Integrity:** Recognition starts strictly 1000ms after TTS speaking is completed, avoiding self-listening loops.
- [x] **Chat Offline Capability:** Local secretary rules and memories work offline.
- [x] **Error Cleanliness:** Groq 429 errors display a polite Turkish message instead of raw JSON.

## 2. UI/UX and Actions Check
- [x] **Tarayıcı Ses Testi Button:** Working in desktop panel, settings, and mobile views.
- [x] **🔊 Dinle Button:** Wired up to `VoiceService.speakBrowser(m.content)`.
- [x] **🗑️ Sohbet Geçmişini Temizle Button:** Available in settings for desktop and mobile views.
- [x] **Layout Fit:** Desktop and Mobile views render without overlay conflicts.

## 3. Build & Package Check
- [x] **Vite Bundle Build:** Proved successful compilation with `npm run build`.
- [x] **Server Health Check:** `/api/health` endpoint is fully responsive.
- [x] **Capacitor Android & iOS Sync:** Capacitor assets synced to both platforms cleanly.
