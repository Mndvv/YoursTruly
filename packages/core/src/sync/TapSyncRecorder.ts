export interface RecordedWordTiming {
  wordIndex: number;
  startMs: number;
  endMs: number;
}

export class TapSyncRecorder {
  private currentWordIndex = 0;
  private pendingPressStartMs: number | null = null;
  private readonly recordings: Map<number, RecordedWordTiming> = new Map();

  public onTapDown(timestampMs: number): void {
    this.pendingPressStartMs = Math.max(0, Math.round(timestampMs));
  }

  public onTapUp(timestampMs: number): RecordedWordTiming | null {
    if (this.pendingPressStartMs === null) {
      return null;
    }

    const startMs = this.pendingPressStartMs;
    const endMs = Math.max(startMs + 50, Math.round(timestampMs));
    this.pendingPressStartMs = null;

    const timing: RecordedWordTiming = {
      wordIndex: this.currentWordIndex,
      startMs,
      endMs,
    };

    this.recordings.set(this.currentWordIndex, timing);
    this.currentWordIndex += 1;
    return timing;
  }

  public getCurrentWordIndex(): number {
    return this.currentWordIndex;
  }

  public seekToWord(index: number): void {
    if (index < 0) throw new Error("Index cannot be negative");
    this.currentWordIndex = index;
    this.pendingPressStartMs = null;
  }

  public getTiming(wordIndex: number): RecordedWordTiming | null {
    return this.recordings.get(wordIndex) ?? null;
  }

  public getAllTimings(): readonly RecordedWordTiming[] {
    return Array.from(this.recordings.values()).sort((a, b) => a.wordIndex - b.wordIndex);
  }

  public reset(): void {
    this.currentWordIndex = 0;
    this.pendingPressStartMs = null;
    this.recordings.clear();
  }
}
