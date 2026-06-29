# MONI 1.0 User Guide

Welcome to **MONI 1.0** — your local-first intelligent assistant companion!

---

## 1. Quick Start
1. Launch the application.
2. Open the page in your browser: **[http://localhost:3001](http://localhost:3001)**.
3. **Important:** Click **"Tarayıcı Ses Testi"** in the voice panel or settings to enable browser audio output.
4. Verify you hear: *"Ses testi başarılı."*

---

## 2. Key Voice Features
- **Wake Word (Uyandırma):** Say **"Moni"** to activate the assistant.
- **Greeting:** MONI answers: *"Buradayım Metin, seni dinliyorum."*
- **Command Capture:** Speak your command immediately without saying "Moni" again.
- **Silence Detection:** Speech Recognition will automatically wait until MONI's speech synthesis completes before listening, preventing self-feedback loops.

---

## 3. UI Controls
- **🔊 Dinle:** Click this under any assistant chat bubble to re-play the message aloud.
- **🗑️ Geçmişi Temizle:** Reset your active chat bubble stream at any time using the clear history button in Settings (available on desktop and mobile).
- **Hafızayı Sıfırla:** Clear saved profile facts (such as name, job, habits) in SQLite memory settings.
