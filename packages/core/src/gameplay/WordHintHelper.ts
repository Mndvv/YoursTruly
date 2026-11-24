export class WordHintHelper {
  /**
   * Returns a progressively revealed string with letters and underscores.
   * Unicode-safe for non-Latin scripts (Japanese, Korean, Arabic, Cyrillic, etc.)
   */
  public getLetterHint(wordText: string, hintLevel: number): string {
    const clean = wordText.trim();
    if (clean.length === 0) return "";
    if (hintLevel <= 0) {
      const count = Array.from(clean).length;
      return "_ ".repeat(count).trim();
    }

    const chars = Array.from(clean);
    const revealCount = Math.min(chars.length, hintLevel);

    const parts = chars.map((ch, idx) => {
      if (idx < revealCount) return ch;
      if (/[\p{P}\p{S}\s]/u.test(ch)) return ch;
      return "_";
    });

    return parts.join(" ");
  }

  /**
   * Eliminates 2 distractors from a 4-choice list, leaving target + 1 distractor.
   * Shuffles positions to avoid biased layout.
   */
  public get5050Choices(targetWord: string, choices: readonly string[]): string[] {
    const cleanTarget = targetWord.trim().toLowerCase();
    const otherChoices = choices.filter((c) => c.trim().toLowerCase() !== cleanTarget);

    if (otherChoices.length <= 1) {
      return [...choices];
    }

    // Pick target and one other choice, then randomize order
    const preserved = [targetWord, otherChoices[0]];
    if (Math.random() < 0.5) {
      preserved.reverse();
    }
    return preserved;
  }

  /**
   * Returns true if the hint has revealed all characters in the word.
   */
  public isFullyRevealed(wordText: string, hintLevel: number): boolean {
    const clean = wordText.replace(/[\p{P}\p{S}\s]+/gu, "");
    const charCount = Array.from(clean).length;
    return hintLevel >= charCount;
  }
}
