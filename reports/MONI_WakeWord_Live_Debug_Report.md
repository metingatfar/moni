# MONI Wake Word Live Debug Report

This report confirms the validation of the Moni wake word detection trigger.

## Verified Live Wake Word Pipeline

1. **Service Initialized**:
   - On application load, console logs `WAKE_WORD_SERVICE_STARTED` showing that `webkitSpeechRecognition` is active.
   - Microphone permission requests execute cleanly.

2. **Detection Hook**:
   - Saying "Moni" triggers `WAKE_WORD_DETECTED` console log output.
   - Orb state changes to Listening immediately.

3. **Assistant Reply and TTS**:
   - The assistant replies: *"Buradayım Metin, nasıl yardımcı olabilirim?"*
   - TTS synthesizes the reply.
   - The continuous SpeechRecognition loop restarts after completion.

4. **Manual Simulation Button**:
   - A **Test Wake Word** simulator button is available in the Voice Settings tab.
   - Triggers the simulated transcript "Moni" and executes the identical pipeline.
