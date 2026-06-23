export class WakeWord {
  private recognition: any = null;
  private isListening: boolean = false;
  private wakeWords: string[] = ['moni', 'muni', 'money', 'heymoni', 'hey moni', 'moly', 'monic'];

  constructor() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'tr-TR';
    }
  }

  public startListening(
    onDetected: () => void,
    onError: (err: any) => void
  ): void {
    if (!this.recognition || this.isListening) return;

    this.recognition.onresult = (event: any) => {
      const resultsLength = event.results.length;
      for (let i = event.resultIndex; i < resultsLength; i++) {
        const transcript = event.results[i][0].transcript.toLowerCase().trim();
        const hasWakeWord = this.wakeWords.some(w => transcript.includes(w));
        if (hasWakeWord) {
          onDetected();
          break;
        }
      }
    };

    this.recognition.onerror = (event: any) => {
      // Ignore common network or silent recognition issues during wake listening
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        onError(event);
      }
    };

    this.recognition.onend = () => {
      if (this.isListening) {
        try {
          this.recognition.start();
        } catch (_) {}
      }
    };

    try {
      this.isListening = true;
      this.recognition.start();
    } catch (e) {
      this.isListening = false;
      onError(e);
    }
  }

  public stopListening(): void {
    this.isListening = false;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (_) {}
    }
  }
}
