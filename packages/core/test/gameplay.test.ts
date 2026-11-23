import { describe, expect, it } from "bun:test";
import { WordToken } from "../src/domain/WordToken";
import { ActiveGapResolver } from "../src/gameplay/ActiveGapResolver";
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

  it("ignores apostrophes and punctuation symbols", () => {
    expect(validator.validate("dont", "don't")).toBe(true);
    expect(validator.validate("its", "it's")).toBe(true);
    expect(validator.validate("im", "I'm")).toBe(true);
    expect(validator.validate("rocknroll", "rock'n'roll")).toBe(true);
    expect(validator.validate("dont", "don't", { ignoreApostrophes: false })).toBe(false);
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
    expect(gaps.has("w2")).toBe(false);
    expect(gaps.has("w3")).toBe(true);
    expect(gaps.has("w4")).toBe(true);
  });

  it("generates deterministic subset on beginner", () => {
    const gaps = generator.generateGaps(words, "beginner");
    expect(gaps.size).toBe(1);
  });

  it("supports plain WordTokenData JSON objects seamlessly", () => {
    const plainWords = [
      { id: "w1", text: "hello", startMs: 0, endMs: 100 },
      { id: "w2", text: "world", startMs: 100, endMs: 200 },
    ];
    const gaps = generator.generateGaps(plainWords, "expert");
    expect(gaps.size).toBe(2);
  });
});

describe("Gameplay: AutoPauseController", () => {
  it("triggers strict pause at end boundary of unsolved gap word", () => {
    const controller = new AutoPauseController("strict");
    const word = new WordToken({ id: "w1", text: "stars", startMs: 1000, endMs: 1500 });
    expect(controller.checkWordAutoPause(word, true, false, 1200)).toBeNull();
    const trigger = controller.checkWordAutoPause(word, true, false, 1450);
    expect(trigger?.wordId).toBe("w1");
    expect(controller.checkWordAutoPause(word, true, false, 1510)).toBeNull();
  });

  it("triggers verse rewind in verse_loop mode when line ends with unsolved gaps", () => {
    const controller = new AutoPauseController("verse_loop");
    const makeCheck = (currentTimeMs: number) => ({
      lineId: "l1",
      lineStartMs: 1000,
      lineEndMs: 5000,
      unsolvedGapCount: 2,
      currentTimeMs,
      maxRetries: 2,
    });
    expect(controller.checkVerseRewind(makeCheck(4500))).toBeNull();

    const rewind1 = controller.checkVerseRewind(makeCheck(4950));
    expect(rewind1?.rewindToMs).toBe(1000);
    expect(rewind1?.shouldSkipVerse).toBe(false);

    controller.checkVerseRewind(makeCheck(1200));
    const rewind2 = controller.checkVerseRewind(makeCheck(4950));
    expect(rewind2?.shouldSkipVerse).toBe(false);

    controller.checkVerseRewind(makeCheck(1200));
    const skip = controller.checkVerseRewind(makeCheck(4950));
    expect(skip?.shouldSkipVerse).toBe(true);
  });
});

describe("Gameplay: ActiveGapResolver", () => {
  const resolver = new ActiveGapResolver();
  const line = {
    id: "l1",
    text: "look at the stars",
    startMs: 1000,
    endMs: 3000,
    words: [
      { id: "w1", text: "look", startMs: 1000, endMs: 1400 },
      { id: "w2", text: "at", startMs: 1400, endMs: 1800 },
      { id: "w3", text: "the", startMs: 1800, endMs: 2200 },
      { id: "w4", text: "stars", startMs: 2200, endMs: 3000 },
    ],
  };
  const gaps = new Set(["w1", "w4"]);

  it("finds the first unsolved gap in the line", () => {
    const isDone = (id: string) => id === "w1";
    const target = resolver.findTargetGap(line, gaps, isDone);
    expect(target?.id).toBe("w4");
  });

  it("returns all unsolved gaps in the line", () => {
    const isDone = () => false;
    const unsolved = resolver.getUnsolvedGaps(line, gaps, isDone);
    expect(unsolved.map((w) => w.id)).toEqual(["w1", "w4"]);
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
