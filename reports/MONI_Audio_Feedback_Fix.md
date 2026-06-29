# MONI Audio Feedback Fix Report

This report documents the fixes applied to resolve the critical audio feedback loop (self-listening) in the MONI application.

## Problem Description
The SpeechRecognition engine was listening to MONI's own voice synthesis (TTS) output instead of the user. This created a self-recognition audio feedback loop where MONI would continuously hear its own spoken response (e.g., "nasıl yardımcı olabilirim"), recognize it as user input, trigger a new assistant greeting, and speak again.

## Fix Implementation

1. **Active Microphone Constraint Settings**:
   - Explicitly configured the media stream constraints to enforce hardware/browser-level echo cancellation, noise suppression, and automatic gain control:
     ```javascript
     navigator.mediaDevices.getUserMedia({
       audio: {
         echoCancellation: true,
         noiseSuppression: true,
         autoGainControl: true
       }
     })
     ```
   - Persisted the stream inside a reference (`micStreamRef`) to prevent garbage collection and ensure that the browser's audio processing engine remains active for the SpeechRecognition session.

2. **Substring & Word Overlap Ignored Speech Engine**:
   - Replaced basic edit distance similarity checks with a multi-layered text similarity algorithm (`getSelfAudioSimilarity`):
     - Normalizes Turkish letters (`ı -> i`, `ş -> s`, etc.) and strips all punctuation.
     - Performs a direct substring inclusion check: if the cleaned transcript is contained within the last assistant TTS response (or vice versa), the similarity is flagged as 1.0 (100% match).
     - Performs word overlap calculation: if more than 80% of the transcribed words are found within the last assistant TTS words, the similarity is marked above 90% and rejected.
   - When a match is detected:
     - The transcript is completely discarded.
     - Wake word matching and coordinator pipelines are blocked from executing.
     - Logs `WAKE_DEBUG_SELF_AUDIO_IGNORED` to the console.
