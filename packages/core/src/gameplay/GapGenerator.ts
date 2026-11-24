import type { WordTokenData } from "@yourstruly/contracts";
import { WordToken } from "../domain/WordToken";

export type DifficultyLevel = "beginner" | "intermediate" | "advanced" | "expert";

const DIFFICULTY_RATIOS: Record<DifficultyLevel, number> = {
  beginner: 0.1,
  intermediate: 0.25,
  advanced: 0.5,
  expert: 1.0,
};

export class GapGenerator {
  public generateGaps(
    words: readonly (WordToken | WordTokenData)[],
    difficulty: DifficultyLevel,
    seed = 42,
  ): Set<string> {
    const tokens = words.map((w) =>
      typeof (w as WordToken).isEligibleForGap === "function"
        ? (w as WordToken)
        : WordToken.fromData(w as WordTokenData),
    );
    // Ensure tokens have isEligibleForGap flag AND contain at least one letter or digit
    const eligibleWords = tokens.filter(
      (w) => w.isEligibleForGap() && /[\p{L}\p{N}]/u.test(w.getText()),
    );
    if (eligibleWords.length === 0) return new Set();

    const targetRatio = DIFFICULTY_RATIOS[difficulty];
    const targetCount = Math.max(1, Math.round(eligibleWords.length * targetRatio));

    if (difficulty === "expert" || targetCount >= eligibleWords.length) {
      return new Set(eligibleWords.map((w) => w.getId()));
    }

    const shuffled = [...eligibleWords].sort((a, b) => {
      const hashA = this.pseudoHash(a.getId(), seed);
      const hashB = this.pseudoHash(b.getId(), seed);
      return hashA - hashB;
    });

    const selectedIds = shuffled.slice(0, targetCount).map((w) => w.getId());
    return new Set(selectedIds);
  }

  private pseudoHash(str: string, seed: number): number {
    let h = seed ^ 0xdeadbeef;
    for (let i = 0; i < str.length; i++) {
      h = Math.imul(h ^ str.charCodeAt(i), 2654435761);
    }
    return (h ^ (h >>> 16)) >>> 0;
  }
}
