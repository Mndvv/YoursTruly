import type { LyricaApiResponse, LyricaQuery } from "@yourstruly/contracts";

export interface LyricaSuggestionItem {
  title: string;
  artist: string;
}

export interface ILyricaGateway {
  fetchLyrics(query: LyricaQuery, sequence?: string): Promise<LyricaApiResponse>;
  fetchSuggestions(keyword: string): Promise<LyricaSuggestionItem[]>;
}
