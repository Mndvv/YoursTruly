import { describe, expect, it } from "bun:test";
import { WordToken } from "../src/domain/WordToken";
import { AnswerValidator } from "../src/gameplay/AnswerValidator";
import { ChoiceDistractorGenerator } from "../src/gameplay/ChoiceDistractorGenerator";
import { WordHintHelper } from "../src/gameplay/WordHintHelper";

describe("Unicode & Non-Latin Gameplay Support", () => {
  const validator = new AnswerValidator();
  const hintHelper = new WordHintHelper();
  const distractorGen = new ChoiceDistractorGenerator();

  it("validates Japanese and CJK characters with punctuation stripping", () => {
    expect(validator.validate("さくら", "さくら")).toBe(true);
    expect(validator.validate("「さくら」", "さくら")).toBe(true);
    expect(validator.validate("さくら！", "さくら")).toBe(true);
    expect(validator.validate("カフェ", "カフェ")).toBe(true);
  });

  it("normalizes full-width Latin to standard ASCII via NFKC", () => {
    expect(validator.validate("ｔｅｓｔ", "test")).toBe(true);
    expect(validator.validate("ｓｔａｒｓ", "stars")).toBe(true);
  });

  it("handles progressive hints for Japanese and non-Latin words", () => {
    expect(hintHelper.getLetterHint("さくら", 0)).toBe("_ _ _");
    expect(hintHelper.getLetterHint("さくら", 1)).toBe("さ _ _");
    expect(hintHelper.getLetterHint("さくら", 2)).toBe("さ く _");
    expect(hintHelper.getLetterHint("さくら", 3)).toBe("さ く ら");
    expect(hintHelper.isFullyRevealed("さくら", 2)).toBe(false);
    expect(hintHelper.isFullyRevealed("さくら", 3)).toBe(true);
  });

  it("extracts Japanese and single-kanji words as candidates for choices", () => {
    const jpWords = [
      new WordToken({ id: "w1", text: "桜", startMs: 0, endMs: 100 }),
      new WordToken({ id: "w2", text: "星", startMs: 100, endMs: 200 }),
      new WordToken({ id: "w3", text: "空", startMs: 200, endMs: 300 }),
      new WordToken({ id: "w4", text: "光", startMs: 300, endMs: 400 }),
    ];
    const choices = distractorGen.generateChoices(jpWords[0], jpWords);
    expect(choices.length).toBe(4);
    expect(choices).toContain("桜");
    expect(choices).toContain("星");
    expect(choices).toContain("空");
    expect(choices).toContain("光");
  });

  it("randomizes choice positions via Fisher-Yates shuffle across runs", () => {
    const words = [
      new WordToken({ id: "w1", text: "apple", startMs: 0, endMs: 100 }),
      new WordToken({ id: "w2", text: "banana", startMs: 100, endMs: 200 }),
      new WordToken({ id: "w3", text: "cherry", startMs: 200, endMs: 300 }),
      new WordToken({ id: "w4", text: "date", startMs: 300, endMs: 400 }),
    ];

    const targetIndices = new Set<number>();
    for (let i = 0; i < 50; i++) {
      const choices = distractorGen.generateChoices(words[0], words);
      const idx = choices.indexOf("apple");
      targetIndices.add(idx);
    }

    // Over 50 iterations, target "apple" must appear at multiple different positions
    expect(targetIndices.size).toBeGreaterThan(1);
  });
});
