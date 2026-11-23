import { describe, expect, it } from "bun:test";
import type { CreateSongDto } from "@yourstruly/contracts";
import { createSqliteDb } from "../src/connection";
import { SqliteSongRepository } from "../src/repositories/SqliteSongRepository";

describe("SqliteSongRepository", () => {
  const db = createSqliteDb(":memory:");
  const repo = new SqliteSongRepository(db);

  const sampleDto: CreateSongDto = {
    youtubeId: "dQw4w9WgXcQ",
    title: "Never Gonna Give You Up",
    artist: "Rick Astley",
    languageCode: "en",
    videoStartMs: 0,
    videoEndMs: 212000,
    globalOffsetMs: 0,
    lyricsData: {
      version: 1,
      source: "lyrica",
      syncLevel: "line",
      hasTransliteration: false,
      lines: [
        {
          id: "l1",
          startMs: 18000,
          endMs: 22000,
          text: "Never gonna give you up",
          transliteration: null,
          words: [
            {
              id: "l1_w1",
              text: "Never",
              startMs: 18000,
              endMs: 18800,
              isGapEligible: true,
            },
          ],
        },
      ],
    },
  };

  it("creates and retrieves a song", async () => {
    const { song, id } = await repo.create(sampleDto, "fake-hash-123");
    expect(id).toBeDefined();
    expect(song.title).toBe("Never Gonna Give You Up");
    expect(song.lyricsData.lines.length).toBe(1);

    const fetched = await repo.findById(id);
    expect(fetched?.artist).toBe("Rick Astley");
  });

  it("updates song and tracks edit hash", async () => {
    const { id } = await repo.create(sampleDto, "sample-token-hash");
    const hash = await repo.getEditTokenHash(id);
    expect(hash).toBe("sample-token-hash");

    const updated = await repo.update(id, {
      title: "Never Gonna Give You Up (Remastered)",
      editToken: "sample-token",
    });
    expect(updated.title).toBe("Never Gonna Give You Up (Remastered)");
  });

  it("increments play count", async () => {
    const { id } = await repo.create(sampleDto, "hash");
    await repo.incrementPlayCount(id);
    await repo.incrementPlayCount(id);

    const fetched = await repo.findById(id);
    expect(fetched?.playCount).toBe(2);
  });

  it("deletes a song and its revisions", async () => {
    const { id } = await repo.create(sampleDto, "hash-delete");
    expect(await repo.findById(id)).not.toBeNull();

    const deleted = await repo.delete(id);
    expect(deleted).toBe(true);
    expect(await repo.findById(id)).toBeNull();
  });
});
