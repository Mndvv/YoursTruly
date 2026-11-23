import { describe, expect, it } from "bun:test";
import { LyricLine } from "../src/domain/LyricLine";
import { SongLyrics } from "../src/domain/SongLyrics";
import { TimestampMs } from "../src/domain/TimestampMs";
import { WordToken } from "../src/domain/WordToken";

describe("Domain: TimestampMs", () => {
  it("creates valid timestamp and enforces non-negative", () => {
    const ts = new TimestampMs(1500.4);
    expect(ts.getValue()).toBe(1500);
    expect(() => new TimestampMs(-10)).toThrow();
  });

  it("adds delta correctly", () => {
    const ts = new TimestampMs(1000);
    expect(ts.add(500).getValue()).toBe(1500);
    expect(ts.add(-1200).getValue()).toBe(0);
  });

  it("checks intervals", () => {
    const ts = new TimestampMs(2000);
    expect(ts.isBetween(new TimestampMs(1000), new TimestampMs(3000))).toBe(true);
    expect(ts.isBetween(new TimestampMs(2500), new TimestampMs(3000))).toBe(false);
  });
});

describe("Domain: WordToken & LyricLine", () => {
  it("shifts tokens and lines with global offset", () => {
    const word = new WordToken({ id: "w1", text: "Hello", startMs: 1000, endMs: 1500 });
    const line = new LyricLine({
      id: "l1",
      startMs: 1000,
      endMs: 2000,
      text: "Hello world",
      words: [word],
    });

    const shiftedLine = line.shift(500);
    expect(shiftedLine.getStartMs()).toBe(1500);
    expect(shiftedLine.getWords()[0].getStartMs()).toBe(1500);
    expect(shiftedLine.getWords()[0].getEndMs()).toBe(2000);
  });

  it("exports SongLyrics to contract schema format", () => {
    const word = new WordToken({ id: "w1", text: "Look", startMs: 100, endMs: 300 });
    const line = new LyricLine({ id: "l1", startMs: 100, endMs: 500, text: "Look", words: [word] });
    const songLyrics = new SongLyrics({ syncLevel: "word", lines: [line] });

    const data = songLyrics.toData();
    expect(data.version).toBe(1);
    expect(data.syncLevel).toBe("word");
    expect(data.lines.length).toBe(1);
    expect(data.lines[0].words[0].text).toBe("Look");
  });
});
