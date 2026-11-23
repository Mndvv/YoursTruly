import { integer, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const pgSongsTable = pgTable("songs", {
  id: text("id").primaryKey(),
  youtubeId: text("youtube_id").notNull(),
  title: text("title").notNull(),
  artist: text("artist").notNull(),
  languageCode: text("language_code").notNull().default("en"),
  videoStartMs: integer("video_start_ms").notNull().default(0),
  videoEndMs: integer("video_end_ms"),
  globalOffsetMs: integer("global_offset_ms").notNull().default(0),
  lyricsData: jsonb("lyrics_data").notNull(),
  editTokenHash: text("edit_token_hash").notNull(),
  playCount: integer("play_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const pgSongRevisionsTable = pgTable("song_revisions", {
  id: text("id").primaryKey(),
  songId: text("song_id")
    .notNull()
    .references(() => pgSongsTable.id, { onDelete: "cascade" }),
  lyricsDataSnapshot: jsonb("lyrics_data_snapshot").notNull(),
  changeNote: text("change_note"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
