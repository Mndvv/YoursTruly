import { describe, expect, it } from "bun:test";
import { WordToken } from "../src/domain/WordToken";
import { AnswerValidator } from "../src/gameplay/AnswerValidator";
import { AutoPauseController } from "../src/gameplay/AutoPauseController";
import { ChoiceDistractorGenerator } from "../src/gameplay/ChoiceDistractorGenerator";
import { GapGenerator } from "../src/gameplay/GapGenerator";

describe("Gameplay: AnswerValidator", () => {
  const validator = new AnswerValidator();

  it("validates exact and case-insensitive answers", () => {
    expect(validator.validate("yellow", "Yellow")).toBe(true);
    expect(validator.validate("  Yellow! ", "yellow")).toBe(true);
  });

  it("handles diacritics tolerance", () => {
    expect(validator.validate("cafe", "café")).toBe(true);
  });

  it("rejects incorrect answers", () => {
    expect(validator.validate("blue", "yellow")).toBe(false);
  });
});

describe("Gameplay: GapGenerator", () => {
  const generator = new GapGenerator();
  const words = [
    new WordToken({ id: "w1", text: "Look", startMs: 100, endMs: 200 }),
    new WordToken({ id: "w2", text: "at", startMs: 200, endMs: 300, isGapEligible: false }),
    new WordToken({ id: "w3", text: "the", startMs: 300, endMs: 400 }),
    new WordToken({ id: "w4", text: "stars", startMs: 400, endMs: 500 }),
  ];

  it("generates 100% gaps on expert mode ignoring ineligible tokens", () => {
    const gaps = generator.generateGaps(words, "expert");
    expect(gaps.size).toBe(3);
    expect(gaps.has("w1")).toBe(true);
    expect(gaps.has("w2")).toBe(false); // ineligible
    expect(gaps.has("w4")).toBe(true);
  });

  it("generates deterministic subset on beginner", () => {
    const gaps = generator.generateGaps(words, "beginner", 123);
    expect(gaps.size).toBe(1);
  });

  it("supports plain WordTokenData JSON objects seamlessly", () => {
    const rawWords = [
      { id: "rw1", text: "Hello", startMs: 100, endMs: 200, isGapEligible: true },
      { id: "rw2", text: "world", startMs: 200, endMs: 300, isGapEligible: true },
    ];
    const gaps = generator.generateGaps(rawWords, "expert");
    expect(gaps.size).toBe(2);
    expect(gaps.has("rw1")).toBe(true);
  });
});

describe("Gameplay: AutoPauseController", () => {
  it("triggers pause at endMs boundary of unsolved gap word", () => {
    const controller = new AutoPauseController(true);
    const word = new WordToken({ id: "w1", text: "stars", startMs: 1000, endMs: 1500 });

    // Playing before boundary
    expect(controller.checkAutoPause(word, true, false, 1200)).toBeNull();

    // Reached boundary
    const trigger = controller.checkAutoPause(word, true, false, 1500);
    expect(trigger).not.toBeNull();
    expect(trigger?.wordId).toBe("w1");

    // Does not trigger repeatedly
    expect(controller.checkAutoPause(word, true, false, 1510)).toBeNull();
  });
});

describe("Gameplay: ChoiceDistractorGenerator", () => {
  const generator = new ChoiceDistractorGenerator();
  const words = [
    new WordToken({ id: "w1", text: "Look", startMs: 100, endMs: 200 }),
    new WordToken({ id: "w2", text: "stars", startMs: 200, endMs: 300 }),
    new WordToken({ id: "w3", text: "shine", startMs: 300, endMs: 400 }),
    new WordToken({ id: "w4", text: "yellow", startMs: 400, endMs: 500 }),
  ];

  it("generates 4 choices containing the target word and 3 distractors", () => {
    const choices = generator.generateChoices(words[0], words);
    expect(choices.length).toBe(4);
    expect(choices).toContain("Look");
  });
});
