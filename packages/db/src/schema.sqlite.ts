import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const songsTable = sqliteTable("songs", {
  id: text("id").primaryKey(),
  youtubeId: text("youtube_id").notNull(),
  title: text("title").notNull(),
  artist: text("artist").notNull(),
  languageCode: text("language_code").notNull().default("en"),
  videoStartMs: integer("video_start_ms").notNull().default(0),
  videoEndMs: integer("video_end_ms"),
  globalOffsetMs: integer("global_offset_ms").notNull().default(0),
  lyricsDataJson: text("lyrics_data").notNull(),
  editTokenHash: text("edit_token_hash").notNull(),
  playCount: integer("play_count").notNull().default(0),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const songRevisionsTable = sqliteTable("song_revisions", {
  id: text("id").primaryKey(),
  songId: text("song_id")
    .notNull()
    .references(() => songsTable.id, { onDelete: "cascade" }),
  lyricsDataSnapshot: text("lyrics_data_snapshot").notNull(),
  changeNote: text("change_note"),
  createdAt: text("created_at").notNull(),
});

export type SongRow = typeof songsTable.$inferSelect;
export type InsertSongRow = typeof songsTable.$inferInsert;
export type SongRevisionRow = typeof songRevisionsTable.$inferSelect;
export type InsertSongRevisionRow = typeof songRevisionsTable.$inferInsert;
