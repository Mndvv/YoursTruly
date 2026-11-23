import { describe, expect, it } from "bun:test";
import type { CreateSongDto } from "@yourstruly/contracts";
import { createApp } from "../src/index";

describe("Elysia API Integration Tests", () => {
  const app = createApp(":memory:");

  const sampleSong: CreateSongDto = {
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
      syncLevel: "word",
      hasTransliteration: false,
      lines: [
        {
          id: "l1",
          startMs: 18000,
          endMs: 22000,
          text: "Never gonna give you up",
          transliteration: null,
          words: [
            { id: "w1", text: "Never", startMs: 18000, endMs: 18800, isGapEligible: true },
            { id: "w2", text: "gonna", startMs: 18800, endMs: 19500, isGapEligible: true },
          ],
        },
      ],
    },
  };

  it("GET /health returns status ok", async () => {
    const res = await app.handle(new Request("http://localhost/health"));
    expect(res.status).toBe(200);
    const body = (await res.json()) as { status: string };
    expect(body.status).toBe("ok");
  });

  it("POST /api/songs creates song and returns editToken", async () => {
    const res = await app.handle(
      new Request("http://localhost/api/songs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sampleSong),
      }),
    );

    expect(res.status).toBe(201);
    const body = (await res.json()) as { song: { id: string; title: string }; editToken: string };
    expect(body.song.title).toBe("Never Gonna Give You Up");
    expect(body.editToken).toBeDefined();
    expect(body.editToken.length).toBeGreaterThan(16);

    const songId = body.song.id;
    const token = body.editToken;

    // Fetch details
    const detailRes = await app.handle(new Request(`http://localhost/api/songs/${songId}`));
    expect(detailRes.status).toBe(200);

    // Update with wrong token -> 401
    const badUpdateRes = await app.handle(
      new Request(`http://localhost/api/songs/${songId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Hacked", editToken: "wrong_token" }),
      }),
    );
    expect(badUpdateRes.status).toBe(401);

    // Update with valid token -> 200
    const goodUpdateRes = await app.handle(
      new Request(`http://localhost/api/songs/${songId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Updated Title", editToken: token }),
      }),
    );
    expect(goodUpdateRes.status).toBe(200);
    const updatedBody = (await goodUpdateRes.json()) as { title: string };
    expect(updatedBody.title).toBe("Updated Title");

    // Record play
    const playRes = await app.handle(
      new Request(`http://localhost/api/songs/${songId}/play`, { method: "POST" }),
    );
    expect(playRes.status).toBe(200);
  });

  it("GET /api/songs lists all songs", async () => {
    const res = await app.handle(new Request("http://localhost/api/songs"));
    expect(res.status).toBe(200);
    const body = (await res.json()) as unknown[];
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThanOrEqual(1);
  });

  it("DELETE /api/songs/:id deletes song", async () => {
    const createRes = await app.handle(
      new Request("http://localhost/api/songs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sampleSong),
      }),
    );
    const { song, editToken } = (await createRes.json()) as {
      song: { id: string };
      editToken: string;
    };

    const badDelete = await app.handle(
      new Request(`http://localhost/api/songs/${song.id}`, {
        method: "DELETE",
        headers: { "x-edit-token": "wrong" },
      }),
    );
    expect(badDelete.status).toBe(401);

    const goodDelete = await app.handle(
      new Request(`http://localhost/api/songs/${song.id}`, {
        method: "DELETE",
        headers: { "x-edit-token": editToken },
      }),
    );
    expect(goodDelete.status).toBe(200);

    const getRes = await app.handle(new Request(`http://localhost/api/songs/${song.id}`));
    expect(getRes.status).toBe(404);
  });

  it("GET /api/songs/export and POST /api/songs/import handles full catalogue round-trip", async () => {
    // 1. Create a song to export
    await app.handle(
      new Request("http://localhost/api/songs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...sampleSong, title: "Export Test Song" }),
      }),
    );

    // 2. Export catalogue
    const exportRes = await app.handle(new Request("http://localhost/api/songs/export"));
    expect(exportRes.status).toBe(200);
    const exported = (await exportRes.json()) as { version: number; songs: unknown[] };
    expect(exported.version).toBe(1);
    expect(Array.isArray(exported.songs)).toBe(true);
    expect(exported.songs.length).toBeGreaterThanOrEqual(1);

    // 3. Import catalogue
    const importRes = await app.handle(
      new Request("http://localhost/api/songs/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(exported),
      }),
    );
    expect(importRes.status).toBe(200);
    const importResult = (await importRes.json()) as {
      importedCount: number;
      skippedCount: number;
    };
    expect(importResult.importedCount).toBeGreaterThanOrEqual(1);
    expect(importResult.skippedCount).toBe(0);
  });
});
