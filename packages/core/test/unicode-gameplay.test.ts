import { describe, expect, it } from "bun:test";
import { WordToken } from "../src/domain/WordToken";
import { AnswerValidator } from "../src/gameplay/AnswerValidator";
import { ChoiceDistractorGenerator } from "../src/gameplay/ChoiceDistractorGenerator";
import { GapGenerator } from "../src/gameplay/GapGenerator";
import { WordHintHelper } from "../src/gameplay/WordHintHelper";

describe("Unicode & Non-Latin Gameplay Support", () => {
  const validator = new AnswerValidator();
  const hintHelper = new WordHintHelper();
  const distractorGen = new ChoiceDistractorGenerator();
  const gapGen = new GapGenerator();

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

  it("guarantees correct answer avoids the previous tile index", () => {
    const words = [
      new WordToken({ id: "w1", text: "apple", startMs: 0, endMs: 100 }),
      new WordToken({ id: "w2", text: "banana", startMs: 100, endMs: 200 }),
      new WordToken({ id: "w3", text: "cherry", startMs: 200, endMs: 300 }),
      new WordToken({ id: "w4", text: "date", startMs: 300, endMs: 400 }),
    ];

    let lastIdx = 1; // avoid tile 1
    for (let i = 0; i < 30; i++) {
      const choices = distractorGen.generateChoices(
        words[0],
        words,
        undefined,
        Math.random,
        lastIdx,
      );
      const currentIdx = choices.indexOf("apple");
      expect(currentIdx).not.toBe(lastIdx);
      lastIdx = currentIdx;
    }
  });

  it("excludes non-alphanumeric tokens (e.g. musical notes) from gap eligibility", () => {
    const words = [
      new WordToken({ id: "w1", text: "♫♫♫", startMs: 0, endMs: 100 }),
      new WordToken({ id: "w2", text: "hello", startMs: 100, endMs: 200 }),
    ];
    const gaps = gapGen.generateGaps(words, "expert");
    expect(gaps.has("w1")).toBe(false);
    expect(gaps.has("w2")).toBe(true);
  });
});
