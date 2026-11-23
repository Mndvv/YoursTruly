import type { LyricaDataPayload, LyricaLineItem } from "@yourstruly/contracts";
import { LyricLine } from "../domain/LyricLine";
import { SongLyrics } from "../domain/SongLyrics";
import { WordToken } from "../domain/WordToken";
import type { ILyricsNormalizationStrategy } from "./ILyricsNormalizationStrategy";

export class WordSyncedLyricaStrategy implements ILyricsNormalizationStrategy {
  public canHandle(payload: LyricaDataPayload): boolean {
    const lines = this.getLines(payload);
    if (lines.length === 0) return false;
    return lines.some(
      (line) =>
        Array.isArray(line.words) && line.words.length > 0 && line.words[0].start !== undefined,
    );
  }

  public normalize(payload: LyricaDataPayload): SongLyrics {
    const rawLines = this.getLines(payload);
    const romanizedLines = this.splitRomanized(payload.romanized_lyrics);

    const lines = rawLines.map((rawLine, lineIdx) => {
      const lineId = rawLine.id ?? `line_${lineIdx + 1}`;
      const lineWords = (rawLine.words ?? []).map((w, wordIdx) => {
        return new WordToken({
          id: `${lineId}_w${wordIdx + 1}`,
          text: w.word,
          startMs: w.start,
          endMs: w.end,
          isGapEligible: w.word.trim().length > 1,
        });
      });

      return new LyricLine({
        id: lineId,
        startMs: rawLine.start_time ?? lineWords[0]?.getStartMs() ?? null,
        endMs: rawLine.end_time ?? lineWords[lineWords.length - 1]?.getEndMs() ?? null,
        text: rawLine.text,
        transliteration: romanizedLines[lineIdx] ?? null,
        words: lineWords,
      });
    });

    return new SongLyrics({
      source: payload.source,
      syncLevel: "word",
      hasTransliteration: romanizedLines.length > 0,
      lines,
    });
  }

  private getLines(payload: LyricaDataPayload): LyricaLineItem[] {
    if (Array.isArray(payload.timed_lyrics) && payload.timed_lyrics.length > 0) {
      return payload.timed_lyrics;
    }
    if (Array.isArray(payload.lyrics)) {
      return payload.lyrics;
    }
    return [];
  }

  private splitRomanized(romanized?: string): string[] {
    if (!romanized) return [];
    return romanized
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
  }
}
