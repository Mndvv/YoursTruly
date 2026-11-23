import type { LyricLineData, WordTokenData } from "@yourstruly/contracts";
import type { LyricLine } from "../domain/LyricLine";
import type { WordToken } from "../domain/WordToken";

export type LyricLineLike = LyricLine | LyricLineData;
export type WordTokenLike = WordToken | WordTokenData;

export interface SyncClockState {
  activeLine: LyricLineLike | null;
  activeWord: WordTokenLike | null;
  lineIndex: number;
  wordIndex: number;
  effectiveTimeMs: number;
}

export class SyncClockEngine {
  public resolveState(
    lines: readonly LyricLineLike[],
    currentTimeMs: number,
    globalOffsetMs = 0,
  ): SyncClockState {
    const effectiveTimeMs = Math.max(0, currentTimeMs + globalOffsetMs);
    const lineIndex = this.findLineIndex(lines, effectiveTimeMs);
    const activeLine = lineIndex >= 0 ? lines[lineIndex] : null;

    if (!activeLine) {
      return { activeLine: null, activeWord: null, lineIndex: -1, wordIndex: -1, effectiveTimeMs };
    }

    const words = this.getLineWords(activeLine);
    const wordIndex = this.findWordIndex(words, effectiveTimeMs);
    const activeWord = wordIndex >= 0 ? words[wordIndex] : null;

    return {
      activeLine,
      activeWord,
      lineIndex,
      wordIndex,
      effectiveTimeMs,
    };
  }

  private findLineIndex(lines: readonly LyricLineLike[], timeMs: number): number {
    return lines.findIndex((l) => {
      const { start, end } = this.getLineBounds(l);
      if (start === null || end === null) return false;
      return timeMs >= start && timeMs <= end;
    });
  }

  private findWordIndex(words: readonly WordTokenLike[], timeMs: number): number {
    return words.findIndex((w) => {
      const { start, end } = this.getWordBounds(w);
      if (start === null || end === null) return false;
      return timeMs >= start && timeMs <= end;
    });
  }

  private getLineBounds(l: LyricLineLike): { start: number | null; end: number | null } {
    const start =
      typeof (l as LyricLine).getStartMs === "function"
        ? (l as LyricLine).getStartMs()
        : (l as LyricLineData).startMs;
    const end =
      typeof (l as LyricLine).getEndMs === "function"
        ? (l as LyricLine).getEndMs()
        : (l as LyricLineData).endMs;
    return { start, end };
  }

  private getLineWords(l: LyricLineLike): readonly WordTokenLike[] {
    return typeof (l as LyricLine).getWords === "function"
      ? (l as LyricLine).getWords()
      : (l as LyricLineData).words;
  }

  private getWordBounds(w: WordTokenLike): { start: number | null; end: number | null } {
    const start =
      typeof (w as WordToken).getStartMs === "function"
        ? (w as WordToken).getStartMs()
        : (w as WordTokenData).startMs;
    const end =
      typeof (w as WordToken).getEndMs === "function"
        ? (w as WordToken).getEndMs()
        : (w as WordTokenData).endMs;
    return { start, end };
  }
}
