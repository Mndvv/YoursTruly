export interface ValidationOptions {
  stripPunctuation?: boolean;
  ignoreDiacritics?: boolean;
}

export class AnswerValidator {
  public validate(userInput: string, targetWord: string, options: ValidationOptions = {}): boolean {
    const opts = {
      stripPunctuation: true,
      ignoreDiacritics: true,
      ...options,
    };

    const cleanInput = this.normalize(userInput, opts);
    const cleanTarget = this.normalize(targetWord, opts);

    return cleanInput.length > 0 && cleanInput === cleanTarget;
  }

  public normalize(text: string, options: ValidationOptions = {}): string {
    let result = text.trim().toLowerCase();

    if (options.ignoreDiacritics) {
      result = result.normalize("NFD").replace(/\p{Diacritic}/gu, "");
    }

    if (options.stripPunctuation) {
      result = result.replace(
        /^[^a-zA-Z0-9\u00C0-\u024F\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]+/,
        "",
      );
      result = result.replace(
        /[^a-zA-Z0-9\u00C0-\u024F\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]+$/,
        "",
      );
    }

    return result;
  }
}
