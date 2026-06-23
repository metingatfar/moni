export class SpeechRecognizer {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private recognition: any = null;

  constructor() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.lang = 'tr-TR';
      this.recognition.interimResults = false;
    }
  }

  public isBrowserSpeechSupported(): boolean {
    return !!this.recognition;
  }

  /**
   * Starts recording using media recorder for server-side Deepgram STT processing.
   */
  public async startRecording(
    onStop: (audioBlob: Blob) => void,
    onError: (err: any) => void
  ): Promise<void> {
    try {
      this.audioChunks = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        stream.getTracks().forEach(track => track.stop());
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
        onStop(audioBlob);
      };

      this.mediaRecorder.start();
    } catch (e) {
      onError(e);
    }
  }

  public stopRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.stop();
    }
  }

  /**
   * Starts speech recognition using local browser Web Speech API.
   */
  public startLocalListening(
    onResult: (transcript: string) => void,
    onError: (err: any) => void,
    onEnd?: () => void
  ): void {
    if (!this.recognition) {
      onError(new Error('Speech recognition not supported in this browser.'));
      return;
    }

    this.recognition.onresult = (event: any) => {
      const transcript = event.results[0]?.[0]?.transcript || '';
      onResult(transcript);
    };

    this.recognition.onerror = (event: any) => {
      onError(event);
    };

    if (onEnd) {
      this.recognition.onend = onEnd;
    }

    try {
      this.recognition.start();
    } catch (e) {
      onError(e);
    }
  }

  public stopLocalListening(): void {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (_) {}
    }
  }
}
