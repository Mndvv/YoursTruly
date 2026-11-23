import { z } from "zod";
import { LyricsDataSchema } from "./lyrics.schema";

export const CreateSongDtoSchema = z.object({
  youtubeId: z.string().min(1).max(32),
  title: z.string().min(1).max(256),
  artist: z.string().min(1).max(256),
  languageCode: z.string().min(2).max(10).default("en"),
  videoStartMs: z.number().int().nonnegative().default(0),
  videoEndMs: z.number().int().nonnegative().nullable().optional(),
  globalOffsetMs: z.number().int().default(0),
  lyricsData: LyricsDataSchema,
  turnstileToken: z.string().optional(),
});
export type CreateSongDto = z.infer<typeof CreateSongDtoSchema>;

export const UpdateSongDtoSchema = z.object({
  title: z.string().min(1).max(256).optional(),
  artist: z.string().min(1).max(256).optional(),
  languageCode: z.string().min(2).max(10).optional(),
  videoStartMs: z.number().int().nonnegative().optional(),
  videoEndMs: z.number().int().nonnegative().nullable().optional(),
  globalOffsetMs: z.number().int().optional(),
  lyricsData: LyricsDataSchema.optional(),
  changeNote: z.string().max(500).optional(),
  editToken: z.string().min(16),
  turnstileToken: z.string().optional(),
});
export type UpdateSongDto = z.infer<typeof UpdateSongDtoSchema>;

export const SongSummaryDtoSchema = z.object({
  id: z.string(),
  youtubeId: z.string(),
  title: z.string(),
  artist: z.string(),
  languageCode: z.string(),
  playCount: z.number().int().nonnegative(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type SongSummaryDto = z.infer<typeof SongSummaryDtoSchema>;

export const SongDetailDtoSchema = SongSummaryDtoSchema.extend({
  videoStartMs: z.number().int().nonnegative(),
  videoEndMs: z.number().int().nonnegative().nullable(),
  globalOffsetMs: z.number().int(),
  lyricsData: LyricsDataSchema,
});
export type SongDetailDto = z.infer<typeof SongDetailDtoSchema>;

export const SongCreatedResponseDtoSchema = z.object({
  song: SongDetailDtoSchema,
  editToken: z.string(),
});
export type SongCreatedResponseDto = z.infer<typeof SongCreatedResponseDtoSchema>;

export const CatalogueExportDtoSchema = z.object({
  version: z.literal(1),
  exportedAt: z.string(),
  songs: z.array(SongDetailDtoSchema),
});
export type CatalogueExportDto = z.infer<typeof CatalogueExportDtoSchema>;

export const CatalogueImportResultDtoSchema = z.object({
  importedCount: z.number().int().nonnegative(),
  skippedCount: z.number().int().nonnegative(),
  errors: z.array(z.string()),
});
export type CatalogueImportResultDto = z.infer<typeof CatalogueImportResultDtoSchema>;
