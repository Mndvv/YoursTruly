import { randomUUID } from "node:crypto";
import type {
  CreateSongDto,
  LyricsData,
  SongDetailDto,
  SongSummaryDto,
  UpdateSongDto,
} from "@yourstruly/contracts";
import { desc, eq, sql } from "drizzle-orm";
import type { BunSQLiteDatabase } from "drizzle-orm/bun-sqlite";
import { type SongRow, songRevisionsTable, songsTable } from "../schema.sqlite";
import type { ISongRepository } from "./ISongRepository";

export class SqliteSongRepository implements ISongRepository {
  private readonly db: BunSQLiteDatabase;

  constructor(db: BunSQLiteDatabase) {
    this.db = db;
  }

  public async findById(id: string): Promise<SongDetailDto | null> {
    const rows = this.db.select().from(songsTable).where(eq(songsTable.id, id)).all();
    if (rows.length === 0) return null;
    return this.mapToDetailDto(rows[0]);
  }

  public async findAll(limit = 50, offset = 0): Promise<SongSummaryDto[]> {
    const rows = this.db
      .select()
      .from(songsTable)
      .orderBy(desc(songsTable.createdAt))
      .limit(limit)
      .offset(offset)
      .all();

    return rows.map((r) => this.mapToSummaryDto(r));
  }

  public async create(
    dto: CreateSongDto,
    editTokenHash: string,
  ): Promise<{ song: SongDetailDto; id: string }> {
    const id = randomUUID();
    const now = new Date().toISOString();
    const lyricsJson = JSON.stringify(dto.lyricsData);

    this.db
      .insert(songsTable)
      .values({
        id,
        youtubeId: dto.youtubeId,
        title: dto.title,
        artist: dto.artist,
        languageCode: dto.languageCode,
        videoStartMs: dto.videoStartMs ?? 0,
        videoEndMs: dto.videoEndMs ?? null,
        globalOffsetMs: dto.globalOffsetMs ?? 0,
        lyricsDataJson: lyricsJson,
        editTokenHash,
        playCount: 0,
        createdAt: now,
        updatedAt: now,
      })
      .run();

    const created = await this.findById(id);
    if (!created) throw new Error("Failed to retrieve created song");
    return { song: created, id };
  }

  public async update(id: string, dto: UpdateSongDto): Promise<SongDetailDto> {
    const existing = await this.findById(id);
    if (!existing) throw new Error(`Song not found: ${id}`);

    const now = new Date().toISOString();
    const updateValues: Partial<SongRow> = { updatedAt: now };

    if (dto.title) updateValues.title = dto.title;
    if (dto.artist) updateValues.artist = dto.artist;
    if (dto.languageCode) updateValues.languageCode = dto.languageCode;
    if (dto.videoStartMs !== undefined) updateValues.videoStartMs = dto.videoStartMs;
    if (dto.videoEndMs !== undefined) updateValues.videoEndMs = dto.videoEndMs;
    if (dto.globalOffsetMs !== undefined) updateValues.globalOffsetMs = dto.globalOffsetMs;

    if (dto.lyricsData) {
      updateValues.lyricsDataJson = JSON.stringify(dto.lyricsData);
      this.db
        .insert(songRevisionsTable)
        .values({
          id: randomUUID(),
          songId: id,
          lyricsDataSnapshot: updateValues.lyricsDataJson,
          changeNote: dto.changeNote ?? "Lyrics updated",
          createdAt: now,
        })
        .run();
    }

    this.db.update(songsTable).set(updateValues).where(eq(songsTable.id, id)).run();

    const updated = await this.findById(id);
    if (!updated) throw new Error("Failed to retrieve updated song");
    return updated;
  }

  public async incrementPlayCount(id: string): Promise<void> {
    this.db
      .update(songsTable)
      .set({ playCount: sql`${songsTable.playCount} + 1` })
      .where(eq(songsTable.id, id))
      .run();
  }

  public async getEditTokenHash(id: string): Promise<string | null> {
    const rows = this.db
      .select({ hash: songsTable.editTokenHash })
      .from(songsTable)
      .where(eq(songsTable.id, id))
      .all();
    return rows[0]?.hash ?? null;
  }

  private mapToSummaryDto(row: SongRow): SongSummaryDto {
    return {
      id: row.id,
      youtubeId: row.youtubeId,
      title: row.title,
      artist: row.artist,
      languageCode: row.languageCode,
      playCount: row.playCount,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  private mapToDetailDto(row: SongRow): SongDetailDto {
    const lyricsData: LyricsData = JSON.parse(row.lyricsDataJson);
    return {
      ...this.mapToSummaryDto(row),
      videoStartMs: row.videoStartMs,
      videoEndMs: row.videoEndMs,
      globalOffsetMs: row.globalOffsetMs,
      lyricsData,
    };
  }
}
