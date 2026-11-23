export interface ValidationOptions {
  stripPunctuation?: boolean;
  ignoreDiacritics?: boolean;
  ignoreApostrophes?: boolean;
  debounceDoubleLetters?: boolean;
}

export class AnswerValidator {
  public validate(userInput: string, targetWord: string, options: ValidationOptions = {}): boolean {
    const opts: ValidationOptions = {
      stripPunctuation: true,
      ignoreDiacritics: true,
      ignoreApostrophes: true,
      debounceDoubleLetters: true,
      ...options,
    };

    const cleanInput = this.normalize(userInput, opts);
    const cleanTarget = this.normalize(targetWord, opts);

    if (cleanInput.length === 0) return false;
    if (cleanInput === cleanTarget) return true;
    if (opts.debounceDoubleLetters) {
      return this.matchesWithChatter(cleanInput, cleanTarget);
    }
    return false;
  }

  public normalize(text: string, options: ValidationOptions = {}): string {
    const opts: ValidationOptions = {
      stripPunctuation: true,
      ignoreDiacritics: true,
      ignoreApostrophes: true,
      ...options,
    };

    let result = text.trim().toLowerCase();

    if (opts.ignoreDiacritics) {
      result = result.normalize("NFD").replace(/\p{Diacritic}/gu, "");
    }

    if (opts.ignoreApostrophes) {
      result = result.replace(/['’‘`]/gu, "");
    }

    if (opts.stripPunctuation) {
      result = result.replace(
        /^[^a-zA-Z0-9\u00C0-\u024F\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]+/,
        "",
      );
      result = result.replace(
        /[^a-zA-Z0-9\u00C0-\u024F\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]+$/,
        "",
      );
      result = result.replace(/[!?,.:;"~_()[\]{}]/gu, "");
    }

    return result;
  }

  private matchesWithChatter(input: string, target: string): boolean {
    const inputRuns = this.toRuns(input);
    const targetRuns = this.toRuns(target);
    if (inputRuns.length !== targetRuns.length) return false;

    return inputRuns.every(
      (run, i) => run.char === targetRuns[i].char && run.count >= targetRuns[i].count,
    );
  }

  private toRuns(str: string): Array<{ char: string; count: number }> {
    const runs: Array<{ char: string; count: number }> = [];
    for (const char of str) {
      const last = runs[runs.length - 1];
      if (last && last.char === char) {
        last.count += 1;
      } else {
        runs.push({ char, count: 1 });
      }
    }
    return runs;
  }
}
