import { describe, expect, it } from "bun:test";
import { LyricLine } from "../src/domain/LyricLine";
import { WordToken } from "../src/domain/WordToken";
import { OffsetCalculator } from "../src/sync/OffsetCalculator";
import { SyncClockEngine } from "../src/sync/SyncClockEngine";
import { TapSyncRecorder } from "../src/sync/TapSyncRecorder";

describe("Sync: SyncClockEngine", () => {
  const words = [
    new WordToken({ id: "w1", text: "Look", startMs: 1000, endMs: 1500 }),
    new WordToken({ id: "w2", text: "at", startMs: 1500, endMs: 2000 }),
  ];
  const line = new LyricLine({ id: "l1", startMs: 1000, endMs: 2000, text: "Look at", words });
  const engine = new SyncClockEngine();

  it("resolves active line and word during playback", () => {
    const state = engine.resolveState([line], 1200, 0);
    expect(state.activeLine?.getId()).toBe("l1");
    expect(state.activeWord?.getId()).toBe("w1");
  });

  it("accounts for global offset", () => {
    // Current time is 800ms, with +300ms offset effective time is 1100ms
    const state = engine.resolveState([line], 800, 300);
    expect(state.effectiveTimeMs).toBe(1100);
    expect(state.activeWord?.getId()).toBe("w1");
  });

  it("returns null outside line range", () => {
    const state = engine.resolveState([line], 3000, 0);
    expect(state.activeLine).toBeNull();
    expect(state.activeWord).toBeNull();
  });
});

describe("Sync: TapSyncRecorder", () => {
  it("records tap down and tap up intervals sequentially", () => {
    const recorder = new TapSyncRecorder();
    recorder.onTapDown(1000);
    const timing1 = recorder.onTapUp(1400);

    expect(timing1).not.toBeNull();
    expect(timing1?.wordIndex).toBe(0);
    expect(timing1?.startMs).toBe(1000);
    expect(timing1?.endMs).toBe(1400);
    expect(recorder.getCurrentWordIndex()).toBe(1);

    recorder.onTapDown(1500);
    const timing2 = recorder.onTapUp(1900);
    expect(timing2?.wordIndex).toBe(1);
    expect(recorder.getAllTimings().length).toBe(2);
  });
});

describe("Sync: OffsetCalculator", () => {
  const calc = new OffsetCalculator();

  it("applies offset and clamps minimum to 0", () => {
    expect(calc.applyOffset(500, 100)).toBe(600);
    expect(calc.applyOffset(100, -300)).toBe(0);
  });

  it("clamps time within video boundaries", () => {
    expect(calc.clampTime(50, 100, 5000)).toBe(100);
    expect(calc.clampTime(6000, 100, 5000)).toBe(5000);
    expect(calc.clampTime(300, 100, null)).toBe(300);
  });
});
