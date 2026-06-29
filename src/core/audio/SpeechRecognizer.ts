export class SpeechRecognizer {
  public isBrowserSpeechSupported(): boolean {
    return false;
  }

  public async startRecording(
    _onStop: (audioBlob: Blob) => void,
    onError: (err: any) => void
  ): Promise<void> {
    onError(new Error('Legacy SpeechRecognizer is disabled. Use MoniRuntime instead.'));
  }

  public stopRecording(): void {}

  public startLocalListening(
    _onResult: (transcript: string) => void,
    onError: (err: any) => void,
    _onEnd?: () => void
  ): void {
    onError(new Error('Legacy SpeechRecognizer is disabled. Use MoniRuntime instead.'));
  }

  public stopLocalListening(): void {}
}
