import { describe, expect, it } from "bun:test";
import { LyricLine } from "../src/domain/LyricLine";
import type { ITransliterationProvider } from "../src/transliteration/ITransliterationProvider";
import { TransliterationResolver } from "../src/transliteration/TransliterationResolver";

describe("Transliteration: TransliterationResolver", () => {
  const dummyProvider: ITransliterationProvider = {
    canTransliterate: (lang) => lang === "ja",
    transliterate: (text) => `roma_${text}`,
  };

  const resolver = new TransliterationResolver([dummyProvider]);

  it("preserves existing transliteration from Lyrica", async () => {
    const line = new LyricLine({
      id: "l1",
      startMs: 0,
      endMs: 1000,
      text: "星を見て",
      transliteration: "hoshi wo mite",
      words: [],
    });

    const result = await resolver.resolveLine(line, "ja");
    expect(result).toBe("hoshi wo mite");
  });

  it("uses fallback provider if line transliteration is missing", async () => {
    const line = new LyricLine({
      id: "l1",
      startMs: 0,
      endMs: 1000,
      text: "星",
      words: [],
    });

    const result = await resolver.resolveLine(line, "ja");
    expect(result).toBe("roma_星");
  });
});
