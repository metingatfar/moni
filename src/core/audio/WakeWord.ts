export class WakeWord {
  public startListening(
    _onDetected: () => void,
    onError: (err: any) => void
  ): void {
    onError(new Error('Legacy WakeWord is disabled. Use MoniRuntime instead.'));
  }

  public stopListening(): void {}
}
