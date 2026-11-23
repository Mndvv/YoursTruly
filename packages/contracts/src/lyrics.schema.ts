import { z } from "zod";

export const SyncLevelSchema = z.enum(["word", "line", "plain"]);
export type SyncLevel = z.infer<typeof SyncLevelSchema>;

export const WordTokenSchema = z.object({
  id: z.string(),
  text: z.string(),
  startMs: z.number().int().nonnegative().nullable(),
  endMs: z.number().int().nonnegative().nullable(),
  isGapEligible: z.boolean().default(true),
});
export type WordTokenData = z.infer<typeof WordTokenSchema>;

export const LyricLineSchema = z.object({
  id: z.string(),
  startMs: z.number().int().nonnegative().nullable(),
  endMs: z.number().int().nonnegative().nullable(),
  text: z.string(),
  transliteration: z.string().nullable().default(null),
  words: z.array(WordTokenSchema),
});
export type LyricLineData = z.infer<typeof LyricLineSchema>;

export const LyricsDataSchema = z.object({
  version: z.literal(1).default(1),
  source: z.string().default("lyrica"),
  syncLevel: SyncLevelSchema,
  hasTransliteration: z.boolean().default(false),
  lines: z.array(LyricLineSchema),
});
export type LyricsData = z.infer<typeof LyricsDataSchema>;
