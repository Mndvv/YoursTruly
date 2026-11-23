import type { WordToken } from "../domain/WordToken";

export interface AutoPauseTrigger {
  wordId: string;
  wordText: string;
  triggerTimeMs: number;
}

export class AutoPauseController {
  private enabled: boolean;
  private readonly pausedWordIds: Set<string> = new Set();

  constructor(enabled = true) {
    this.enabled = enabled;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public setEnabled(value: boolean): void {
    this.enabled = value;
  }

  public checkAutoPause(
    activeWord: WordToken | null,
    isGap: boolean,
    isSolved: boolean,
    currentTimeMs: number,
  ): AutoPauseTrigger | null {
    if (!this.enabled || !activeWord || !isGap || isSolved) {
      return null;
    }

    const endMs = activeWord.getEndMs();
    if (endMs === null) return null;

    const wordId = activeWord.getId();
    if (this.pausedWordIds.has(wordId)) {
      return null;
    }

    // Trigger pause right as the word boundary ends
    if (currentTimeMs >= endMs) {
      this.pausedWordIds.add(wordId);
      return {
        wordId,
        wordText: activeWord.getText(),
        triggerTimeMs: currentTimeMs,
      };
    }

    return null;
  }

  public markSolved(wordId: string): void {
    this.pausedWordIds.delete(wordId);
  }

  public reset(): void {
    this.pausedWordIds.clear();
  }
}
