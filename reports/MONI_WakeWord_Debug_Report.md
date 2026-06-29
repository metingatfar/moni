# MONI Wake Word Debug Report

This report logs the speech recognition triggers for wake word detection.

## Debugging Pipeline Action Logs

1. **Wake Word Started**:
   - Logged when `isWakeWordListening` is checked true in context.
   - Activates `SpeechRecognition` continuous transcript capture.

2. **Wake Word Detected**:
   - Triggers when hearing `Moni`, `Hey Moni`, or similar.
   - Speech synthesis returns "Sizi dinliyorum." and loops to `startCommandListening`.

3. **STT Complete**:
   - Captures user command and routes request through `moniInteractionCoordinator`.
