import type { YouTubeMetadataDto } from "@yourstruly/contracts";

export interface IYouTubeGateway {
  fetchMetadata(videoId: string): Promise<YouTubeMetadataDto>;
}
