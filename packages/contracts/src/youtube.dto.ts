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
