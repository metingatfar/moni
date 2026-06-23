import { SpeechSynthesizer } from './SpeechSynthesizer';
import { AudioQueue } from './AudioQueue';

export class InterruptManager {
  private synthesizer: SpeechSynthesizer;
  private queue: AudioQueue;

  constructor(synthesizer: SpeechSynthesizer, queue: AudioQueue) {
    this.synthesizer = synthesizer;
    this.queue = queue;
  }

  /**
   * Interrupts current playback immediately.
   */
  public interrupt(): void {
    console.log('[InterruptManager] User interrupted playback. Halting all speech output.');
    this.queue.clear();
    this.synthesizer.cancel();
  }
}
