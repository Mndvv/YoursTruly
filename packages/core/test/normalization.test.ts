import { describe, expect, it } from "bun:test";
import type { LyricaDataPayload } from "@yourstruly/contracts";
import { LineSyncedLyricaStrategy } from "../src/normalization/LineSyncedLyricaStrategy";
import { LyricsNormalizer } from "../src/normalization/LyricsNormalizer";
import { PlainTextLyricaStrategy } from "../src/normalization/PlainTextLyricaStrategy";
import { WordSyncedLyricaStrategy } from "../src/normalization/WordSyncedLyricaStrategy";

describe("Normalization Strategies", () => {
  const normalizer = new LyricsNormalizer();

  it("normalizes word-synced Lyrica payload", () => {
    const payload: LyricaDataPayload = {
      source: "lrclib",
      artist: "Coldplay",
      title: "Yellow",
      hasTimestamps: true,
      lyrics: [
        {
          id: "lrc_0",
          text: "Look at the stars",
          start_time: 36189,
          end_time: 37719,
          words: [
            { word: "Look", start: 36189, end: 36520 },
            { word: "at", start: 36520, end: 36800 },
          ],
        },
      ],
    };

    const strategy = new WordSyncedLyricaStrategy();
    expect(strategy.canHandle(payload)).toBe(true);

    const result = normalizer.normalize(payload);
    expect(result.getSyncLevel()).toBe("word");
    expect(result.getLines().length).toBe(1);
    expect(result.getLines()[0].getWords().length).toBe(2);
    expect(result.getLines()[0].getWords()[0].getStartMs()).toBe(36189);
  });

  it("normalizes line-synced Lyrica payload and proportionally tokenizes words", () => {
    const payload: LyricaDataPayload = {
      source: "lrclib",
      artist: "Coldplay",
      title: "Yellow",
      hasTimestamps: true,
      lyrics: [
        {
          id: "lrc_0",
          text: "Look stars",
          start_time: 1000,
          end_time: 3000,
        },
      ],
    };

    const strategy = new LineSyncedLyricaStrategy();
    expect(strategy.canHandle(payload)).toBe(true);

    const result = normalizer.normalize(payload);
    expect(result.getSyncLevel()).toBe("line");
    const words = result.getLines()[0].getWords();
    expect(words.length).toBe(2);
    expect(words[0].getStartMs()).toBe(1000);
    expect(words[1].getEndMs()).toBe(3000);
  });

  it("normalizes plain text string payload", () => {
    const payload: LyricaDataPayload = {
      source: "genius",
      artist: "Coldplay",
      title: "Yellow",
      lyrics: "Look at the stars\nLook how they shine",
    };

    const strategy = new PlainTextLyricaStrategy();
    expect(strategy.canHandle(payload)).toBe(true);

    const result = normalizer.normalize(payload);
    expect(result.getSyncLevel()).toBe("plain");
    expect(result.getLines().length).toBe(2);
    expect(result.getLines()[0].getStartMs()).toBeNull();
  });
});
