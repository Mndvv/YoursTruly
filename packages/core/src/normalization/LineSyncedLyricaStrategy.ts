import type { LyricaDataPayload, LyricaLineItem } from "@yourstruly/contracts";
import { LyricLine } from "../domain/LyricLine";
import { SongLyrics } from "../domain/SongLyrics";
import { WordToken } from "../domain/WordToken";
import type { ILyricsNormalizationStrategy } from "./ILyricsNormalizationStrategy";

export class LineSyncedLyricaStrategy implements ILyricsNormalizationStrategy {
  public canHandle(payload: LyricaDataPayload): boolean {
    const lines = this.getLines(payload);
    if (lines.length === 0) return false;
    return lines.some(
      (line) => line.start_time !== undefined && (!line.words || line.words.length === 0),
    );
  }

  public normalize(payload: LyricaDataPayload): SongLyrics {
    const rawLines = this.getLines(payload);
    const romanizedLines = this.splitRomanized(payload.romanized_lyrics);

    const lines = rawLines.map((rawLine, lineIdx) => {
      const lineId = rawLine.id ?? `line_${lineIdx + 1}`;
      const lineWords = this.tokenizeLine(lineId, rawLine);

      return new LyricLine({
        id: lineId,
        startMs: rawLine.start_time ?? null,
        endMs: rawLine.end_time ?? null,
        text: rawLine.text,
        transliteration: romanizedLines[lineIdx] ?? null,
        words: lineWords,
      });
    });

    return new SongLyrics({
      source: payload.source,
      syncLevel: "line",
      hasTransliteration: romanizedLines.length > 0,
      lines,
    });
  }

  private tokenizeLine(lineId: string, rawLine: LyricaLineItem): WordToken[] {
    const rawWords = rawLine.text.trim().split(/\s+/).filter(Boolean);
    const startMs = rawLine.start_time ?? 0;
    const endMs = rawLine.end_time ?? startMs + 3000;
    const totalDuration = Math.max(endMs - startMs, rawWords.length * 200);
    const totalChars = rawWords.reduce((sum, w) => sum + w.length, 0) || 1;

    let currentStart = startMs;
    return rawWords.map((word, wordIdx) => {
      const wordShare = word.length / totalChars;
      const wordDuration = Math.round(totalDuration * wordShare);
      const wordEnd = Math.min(endMs, currentStart + wordDuration);
      const token = new WordToken({
        id: `${lineId}_w${wordIdx + 1}`,
        text: word,
        startMs: currentStart,
        endMs: wordEnd,
        isGapEligible: word.length > 1,
      });
      currentStart = wordEnd;
      return token;
    });
  }

  private getLines(payload: LyricaDataPayload): LyricaLineItem[] {
    if (Array.isArray(payload.timed_lyrics) && payload.timed_lyrics.length > 0) {
      return payload.timed_lyrics;
    }
    if (Array.isArray(payload.lyrics)) {
      return payload.lyrics;
    }
    if (typeof payload.lyrics === "string" && /\[\d{2}:\d{2}/.test(payload.lyrics)) {
      return this.parseLrcString(payload.lyrics);
    }
    return [];
  }

  private parseLrcString(lrc: string): LyricaLineItem[] {
    const rawLines = lrc.split(/\r?\n/);
    const parsed: { time: number; text: string }[] = [];

    for (const line of rawLines) {
      const match = line.match(/\[(\d{2}):(\d{2})(?:\.(\d{2,3}))?\](.*)/);
      if (match) {
        const min = Number.parseInt(match[1], 10);
        const sec = Number.parseInt(match[2], 10);
        const msRaw = match[3] ?? "0";
        const ms = Number.parseInt(msRaw.padEnd(3, "0"), 10);
        const time = (min * 60 + sec) * 1000 + ms;
        const text = match[4].trim();
        if (text) parsed.push({ time, text });
      }
    }

    return parsed.map((item, idx) => {
      const nextTime = parsed[idx + 1]?.time ?? item.time + 4000;
      return {
        id: `lrc_${idx}`,
        text: item.text,
        start_time: item.time,
        end_time: nextTime,
      };
    });
  }

  private splitRomanized(romanized?: string): string[] {
    if (!romanized) return [];
    return romanized
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
  }
}
