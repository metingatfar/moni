# MONI Runtime Core Refactor — Single Pipeline Architecture Report

## Overview
This report details the architectural unification of the voice interaction and command processing pipelines under a single runtime orchestrator: `MoniRuntime.ts`. 

Previously, SpeechRecognition, VoiceService, WakeWord, and the MoniInteractionCoordinator operated independently, leading to duplicate listeners, concurrent microphone instantiations, race conditions, and voice echo loopbacks.

## Unification Architecture
`MoniRuntime` now acts as the **exclusive** pipeline controller:

```
[UI Components / Views]
        │ (sendMessage, start, stop, activateVoice)
        ▼
   [MoniRuntime] ◄───► [VoiceService (Single Instance)]
        │
        ├─► [SpeechRecognition (Single Instance)]
        ├─► [Microphone Tracks Constraint Ref]
        ├─► [Local Soru-Cevap (Knowledge Core)]
        └─► [ExecutiveBrain (AI Orchestrator)]
```

### Key Refactor Details
1. **Single SpeechRecognition Lifecycle**:
   - `MoniRuntime` owns the single `SpeechRecognition` instance and re-assigns its event listeners dynamically depending on the state (wake word vs. command listening).
   - Removed all `startLocalListening`, `stopLocalListening`, `startWakeWordRecognition`, and `onend` restarts from view files.
   - Closed track references inside `stop()` to release hardware microphone slots properly.

2. **Legacy Class Stubbing**:
   - `SpeechRecognizer.ts` and `WakeWord.ts` classes have been stubbed and return errors when initialization is attempted, ensuring zero hidden/duplicate SpeechRecognition instantiations exist.

3. **Migrated Coordination Layer**:
   - Integrated the pipeline routing from `MoniInteractionCoordinator.ts` directly into `MoniRuntime.ts`.
   - The coordinator file has been deleted.

4. **UI Integration Bridge**:
   - Exposes clean control interfaces: `runtime.start()`, `runtime.stop()`, `runtime.sendMessage(text)`, `runtime.activateVoice()`, `runtime.deactivateVoice()`.
   - `ChatProvider.tsx` acts as a reactive bridge: it subscribes to `MoniRuntime` state changes and propagates updates to React Context state variables, leaving view rendering logic completely decoupled from backend flow controls.
