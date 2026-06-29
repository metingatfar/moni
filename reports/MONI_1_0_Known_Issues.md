# MONI 1.0 Known Issues

This document records the current known browser constraints and limits of MONI 1.0.

## 1. Browser Speech Autoplay Policy
- **Symptom:** Voice responses from MONI do not play immediately on boot.
- **Cause:** Browsers block programmatic speech synthesis until the user performs a gesture.
- **Remediation:** Click the **"Tarayıcı Ses Testi"** button in settings or the dock panel once upon launch to unlock synthesis.

## 2. Empty Local System Voice Lists
- **Symptom:** Console warns of empty voice counts on page refresh.
- **Cause:** Chrome and Safari load speech engines asynchronously, causing `window.speechSynthesis.getVoices()` to yield empty arrays temporarily on window load.
- **Remediation:** MONI implements `loadAndSelectVoice()` which automatically suspends and retries voice loading when the event `onvoiceschanged` fires.

## 3. Rate Limits (429) Under Heavy Usage
- **Symptom:** Chat shows *"Yapay zeka servis limitleri şu an dolu (429 Kota Aşımı)"* error.
- **Cause:** Third-party cloud providers (Groq/Gemini) throttle frequent API requests.
- **Remediation:** MONI falls back to local SQLite memory retrieval and built-in FAQ rules until the 60-second cooldown expires.
