# MONI AI OS — Language Switcher & Wake Word Response Implementation Report

This report documents the implementation of the global translation system and wake word response system for **MONI AI OS**.

---

## 1. Global Language Switcher (TR / EN)

### Architectural Approach
We built an extensible `i18n` dictionary framework from scratch (to align with the pure-client codebase without introducing heavy dependencies):
- **Localization Files**: Created separate language modules inside `src/i18n`:
  - `tr.ts` — Complete Turkish translations matching all left sidebar items, header cards, dashboard tabs, setting toggles, marketplace search fields, and console options.
  - `en.ts` — Complete English translations corresponding to the exact keys.
  - `index.ts` — Exposes the lookup method `getTranslation(lang, key)`.
- **Global State**: Managed within `MoniDashboard.tsx` with a synchronized `currentLanguage` state, persisting user preference locally in `localStorage` under key `moni_language`.
- **UI Integration**:
  - Inserted a sleek glassmorphism-themed `TR | EN` switcher widget into both the **Mobile Header** and **Desktop Header**.
  - Wrapped UI strings in dynamic translation wrappers using `t('key')`.
  - Added a **Language Selection Card** in the System Settings tab allowing easy switching and persisting selections seamlessly across refreshes.

---

## 2. Dynamic Wake Word Response & Speech Recognition

### Text Normalization
Turkish is a dotted/dotless character language (specifically dotless `ı` vs dotted `i`). Under standard Webkit Speech Recognition engines, transcripts can be mismatching depending on local system locales.
- **Normalization Pipeline**: Added a transcript sanitization utility which lowercases input and standardizes character sets (e.g., mapping dotless `ı` to `i`, `ş` -> `s`, `ç` -> `c`, `ğ` -> `g`, `ö` -> `o`, `ü` -> `u`).
- **Wake Word Detection**: The sanitized transcript is scanned for: `moni`, `hey moni`, `merhaba moni`, `hello moni`.

### Localized Voice Triggers
When a wake word is caught, MONI triggers the following:
1. **Chat Feed Append**: Saves the vocal greeting message to the UI feed and persists it into the SQLite/indexed database via `databaseService.saveChatMessage()`.
2. **Hardcoded User Greeting**:
   - **Turkish (TR)**: *"Buradayım Metin, nasıl yardımcı olayım?"*
   - **English (EN)**: *"I'm here Metin, how can I help?"*
3. **Orb Anim & Mood Switch**: Elevates Orb animation to `'speaking'` state and avatar mood to `'alert'`.
4. **Vocal TTS Fallback Engine**:
   - Fetches and caches local synthesis tables.
   - Automatically detects active language from `localStorage` and binds the corresponding voice (`tr-TR` vs `en-US`).
   - Prioritizes female voices (e.g. Yelp, Microsoft Zira, Google Türkçe) while offering clean fallbacks for non-female/generic voices.

---

## 3. Voice Status Diagnostics
We designed and implemented a dynamic **Voice Status Panel** (rendered both on the main Dashboard and in the Settings panel) displaying real-time hardware and configuration statuses:
1. **Wake Word Listening**: Checks if background wake detection is active.
2. **Microphone Ready**: Diagnostic check for browser support of `SpeechRecognition`/`webkitSpeechRecognition`.
3. **Voice Response Ready**: Diagnostic check for `SpeechSynthesis` support.
4. **TTS Fallback Active**: Status reporting whether local Web SpeechSynthesis fallback is active (typically true when Gemini API key is absent or local TTS is selected).

---

## 4. Build & Verification Status
- Checked and resolved all compile errors, including type scope errors and unused imports.
- Built successfully using:
  ```bash
  npm run build
  ```
  - **Result**: `dist/index.html` and compilation bundle built in 7.02 seconds, fully synchronized with Capacitor native wrappers.
