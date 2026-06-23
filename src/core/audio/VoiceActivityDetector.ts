export class VoiceActivityDetector {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private microphone: MediaStreamAudioSourceNode | null = null;
  private javascriptNode: ScriptProcessorNode | null = null;
  private isDetecting: boolean = false;

  public startDetection(
    stream: MediaStream,
    onSpeechDetected: () => void,
    onSilenceDetected: () => void
  ): void {
    if (this.isDetecting) return;

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      this.audioContext = new AudioCtx();
      this.analyser = this.audioContext.createAnalyser();
      this.microphone = this.audioContext.createMediaStreamSource(stream);
      this.javascriptNode = this.audioContext.createScriptProcessor(2048, 1, 1);

      this.analyser.smoothingTimeConstant = 0.8;
      this.analyser.fftSize = 1024;

      this.microphone.connect(this.analyser);
      this.analyser.connect(this.javascriptNode);
      this.javascriptNode.connect(this.audioContext.destination);

      let silenceCount = 0;
      let speechCount = 0;
      const silenceThreshold = 10; // lower volume threshold
      const silenceDuration = 15;  // ticks to confirm silence

      this.javascriptNode.onaudioprocess = () => {
        const array = new Uint8Array(this.analyser!.frequencyBinCount);
        this.analyser!.getByteFrequencyData(array);
        let values = 0;

        const length = array.length;
        for (let i = 0; i < length; i++) {
          values += array[i];
        }

        const average = values / length;

        if (average > silenceThreshold) {
          speechCount++;
          silenceCount = 0;
          if (speechCount > 2) {
            onSpeechDetected();
          }
        } else {
          silenceCount++;
          speechCount = 0;
          if (silenceCount > silenceDuration) {
            onSilenceDetected();
          }
        }
      };

      this.isDetecting = true;
    } catch (_) {
      this.isDetecting = false;
    }
  }

  public stopDetection(): void {
    this.isDetecting = false;
    if (this.javascriptNode) {
      this.javascriptNode.onaudioprocess = null;
      try { this.javascriptNode.disconnect(); } catch (_) {}
    }
    if (this.microphone) {
      try { this.microphone.disconnect(); } catch (_) {}
    }
    if (this.audioContext && this.audioContext.state !== 'closed') {
      try { this.audioContext.close(); } catch (_) {}
    }
  }
}
