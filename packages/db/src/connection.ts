import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";

export function createSqliteDb(databasePath = ":memory:") {
  const sqlite = new Database(databasePath);
  sqlite.run("PRAGMA journal_mode = WAL;");
  sqlite.run("PRAGMA foreign_keys = ON;");

  // Auto-init schema if not present
  sqlite.run(`
    CREATE TABLE IF NOT EXISTS songs (
      id TEXT PRIMARY KEY,
      youtube_id TEXT NOT NULL,
      title TEXT NOT NULL,
      artist TEXT NOT NULL,
      language_code TEXT NOT NULL DEFAULT 'en',
      video_start_ms INTEGER NOT NULL DEFAULT 0,
      video_end_ms INTEGER,
      global_offset_ms INTEGER NOT NULL DEFAULT 0,
      lyrics_data TEXT NOT NULL,
      edit_token_hash TEXT NOT NULL,
      play_count INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  sqlite.run(`
    CREATE TABLE IF NOT EXISTS song_revisions (
      id TEXT PRIMARY KEY,
      song_id TEXT NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
      lyrics_data_snapshot TEXT NOT NULL,
      change_note TEXT,
      created_at TEXT NOT NULL
    );
  `);

  return drizzle(sqlite);
}
