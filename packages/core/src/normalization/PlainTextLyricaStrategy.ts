import type { LyricaDataPayload, LyricaLineItem } from "@yourstruly/contracts";
import { LyricLine } from "../domain/LyricLine";
import { SongLyrics } from "../domain/SongLyrics";
import { WordToken } from "../domain/WordToken";
import type { ILyricsNormalizationStrategy } from "./ILyricsNormalizationStrategy";

export class PlainTextLyricaStrategy implements ILyricsNormalizationStrategy {
  public canHandle(payload: LyricaDataPayload): boolean {
    if (typeof payload.lyrics === "string") {
      return true;
    }
    if (Array.isArray(payload.lyrics)) {
      return payload.lyrics.every((l) => l.start_time === undefined && !l.words);
    }
    return false;
  }

  public normalize(payload: LyricaDataPayload): SongLyrics {
    const rawLines = this.extractLines(payload.lyrics);
    const romanizedLines = this.splitRomanized(payload.romanized_lyrics);

    const lines = rawLines.map((text, lineIdx) => {
      const lineId = `line_${lineIdx + 1}`;
      const words = text
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .map((w, wordIdx) => {
          return new WordToken({
            id: `${lineId}_w${wordIdx + 1}`,
            text: w,
            startMs: null,
            endMs: null,
            isGapEligible: w.length > 1,
          });
        });

      return new LyricLine({
        id: lineId,
        startMs: null,
        endMs: null,
        text,
        transliteration: romanizedLines[lineIdx] ?? null,
        words,
      });
    });

    return new SongLyrics({
      source: payload.source,
      syncLevel: "plain",
      hasTransliteration: romanizedLines.length > 0,
      lines,
    });
  }

  private extractLines(lyrics: string | LyricaLineItem[]): string[] {
    if (typeof lyrics === "string") {
      return lyrics
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l.length > 0);
    }
    return lyrics.map((item) => item.text.trim()).filter((t) => t.length > 0);
  }

  private splitRomanized(romanized?: string): string[] {
    if (!romanized) return [];
    return romanized
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
  }
}
