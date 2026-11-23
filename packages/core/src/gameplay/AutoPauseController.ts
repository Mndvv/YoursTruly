import type { WordTokenData } from "@yourstruly/contracts";
import { WordToken } from "../domain/WordToken";

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
    activeWord: WordToken | WordTokenData | null,
    isGap: boolean,
    isSolved: boolean,
    currentTimeMs: number,
  ): AutoPauseTrigger | null {
    if (!this.enabled || !activeWord || !isGap || isSolved) {
      return null;
    }

    const token =
      typeof (activeWord as WordToken).getId === "function"
        ? (activeWord as WordToken)
        : WordToken.fromData(activeWord as WordTokenData);

    const endMs = token.getEndMs();
    if (endMs === null) return null;

    const wordId = token.getId();
    if (this.pausedWordIds.has(wordId)) {
      return null;
    }

    // Trigger pause right as the word boundary ends
    if (currentTimeMs >= endMs) {
      this.pausedWordIds.add(wordId);
      return {
        wordId,
        wordText: token.getText(),
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
