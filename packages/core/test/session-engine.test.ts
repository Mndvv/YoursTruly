import { describe, expect, it } from "bun:test";
import type { SongDetailDto } from "@yourstruly/contracts";
import { GameplaySessionEngine } from "../src/gameplay/GameplaySessionEngine";

const mockSong: SongDetailDto = {
  id: "s1",
  youtubeId: "yt123",
  title: "Test Song",
  artist: "Test Artist",
  thumbnailUrl: "https://example.com/thumb.jpg",
  durationMs: 30000,
  syncLevel: "word",
  videoStartMs: 0,
  videoEndMs: 30000,
  globalOffsetMs: 0,
  playCount: 0,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
  lyricsData: {
    syncLevel: "word",
    globalOffsetMs: 0,
    lines: [
      {
        id: "l1",
        text: "look at the stars",
        startMs: 1000,
        endMs: 5000,
        words: [
          { id: "w1", text: "don't", startMs: 1000, endMs: 1800 },
          { id: "w2", text: "look", startMs: 1800, endMs: 2500 },
          { id: "w3", text: "away", startMs: 2500, endMs: 3200 },
        ],
      },
    ],
  },
};

describe("Gameplay: GameplaySessionEngine", () => {
  it("supports real-time keystroke auto-submit and ignores apostrophes", () => {
    const engine = new GameplaySessionEngine(mockSong, "verse_loop");
    engine.initGaps("expert");
    engine.tick(1200, {});

    // Target is "don't"
    expect(engine.activeWord?.text).toBe("don't");

    // Mid-word keystroke check: does not auto-submit and does not record failure
    const midCheck = engine.submitAnswer("do", true);
    expect(midCheck).toBe(false);
    expect(engine.consecutiveFails).toBe(0);

    // User types "dont" (ignoring apostrophe)
    const fullCheck = engine.submitAnswer("dont", true);
    expect(fullCheck).toBe(true);
    expect(engine.solvedGapIds.has("w1")).toBe(true);

    // Target immediately advances to "look"
    expect(engine.activeWord?.text).toBe("look");
  });

  it("handles verse loop rewinds and auto-skips verse when max retries exceeded", () => {
    const engine = new GameplaySessionEngine(mockSong, "verse_loop");
    engine.initGaps("expert");

    let rewoundTo: number | null = null;
    let skipped = false;

    // 1st rewind near line end
    engine.tick(4950, {
      onRewindVerse: (toMs) => {
        rewoundTo = toMs;
      },
      onSkipVerse: () => {
        skipped = true;
      },
    });
    expect(rewoundTo).toBe(1000);
    expect(skipped).toBe(false);

    // Seeks back and plays again
    engine.tick(1000, {});
    engine.tick(4950, {
      onRewindVerse: (toMs) => {
        rewoundTo = toMs;
      },
      onSkipVerse: () => {
        skipped = true;
      },
    });
    expect(rewoundTo).toBe(1000);

    // Seeks back and plays 3rd time -> exceeds retry limit (2)
    engine.tick(1000, {});
    engine.tick(4950, {
      onRewindVerse: (toMs) => {
        rewoundTo = toMs;
      },
      onSkipVerse: () => {
        skipped = true;
      },
    });
    expect(skipped).toBe(true);
    expect(engine.failedGapIds.size).toBe(3);
  });
});
