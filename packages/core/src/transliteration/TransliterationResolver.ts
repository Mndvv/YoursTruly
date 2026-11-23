import type { LyricLine } from "../domain/LyricLine";
import type { ITransliterationProvider } from "./ITransliterationProvider";

export class TransliterationResolver {
  private readonly providers: readonly ITransliterationProvider[];

  constructor(providers: ITransliterationProvider[] = []) {
    this.providers = providers;
  }

  public async resolveLine(line: LyricLine, languageCode: string): Promise<string | null> {
    const existing = line.getTransliteration();
    if (existing && existing.trim().length > 0) {
      return existing;
    }

    const provider = this.providers.find((p) => p.canTransliterate(languageCode));
    if (!provider) {
      return null;
    }

    return await provider.transliterate(line.getText(), languageCode);
  }

  public async resolveAll(lines: readonly LyricLine[], languageCode: string): Promise<string[]> {
    return Promise.all(
      lines.map(async (line) => {
        const result = await this.resolveLine(line, languageCode);
        return result ?? line.getText();
      }),
    );
  }
}
