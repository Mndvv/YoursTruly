import { describe, expect, it } from "bun:test";
import { WordToken } from "../src/domain/WordToken";
import { AnswerValidator } from "../src/gameplay/AnswerValidator";
import { AutoPauseController } from "../src/gameplay/AutoPauseController";
import { ChoiceDistractorGenerator } from "../src/gameplay/ChoiceDistractorGenerator";
import { GapGenerator } from "../src/gameplay/GapGenerator";
import { WordHintHelper } from "../src/gameplay/WordHintHelper";

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
  it("triggers strict pause at end boundary of unsolved gap word", () => {
    const controller = new AutoPauseController("strict");
    const word = new WordToken({ id: "w1", text: "stars", startMs: 1000, endMs: 1500 });

    // Playing before boundary
    expect(controller.checkWordAutoPause(word, true, false, 1200)).toBeNull();

    // Reached boundary window (1500 - 60 = 1440)
    const trigger = controller.checkWordAutoPause(word, true, false, 1450);
    expect(trigger).not.toBeNull();
    expect(trigger?.wordId).toBe("w1");

    // Does not trigger repeatedly
    expect(controller.checkWordAutoPause(word, true, false, 1510)).toBeNull();
  });

  it("triggers verse rewind in verse_loop mode when line ends with unsolved gaps", () => {
    const controller = new AutoPauseController("verse_loop");

    // Before line end
    expect(controller.checkVerseRewind("l1", 1000, 5000, 2, 4500)).toBeNull();

    // At line end boundary
    const rewind = controller.checkVerseRewind("l1", 1000, 5000, 2, 4950);
    expect(rewind).not.toBeNull();
    expect(rewind?.rewindToMs).toBe(1000);

    // No rewind if 0 unsolved gaps
    expect(controller.checkVerseRewind("l2", 6000, 9000, 0, 8950)).toBeNull();
  });
});

describe("Gameplay: WordHintHelper", () => {
  const helper = new WordHintHelper();

  it("progressively reveals letters in hint levels", () => {
    expect(helper.getLetterHint("hello", 0)).toBe("_ _ _ _ _");
    expect(helper.getLetterHint("hello", 1)).toBe("h _ _ _ _");
    expect(helper.getLetterHint("hello", 3)).toBe("h e l _ _");
    expect(helper.getLetterHint("hello", 5)).toBe("h e l l o");
  });

  it("eliminates distractors for 50/50 choice hint", () => {
    const choices = ["stars", "moon", "sun", "sky"];
    const hintChoices = helper.get5050Choices("stars", choices);
    expect(hintChoices.length).toBe(2);
    expect(hintChoices).toContain("stars");
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
