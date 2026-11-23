import type { WordToken } from "../domain/WordToken";

export class ChoiceDistractorGenerator {
  public generateChoices(
    targetWord: WordToken,
    allWords: readonly WordToken[],
    fallbackPool: readonly string[] = ["the", "and", "you", "time", "away", "never", "always"],
  ): string[] {
    const cleanTarget = targetWord
      .getText()
      .toLowerCase()
      .replace(/[^a-z0-9]/gi, "");
    const candidateSet = new Set<string>();

    for (const w of allWords) {
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
    const options = [targetWord.getText(), ...distractors];

    // Deterministic shuffle
    return options.sort((a, b) => a.localeCompare(b));
  }
}
