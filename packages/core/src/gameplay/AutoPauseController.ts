import type { WordTokenData } from "@yourstruly/contracts";
import { WordToken } from "../domain/WordToken";

export type PauseMode = "strict" | "verse_loop" | "continuous";

export interface AutoPauseTrigger {
  wordId: string;
  wordText: string;
  triggerTimeMs: number;
}

export interface VerseRewindCheck {
  lineId: string;
  lineStartMs: number | null;
  lineEndMs: number | null;
  unsolvedGapCount: number;
  currentTimeMs: number;
  maxRetries?: number;
}

export interface VerseRewindTrigger {
  lineId: string;
  rewindToMs: number;
  triggerTimeMs: number;
  retryCount: number;
  shouldSkipVerse: boolean;
}

export class AutoPauseController {
  private pauseMode: PauseMode;
  private readonly pausedWordIds: Set<string> = new Set();
  private readonly verseRetryCounts: Map<string, number> = new Map();
  private readonly rewoundLines: Set<string> = new Set();

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
    const wordId = token.getId();
    if (endMs === null || this.pausedWordIds.has(wordId)) return null;

    if (currentTimeMs >= endMs - 60) {
      this.pausedWordIds.add(wordId);
      return { wordId, wordText: token.getText(), triggerTimeMs: currentTimeMs };
    }

    return null;
  }

  public checkVerseRewind(check: VerseRewindCheck): VerseRewindTrigger | null {
    const {
      lineId,
      lineStartMs,
      lineEndMs,
      unsolvedGapCount,
      currentTimeMs,
      maxRetries = 2,
    } = check;
    if (this.pauseMode !== "verse_loop" || unsolvedGapCount === 0) return null;
    if (lineEndMs === null || lineStartMs === null) return null;

    if (currentTimeMs < lineEndMs - 200) {
      this.rewoundLines.delete(lineId);
      return null;
    }
    if (currentTimeMs < lineEndMs - 80 || this.rewoundLines.has(lineId)) {
      return null;
    }

    this.rewoundLines.add(lineId);
    const currentRetries = this.verseRetryCounts.get(lineId) ?? 0;
    if (currentRetries >= maxRetries) {
      this.verseRetryCounts.delete(lineId);
      return {
        lineId,
        rewindToMs: lineStartMs,
        triggerTimeMs: currentTimeMs,
        retryCount: currentRetries + 1,
        shouldSkipVerse: true,
      };
    }

    this.verseRetryCounts.set(lineId, currentRetries + 1);
    return {
      lineId,
      rewindToMs: lineStartMs,
      triggerTimeMs: currentTimeMs,
      retryCount: currentRetries + 1,
      shouldSkipVerse: false,
    };
  }

  public markSolved(wordId: string): void {
    this.pausedWordIds.delete(wordId);
  }

  public markVerseCleared(lineId: string): void {
    this.verseRetryCounts.delete(lineId);
    this.rewoundLines.delete(lineId);
  }

  public reset(): void {
    this.pausedWordIds.clear();
    this.verseRetryCounts.clear();
    this.rewoundLines.clear();
  }
}
