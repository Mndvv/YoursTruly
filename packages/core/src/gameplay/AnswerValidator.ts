export interface ValidationOptions {
  stripPunctuation?: boolean;
  ignoreDiacritics?: boolean;
  ignoreApostrophes?: boolean;
}

export class AnswerValidator {
  public validate(userInput: string, targetWord: string, options: ValidationOptions = {}): boolean {
    const opts: ValidationOptions = {
      stripPunctuation: true,
      ignoreDiacritics: true,
      ignoreApostrophes: true,
      ...options,
    };

    const cleanInput = this.normalize(userInput, opts);
    const cleanTarget = this.normalize(targetWord, opts);

    return cleanInput.length > 0 && cleanInput === cleanTarget;
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
}
