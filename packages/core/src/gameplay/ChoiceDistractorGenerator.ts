import type { WordTokenData } from "@yourstruly/contracts";
import { WordToken } from "../domain/WordToken";

export class ChoiceDistractorGenerator {
  public generateChoices(
    targetWord: WordToken | WordTokenData,
    allWords: readonly (WordToken | WordTokenData)[],
    fallbackPool: readonly string[] = ["the", "and", "you", "time", "away", "never", "always"],
  ): string[] {
    const targetToken =
      typeof (targetWord as WordToken).getText === "function"
        ? (targetWord as WordToken)
        : WordToken.fromData(targetWord as WordTokenData);

    const cleanTarget = targetToken
      .getText()
      .toLowerCase()
      .replace(/[^a-z0-9]/gi, "");
    const candidateSet = new Set<string>();

    for (const item of allWords) {
      const w =
        typeof (item as WordToken).getText === "function"
          ? (item as WordToken)
          : WordToken.fromData(item as WordTokenData);
      const clean = w
        .getText()
        .toLowerCase()
        .replace(/[^a-z0-9]/gi, "");
      if (clean && clean !== cleanTarget && clean.length > 1) {
        candidateSet.add(w.getText());
      }
    }

    const uniqueCandidates = Array.from(candidateSet);
    for (const fallback of fallbackPool) {
      if (uniqueCandidates.length >= 3) break;
      if (fallback.toLowerCase() !== cleanTarget && !candidateSet.has(fallback)) {
        uniqueCandidates.push(fallback);
      }
    }

    const distractors = uniqueCandidates.slice(0, 3);
    const options = [targetToken.getText(), ...distractors];

    // Deterministic shuffle
    return options.sort((a, b) => a.localeCompare(b));
  }
}
