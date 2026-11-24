import type { WordTokenData } from "@yourstruly/contracts";
import { WordToken } from "../domain/WordToken";

export class ChoiceDistractorGenerator {
  public generateChoices(
    targetWord: WordToken | WordTokenData,
    allWords: readonly (WordToken | WordTokenData)[],
    fallbackPool: readonly string[] = ["the", "and", "you", "time", "away", "never", "always"],
    rng: () => number = Math.random,
    avoidIndex?: number,
  ): string[] {
    const targetToken =
      typeof (targetWord as WordToken).getText === "function"
        ? (targetWord as WordToken)
        : WordToken.fromData(targetWord as WordTokenData);

    const targetRaw = targetToken.getText();
    const cleanTarget = targetRaw.toLowerCase().replace(/[\p{P}\p{S}\s]+/gu, "");
    const candidateSet = this.collectCandidates(allWords, cleanTarget);
    const distractors = this.sampleDistractors(
      Array.from(candidateSet),
      fallbackPool,
      cleanTarget,
      rng,
    );
    const targetIndex = this.pickTargetSlot(avoidIndex, rng);

    return this.buildOptions(targetRaw, distractors, targetIndex);
  }

  private collectCandidates(
    allWords: readonly (WordToken | WordTokenData)[],
    cleanTarget: string,
  ): Set<string> {
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
    return candidateSet;
  }

  private sampleDistractors(
    uniqueCandidates: string[],
    fallbackPool: readonly string[],
    cleanTarget: string,
    rng: () => number,
  ): string[] {
    const pool = [...uniqueCandidates];
    for (const fallback of fallbackPool) {
      if (pool.length >= 3) break;
      const cleanFallback = fallback.toLowerCase().replace(/[\p{P}\p{S}\s]+/gu, "");
      if (cleanFallback !== cleanTarget && !pool.includes(fallback)) {
        pool.push(fallback);
      }
    }

    const distractors: string[] = [];
    while (distractors.length < 3 && pool.length > 0) {
      const idx = Math.floor(rng() * pool.length);
      distractors.push(pool.splice(idx, 1)[0]);
    }
    return distractors;
  }

  private pickTargetSlot(avoidIndex: number | undefined, rng: () => number): number {
    const possibleSlots = [0, 1, 2, 3];
    const candidates =
      avoidIndex !== undefined && avoidIndex >= 0 && avoidIndex < 4
        ? possibleSlots.filter((s) => s !== avoidIndex)
        : possibleSlots;

    return candidates[Math.floor(rng() * candidates.length)];
  }

  private buildOptions(targetRaw: string, distractors: string[], targetIndex: number): string[] {
    const options: string[] = [];
    let dIdx = 0;
    for (let slot = 0; slot < 4; slot++) {
      if (slot === targetIndex) {
        options.push(targetRaw);
      } else if (dIdx < distractors.length) {
        options.push(distractors[dIdx++]);
      } else {
        options.push(targetRaw);
      }
    }
    return options;
  }
}
