import type { LyricLine } from "../domain/LyricLine";
import type { WordToken } from "../domain/WordToken";

export interface SyncClockState {
  activeLine: LyricLine | null;
  activeWord: WordToken | null;
  lineIndex: number;
  wordIndex: number;
  effectiveTimeMs: number;
}

export class SyncClockEngine {
  public resolveState(
    lines: readonly LyricLine[],
    currentTimeMs: number,
    globalOffsetMs = 0,
  ): SyncClockState {
    const effectiveTimeMs = Math.max(0, currentTimeMs + globalOffsetMs);
    const lineIndex = this.findLineIndex(lines, effectiveTimeMs);
    const activeLine = lineIndex >= 0 ? lines[lineIndex] : null;

    if (!activeLine) {
      return { activeLine: null, activeWord: null, lineIndex: -1, wordIndex: -1, effectiveTimeMs };
    }

    const wordIndex = this.findWordIndex(activeLine.getWords(), effectiveTimeMs);
    const activeWord = wordIndex >= 0 ? activeLine.getWords()[wordIndex] : null;

    return {
      activeLine,
      activeWord,
      lineIndex,
      wordIndex,
      effectiveTimeMs,
    };
  }

  private findLineIndex(lines: readonly LyricLine[], timeMs: number): number {
    return lines.findIndex((l) => {
      const start = l.getStartMs();
      const end = l.getEndMs();
      if (start === null || end === null) return false;
      return timeMs >= start && timeMs <= end;
    });
  }

  private findWordIndex(words: readonly WordToken[], timeMs: number): number {
    return words.findIndex((w) => {
      const start = w.getStartMs();
      const end = w.getEndMs();
      if (start === null || end === null) return false;
      return timeMs >= start && timeMs <= end;
    });
  }
}
