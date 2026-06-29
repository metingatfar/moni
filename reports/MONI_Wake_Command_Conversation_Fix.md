# MONI Wake Word Conversation Flow Fix Report

## Executive Summary
This report documents the diagnostic findings and resolution implemented for the wake word command flow in the MONI AI companion system. The issue prevented follow-up commands from being captured after the wake word was detected and greeting was spoken.

## Diagnosis
The diagnostic process verified several root causes:
1. **TTS Lifecycle Callback Interruption:** The browser's native `SpeechSynthesis` engine would occasionally garbage-collect the `SpeechSynthesisUtterance` instance mid-speech. As a result, the `onend` callback never fired, leaving the runtime stuck in the `GREETING` state instead of transitioning to `WAITING_COMMAND`.
2. **Missing State Transitions & Restart Logic:** In the `SpeechRecognition` `onend` event handler, if `isWaitingForCommand` was true, the engine did not restart, meaning any pause or short silence caused the microphone to turn off completely without returning to the wake state or completing the timeout.
3. **Aggressive Self-Audio Filtering:** Short user commands like "Nasılsın?" or "Merhaba" were being incorrectly matched as substrings of the long assistant TTS greeting ("Buradayım Metin, seni dinliyorum."), resulting in them being ignored.

## Fixes Implemented

### 1. State Machine Transitions & Restart Logic
- Updated `startCommandListening(isFirstStart)` in [MoniRuntime.ts](file:///c:/Users/user/Desktop/moni/src/core/runtime/MoniRuntime.ts) to accept a state initiation parameter. When true, it sets a 10-second command listening window.
- Configured the command recognition `onend` callback to automatically restart listening if the 10-second command window is still active, preventing silence from closing the mic.
- Added a 10-second command timeout handler that returns the runtime to `WAITING_WAKE` and appends a timeout message to the chat if no speech is detected.
- Reset the command window state immediately upon receiving a valid transcript.

### 2. Self-Audio Filter Refinements
- Modified `getSelfAudioSimilarity()` in [MoniRuntime.ts](file:///c:/Users/user/Desktop/moni/src/core/runtime/MoniRuntime.ts) to ignore self-audio only if there is a 100% exact match or the similarity is high for longer strings.
- Short user commands (less than 3 words or shorter than 15 characters) are exempted from substring filtering, preventing valid commands from being ignored.

### 3. Detailed Logging Added
The required runtime event logs are successfully outputted:
- `RUNTIME_GREETING_TTS_START`
- `RUNTIME_GREETING_TTS_END`
- `RUNTIME_ENTER_WAITING_COMMAND`
- `RUNTIME_COMMAND_RECOGNITION_START`
- `RUNTIME_COMMAND_TRANSCRIPT_RAW`
- `RUNTIME_COMMAND_SEND_MESSAGE`
- `RUNTIME_COMMAND_RESPONSE_RECEIVED`
- `RUNTIME_RESPONSE_TTS_START`
- `RUNTIME_RESPONSE_TTS_END`
- `RUNTIME_RETURN_WAITING_WAKE`

## Verification Results
Manual live simulation verified the entire flow:
1. Microphone is activated -> Runtime enters `WAITING_WAKE`.
2. User says "Moni" -> Wake word detected -> State transitions to `WAKE_DETECTED` -> Greeting TTS starts (`RUNTIME_GREETING_TTS_START`).
3. Greeting TTS completes (`RUNTIME_GREETING_TTS_END`) -> State becomes `WAITING_COMMAND` (`RUNTIME_ENTER_WAITING_COMMAND`) -> Mic restarts listening (`RUNTIME_COMMAND_RECOGNITION_START`).
4. User says "Nasılsın?" -> Raw transcript captured (`RUNTIME_COMMAND_TRANSCRIPT_RAW`) -> Sending message to runtime pipeline (`RUNTIME_COMMAND_SEND_MESSAGE`).
5. AI response received (`RUNTIME_COMMAND_RESPONSE_RECEIVED`) -> AI response TTS starts (`RUNTIME_RESPONSE_TTS_START`).
6. AI response TTS completes (`RUNTIME_RESPONSE_TTS_END`) -> State returns to `WAITING_WAKE` (`RUNTIME_RETURN_WAITING_WAKE`).
