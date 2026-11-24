import type { WordTokenData } from "@yourstruly/contracts";
import { WordToken } from "../domain/WordToken";

export class ChoiceDistractorGenerator {
  public generateChoices(
    targetWord: WordToken | WordTokenData,
    allWords: readonly (WordToken | WordTokenData)[],
    fallbackPool: readonly string[] = ["the", "and", "you", "time", "away", "never", "always"],
    rng: () => number = Math.random,
  ): string[] {
    const targetToken =
      typeof (targetWord as WordToken).getText === "function"
        ? (targetWord as WordToken)
        : WordToken.fromData(targetWord as WordTokenData);

    const targetRaw = targetToken.getText();
    const cleanTarget = targetRaw.toLowerCase().replace(/[\p{P}\p{S}\s]+/gu, "");
    const candidateSet = new Set<string>();

    for (const item of allWords) {
      const w =
        typeof (item as WordToken).getText === "function"
          ? (item as WordToken)
          : WordToken.fromData(item as WordTokenData);
      const raw = w.getText();
      const clean = raw.toLowerCase().replace(/[\p{P}\p{S}\s]+/gu, "");
      if (clean && clean !== cleanTarget && Array.from(clean).length >= 1) {
        candidateSet.add(raw.trim());
      }
    }

    const uniqueCandidates = Array.from(candidateSet);

    // If candidate set from song is small, supplement from fallback pool
    for (const fallback of fallbackPool) {
      if (uniqueCandidates.length >= 3) break;
      const cleanFallback = fallback.toLowerCase().replace(/[\p{P}\p{S}\s]+/gu, "");
      if (cleanFallback !== cleanTarget && !candidateSet.has(fallback)) {
        uniqueCandidates.push(fallback);
      }
    }

    const distractors = uniqueCandidates.slice(0, 3);
    const options = [targetRaw, ...distractors];

    // Fisher-Yates shuffle with provided or default RNG to eliminate position bias
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      const temp = options[i];
      options[i] = options[j];
      options[j] = temp;
    }

    return options;
  }
}
