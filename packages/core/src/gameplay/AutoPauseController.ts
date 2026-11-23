import type { WordTokenData } from "@yourstruly/contracts";
import { WordToken } from "../domain/WordToken";

export type PauseMode = "strict" | "verse_loop" | "continuous";

export interface AutoPauseTrigger {
  wordId: string;
  wordText: string;
  triggerTimeMs: number;
}

export interface VerseRewindTrigger {
  lineId: string;
  rewindToMs: number;
  triggerTimeMs: number;
}

export class AutoPauseController {
  private pauseMode: PauseMode;
  private readonly pausedWordIds: Set<string> = new Set();
  private readonly rewoundLineIds: Set<string> = new Set();

  constructor(pauseMode: PauseMode = "verse_loop") {
    this.pauseMode = pauseMode;
  }

  public getPauseMode(): PauseMode {
    return this.pauseMode;
  }

  public setPauseMode(mode: PauseMode): void {
    this.pauseMode = mode;
  }

  public checkWordAutoPause(
    activeWord: WordToken | WordTokenData | null,
    isGap: boolean,
    isSolved: boolean,
    currentTimeMs: number,
  ): AutoPauseTrigger | null {
    if (this.pauseMode !== "strict" || !activeWord || !isGap || isSolved) {
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

    // Trigger pause at the word boundary (with a 60ms tolerance window)
    if (currentTimeMs >= endMs - 60) {
      this.pausedWordIds.add(wordId);
      return {
        wordId,
        wordText: token.getText(),
        triggerTimeMs: currentTimeMs,
      };
    }

    return null;
  }

  public checkVerseRewind(
    lineId: string,
    lineStartMs: number | null,
    lineEndMs: number | null,
    unsolvedGapCount: number,
    currentTimeMs: number,
  ): VerseRewindTrigger | null {
    if (this.pauseMode !== "verse_loop" || unsolvedGapCount === 0) {
      return null;
    }
    if (lineEndMs === null || lineStartMs === null) return null;
    if (this.rewoundLineIds.has(lineId)) return null;

    // Trigger rewind near the end of the line
    if (currentTimeMs >= lineEndMs - 80) {
      this.rewoundLineIds.add(lineId);
      return {
        lineId,
        rewindToMs: lineStartMs,
        triggerTimeMs: currentTimeMs,
      };
    }

    return null;
  }

  public markSolved(wordId: string): void {
    this.pausedWordIds.delete(wordId);
  }

  public markVerseCleared(lineId: string): void {
    this.rewoundLineIds.delete(lineId);
  }

  public reset(): void {
    this.pausedWordIds.clear();
    this.rewoundLineIds.clear();
  }
}
