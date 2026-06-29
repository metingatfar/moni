# MONI STT & TTS Synchronization Report

This report documents the synchronization locks and lifecycle management of Speech to Text (SpeechRecognition) and Text to Speech (VoiceService) to prevent simultaneous executions.

## Problem Description
To prevent MONI from listening to itself or encountering audio loops, the SpeechRecognition listener must be paused during any spoken output and restarted safely only after the voice output completes.

## Synchronization Locks

1. **State-Driven Automatic Pause**:
   - Subscribed to the global `moni_voice_state_changed` event broadcasted by `VoiceService`.
   - When a TTS query starts (`speaking` or `preparing`), both `wakeRecognitionRef` and `commandRecRef` are stopped immediately.
   - The Current Recognition State updates to `Paused (TTS)`.

2. **Ref-Based Synchronous Guards**:
   - Implemented an `isStartingOrRunning` ref synchronously checked at the top of the start handlers. This avoids race conditions during permission query yields.
   - An `isTtsActive()` check queries `window.moniVoiceState` directly to ensure no recognition starts while TTS is active.

3. **Cool-down Restart**:
   - When a TTS query transitions to `idle` or `cancelled`, a `700ms` cool-down is scheduled.
   - The Current Recognition State updates to `Restarting`.
   - Once completed, the app determines the next step:
     - If `isWaitingForCommand` is true (after MONI's greeting), it starts the command listener.
     - Otherwise, it restarts the wake word listener safely.
