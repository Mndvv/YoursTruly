export interface ITransliterationProvider {
  canTransliterate(languageCode: string): boolean;
  transliterate(text: string, languageCode: string): Promise<string> | string;
}
