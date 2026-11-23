export class WordHintHelper {
  /**
   * Returns a progressively revealed string with letters and underscores.
   * e.g. ("never", 1) -> "n _ _ _ _"
   * e.g. ("never", 2) -> "n e _ _ _"
   */
  public getLetterHint(wordText: string, hintLevel: number): string {
    const clean = wordText.trim();
    if (clean.length === 0) return "";
    if (hintLevel <= 0) {
      return "_ ".repeat(clean.length).trim();
    }

    const revealCount = Math.min(clean.length, hintLevel);
    const chars = clean.split("");

    const parts = chars.map((ch, idx) => {
      if (idx < revealCount) return ch;
      if (/[^a-zA-Z0-9]/.test(ch)) return ch;
      return "_";
    });

    return parts.join(" ");
  }

  /**
   * Eliminates 2 distractors from a 4-choice list, leaving target + 1 distractor.
   */
  public get5050Choices(targetWord: string, choices: readonly string[]): string[] {
    const cleanTarget = targetWord.trim().toLowerCase();
    const otherChoices = choices.filter((c) => c.trim().toLowerCase() !== cleanTarget);

    if (otherChoices.length <= 1) {
      return [...choices];
    }

    // Keep the target and the first distractor
    const preserved = [targetWord, otherChoices[0]];
    return preserved.sort((a, b) => a.localeCompare(b));
  }

  /**
   * Returns true if the hint has revealed all characters in the word.
   */
  public isFullyRevealed(wordText: string, hintLevel: number): boolean {
    const alphanumericLength = wordText.replace(/[^a-zA-Z0-9]/g, "").length;
    return hintLevel >= alphanumericLength;
  }
}
