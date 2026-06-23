import { SpeechSynthesizer } from './SpeechSynthesizer';
import type { VoiceProfile } from './SpeechSynthesizer';

export class AudioQueue {
  private queue: string[] = [];
  private isPlaying: boolean = false;
  private synthesizer: SpeechSynthesizer;
  private currentProfile: VoiceProfile = 'selin';

  constructor(synthesizer: SpeechSynthesizer) {
    this.synthesizer = synthesizer;
  }

  public enqueue(text: string): void {
    this.queue.push(text);
    if (!this.isPlaying) {
      this.playNext();
    }
  }

  public setProfile(profile: VoiceProfile): void {
    this.currentProfile = profile;
  }

  public clear(): void {
    this.queue = [];
    this.isPlaying = false;
    this.synthesizer.cancel();
  }

  private async playNext(): Promise<void> {
    if (this.queue.length === 0) {
      this.isPlaying = false;
      return;
    }

    this.isPlaying = true;
    const nextText = this.queue.shift();
    if (nextText) {
      try {
        await this.synthesizer.speak(
          nextText,
          this.currentProfile,
          () => {
            this.playNext();
          },
          undefined,
          () => {
            this.playNext();
          }
        );
      } catch (_) {
        this.playNext();
      }
    }
  }
}
