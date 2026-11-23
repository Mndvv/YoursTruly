import type { LyricLineData, LyricsData, WordTokenData } from "@yourstruly/contracts";

export class LyricTimingShifter {
  /**
   * Shifts all line and word timestamps by deltaMs.
   * Timestamps are clamped to a minimum of 0.
   */
  public shiftAllByDelta(lyrics: LyricsData, deltaMs: number): LyricsData {
    if (deltaMs === 0) return lyrics;

    const shiftedLines: LyricLineData[] = lyrics.lines.map((line) => {
      const startMs = line.startMs !== null ? Math.max(0, line.startMs + deltaMs) : null;
      const endMs = line.endMs !== null ? Math.max(0, line.endMs + deltaMs) : null;

      const words: WordTokenData[] = line.words.map((w) => ({
        ...w,
        startMs: w.startMs !== null ? Math.max(0, w.startMs + deltaMs) : null,
        endMs: w.endMs !== null ? Math.max(0, w.endMs + deltaMs) : null,
      }));

      return {
        ...line,
        startMs,
        endMs,
        words,
      };
    });

    return {
      ...lyrics,
      lines: shiftedLines,
    };
  }

  /**
   * Finds the earliest start timestamp among all lines/words,
   * and shifts the entire song so the first lyric starts at targetStartMs.
   */
  public alignStartToTime(lyrics: LyricsData, targetStartMs: number): LyricsData {
    const firstStartMs = this.findEarliestStartMs(lyrics);
    if (firstStartMs === null) {
      return lyrics;
    }

    const deltaMs = targetStartMs - firstStartMs;
    return this.shiftAllByDelta(lyrics, deltaMs);
  }

  /**
   * Returns the earliest startMs found across all lines and words in the song.
   */
  public findEarliestStartMs(lyrics: LyricsData): number | null {
    const lineStarts = lyrics.lines.map((l) => l.startMs).filter((ms): ms is number => ms !== null);

    const wordStarts = lyrics.lines
      .flatMap((l) => l.words)
      .map((w) => w.startMs)
      .filter((ms): ms is number => ms !== null);

    const allStarts = [...lineStarts, ...wordStarts];
    return allStarts.length > 0 ? Math.min(...allStarts) : null;
  }
}
