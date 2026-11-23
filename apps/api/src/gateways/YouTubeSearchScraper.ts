import type { YouTubeSearchResultDto } from "@yourstruly/contracts";

interface VideoRendererItem {
  videoId?: string;
  title?: { runs?: Array<{ text: string }> };
  ownerText?: { runs?: Array<{ text: string }> };
  shortBylineText?: { runs?: Array<{ text: string }> };
  lengthText?: { simpleText?: string };
  thumbnail?: { thumbnails?: Array<{ url: string }> };
}

export class YouTubeSearchScraper {
  private readonly timeoutMs: number;

  constructor(timeoutMs = 8000) {
    this.timeoutMs = timeoutMs;
  }

  public async search(query: string, limit = 10): Promise<YouTubeSearchResultDto[]> {
    const cleanQuery = query.trim();
    if (!cleanQuery) return [];

    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(cleanQuery)}`;
    const response = await fetch(url, {
      signal: AbortSignal.timeout(this.timeoutMs),
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    if (!response.ok) {
      throw new Error(`YouTube search failed: HTTP ${response.status}`);
    }

    const html = await response.text();
    return this.parseInitialData(html, limit);
  }

  private parseInitialData(html: string, limit: number): YouTubeSearchResultDto[] {
    const match = html.match(/ytInitialData\s*=\s*({.+?});<\/script>/);
    if (!match) return [];

    try {
      const data = JSON.parse(match[1]);
      const sections =
        data.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer
          ?.contents ?? [];

      const results: YouTubeSearchResultDto[] = [];
      for (const section of sections) {
        const items = section?.itemSectionRenderer?.contents ?? [];
        for (const item of items) {
          const mapped = this.mapVideoRenderer(item.videoRenderer);
          if (!mapped) continue;
          results.push(mapped);
          if (results.length >= limit) return results;
        }
      }
      return results;
    } catch {
      return [];
    }
  }

  private mapVideoRenderer(v?: VideoRendererItem): YouTubeSearchResultDto | null {
    if (!v?.videoId || !v?.title) return null;
    const title = v.title.runs?.map((r) => r.text).join("") ?? "";
    const channel =
      v.ownerText?.runs?.[0]?.text ?? v.shortBylineText?.runs?.[0]?.text ?? "Unknown Artist";
    const duration = v.lengthText?.simpleText;
    const thumbnailUrl =
      v.thumbnail?.thumbnails?.[0]?.url ?? `https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg`;

    return {
      id: v.videoId,
      title,
      channel,
      duration,
      thumbnailUrl,
    };
  }
}
