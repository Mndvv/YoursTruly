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
          { id: "w1", text: "look", startMs: 1000, endMs: 1800 },
          { id: "w2", text: "at", startMs: 1800, endMs: 2500 },
          { id: "w3", text: "the", startMs: 2500, endMs: 3200 },
          { id: "w4", text: "stars", startMs: 3200, endMs: 5000 },
        ],
      },
    ],
  },
};

describe("Gameplay: GameplaySessionEngine", () => {
  it("immediately targets first unsolved gap in active line and advances early on correct answer", () => {
    const engine = new GameplaySessionEngine(mockSong, "verse_loop");
    engine.initGaps("expert");

    engine.tick(1200, {});
    expect(engine.activeWord?.text).toBe("look");
    expect(engine.activeChoices.length).toBe(4);

    const solved = engine.submitAnswer("look");
    expect(solved).toBe(true);
    expect(engine.solvedGapIds.has("w1")).toBe(true);

    expect(engine.activeWord?.text).toBe("at");
    expect(engine.activeChoices.length).toBe(4);
    expect(engine.activeChoices).toContain("at");
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
    expect(engine.failedGapIds.size).toBe(4);
  });
});
