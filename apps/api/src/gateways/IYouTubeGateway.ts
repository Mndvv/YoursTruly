import type { YouTubeMetadataDto, YouTubeSearchResultDto } from "@yourstruly/contracts";

export interface IYouTubeGateway {
  fetchMetadata(videoId: string): Promise<YouTubeMetadataDto>;
  search(query: string, limit?: number): Promise<YouTubeSearchResultDto[]>;
}
