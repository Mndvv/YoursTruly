import type { LyricaApiResponse, LyricaQuery } from "@yourstruly/contracts";
import type { ILyricaGateway, LyricaSuggestionItem } from "./ILyricaGateway";

export class LyricaGateway implements ILyricaGateway {
  private readonly baseUrl: string;
  private readonly timeoutMs: number;

  constructor(baseUrl = "https://lyrica.collei.my.id", timeoutMs = 10000) {
    this.baseUrl = baseUrl.replace(/\/+$/, "");
    this.timeoutMs = timeoutMs;
  }

  public async fetchLyrics(query: LyricaQuery, sequence?: string): Promise<LyricaApiResponse> {
    const url = this.buildUrl(query, sequence);

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(this.timeoutMs),
      });

      const body = (await response.json()) as LyricaApiResponse;
      if (!response.ok) {
        return {
          status: "error",
          error: {
            message: body.error?.message ?? `Lyrica returned HTTP ${response.status}`,
          },
        };
      }

      return body;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error while querying Lyrica";
      return {
        status: "error",
        error: { message: `Lyrica gateway error: ${message}` },
      };
    }
  }

  public async fetchSuggestions(keyword: string): Promise<LyricaSuggestionItem[]> {
    if (!keyword.trim()) return [];

    try {
      const url = `${this.baseUrl}/suggestion?q=${encodeURIComponent(keyword.trim())}&limit=8`;
      const response = await fetch(url, { signal: AbortSignal.timeout(this.timeoutMs) });
      if (!response.ok) return [];

      const body = (await response.json()) as Record<string, unknown>;
      const rawList = (body.results ??
        body.suggestions ??
        (body.data as Record<string, unknown>)?.suggestions) as unknown[];

      if (!Array.isArray(rawList)) return [];

      return rawList
        .filter((item): item is { title: string; artist: string } => {
          return typeof item === "object" && item !== null && "title" in item && "artist" in item;
        })
        .map((item) => ({
          title: String(item.title),
          artist: String(item.artist),
        }));
    } catch {
      return [];
    }
  }

  private buildUrl(query: LyricaQuery, sequence?: string): string {
    const params = new URLSearchParams({
      artist: query.artist,
      song: query.song,
      timestamps: String(query.timestamps),
      word: String(query.word),
      romanize: String(query.romanize),
      language: query.language,
    });
    if (sequence) {
      params.append("sequence", sequence);
      params.append("pass", "true");
    }
    return `${this.baseUrl}/lyrics/?${params.toString()}`;
  }
}
