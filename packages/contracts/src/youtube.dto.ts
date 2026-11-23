import { z } from "zod";

export const YouTubeMetadataDtoSchema = z.object({
  videoId: z.string(),
  title: z.string(),
  authorName: z.string(),
  authorUrl: z.string().optional(),
  thumbnailUrl: z.string(),
  parsedArtist: z.string().optional(),
  parsedTitle: z.string().optional(),
});
export type YouTubeMetadataDto = z.infer<typeof YouTubeMetadataDtoSchema>;

export const YouTubeSearchResultDtoSchema = z.object({
  id: z.string(),
  title: z.string(),
  channel: z.string(),
  duration: z.string().optional(),
  thumbnailUrl: z.string(),
});
export type YouTubeSearchResultDto = z.infer<typeof YouTubeSearchResultDtoSchema>;
