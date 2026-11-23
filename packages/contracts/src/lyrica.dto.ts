import { z } from "zod";

export const LyricaQuerySchema = z.object({
  artist: z.string().min(1),
  song: z.string().min(1),
  timestamps: z.boolean().default(true),
  word: z.boolean().default(true),
  romanize: z.boolean().default(true),
  language: z.string().default("en"),
});
export type LyricaQuery = z.infer<typeof LyricaQuerySchema>;

export const LyricaWordItemSchema = z.object({
  word: z.string(),
  start: z.number(),
  end: z.number(),
});
export type LyricaWordItem = z.infer<typeof LyricaWordItemSchema>;

export const LyricaLineItemSchema = z.object({
  id: z.string().optional(),
  text: z.string(),
  start_time: z.number().optional(),
  end_time: z.number().optional(),
  words: z.array(LyricaWordItemSchema).optional(),
});
export type LyricaLineItem = z.infer<typeof LyricaLineItemSchema>;

export const LyricaDataPayloadSchema = z.object({
  source: z.string(),
  artist: z.string(),
  title: z.string(),
  hasTimestamps: z.boolean().optional(),
  lyrics: z.union([z.string(), z.array(LyricaLineItemSchema)]),
  timed_lyrics: z.array(LyricaLineItemSchema).optional(),
  translated_lyrics: z.string().optional(),
  romanized_lyrics: z.string().optional(),
});
export type LyricaDataPayload = z.infer<typeof LyricaDataPayloadSchema>;

export const LyricaApiResponseSchema = z.object({
  status: z.enum(["success", "error"]),
  data: LyricaDataPayloadSchema.optional(),
  error: z
    .object({
      message: z.string(),
      timestamp: z.string().optional(),
    })
    .optional(),
});
export type LyricaApiResponse = z.infer<typeof LyricaApiResponseSchema>;
