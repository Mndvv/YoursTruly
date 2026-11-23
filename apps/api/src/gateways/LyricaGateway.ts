import type { LyricaApiResponse, LyricaQuery } from "@yourstruly/contracts";
import type { ILyricaGateway } from "./ILyricaGateway";

export class LyricaGateway implements ILyricaGateway {
  private readonly baseUrl: string;
  private readonly timeoutMs: number;

  constructor(baseUrl = "https://lyrica.collei.my.id", timeoutMs = 10000) {
    this.baseUrl = baseUrl.replace(/\/+$/, "");
    this.timeoutMs = timeoutMs;
  }

  public async fetchLyrics(query: LyricaQuery): Promise<LyricaApiResponse> {
    const url = this.buildUrl(query);

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

  private buildUrl(query: LyricaQuery): string {
    const params = new URLSearchParams({
      artist: query.artist,
      song: query.song,
      timestamps: String(query.timestamps),
      word: String(query.word),
      romanize: String(query.romanize),
      language: query.language,
    });
    return `${this.baseUrl}/lyrics/?${params.toString()}`;
  }
}
