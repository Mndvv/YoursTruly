import type { YouTubeMetadataDto } from "@yourstruly/contracts";
import { YouTubeTitleCleaner } from "@yourstruly/core";
import type { IYouTubeGateway } from "./IYouTubeGateway";

interface OEmbedResponse {
  title: string;
  author_name: string;
  author_url?: string;
  thumbnail_url?: string;
}

export class YouTubeGateway implements IYouTubeGateway {
  private readonly timeoutMs: number;
  private readonly titleCleaner = new YouTubeTitleCleaner();

  constructor(timeoutMs = 8000) {
    this.timeoutMs = timeoutMs;
  }

  public async fetchMetadata(rawInput: string): Promise<YouTubeMetadataDto> {
    const videoId = this.extractVideoId(rawInput);
    if (!videoId) {
      throw new Error(`Invalid YouTube video ID or URL: ${rawInput}`);
    }

    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;

    const response = await fetch(oembedUrl, {
      signal: AbortSignal.timeout(this.timeoutMs),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch YouTube metadata for ${videoId}: HTTP ${response.status}`);
    }

    const data = (await response.json()) as OEmbedResponse;
    const rawTitle = data.title ?? "Untitled Video";
    const authorName = data.author_name ?? "Unknown Artist";
    const parsed = this.titleCleaner.clean(rawTitle, authorName);

    return {
      videoId,
      title: rawTitle,
      authorName,
      authorUrl: data.author_url,
      thumbnailUrl: data.thumbnail_url ?? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      parsedArtist: parsed.artist,
      parsedTitle: parsed.song,
    };
  }

  public extractVideoId(input: string): string | null {
    const clean = input.trim();
    if (/^[a-zA-Z0-9_-]{11}$/.test(clean)) {
      return clean;
    }

    const regExp =
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = clean.match(regExp);
    return match ? match[1] : null;
  }
}
