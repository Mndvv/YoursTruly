import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { SqliteSongRepository, createSqliteDb } from "@yourstruly/db";
import { Elysia } from "elysia";
import { createLyricsController } from "./controllers/lyrics.controller";
import { createSongsController } from "./controllers/songs.controller";
import { createYouTubeController } from "./controllers/youtube.controller";
import { LyricaGateway } from "./gateways/LyricaGateway";
import { YouTubeGateway } from "./gateways/YouTubeGateway";
import { RateLimitGuard } from "./middlewares/RateLimitGuard";
import { TurnstileGuard } from "./middlewares/TurnstileGuard";
import { SongService } from "./services/SongService";

export function createApp(
  dbPath = process.env.DATABASE_URL?.replace("file:", "") ?? "./data/yourstruly.db",
) {
  const db = createSqliteDb(dbPath);
  const songRepo = new SqliteSongRepository(db);
  const songService = new SongService(songRepo);

  const lyricaGateway = new LyricaGateway(process.env.LYRICA_BASE_URL);
  const youtubeGateway = new YouTubeGateway();

  const lyricaRateLimiter = new RateLimitGuard({ maxRequests: 15, windowMs: 60000 });
  const songRateLimiter = new RateLimitGuard({ maxRequests: 10, windowMs: 60000 });

  const turnstileGuard = new TurnstileGuard({
    enabled: process.env.TURNSTILE_ENABLED === "true",
    secretKey: process.env.TURNSTILE_SECRET_KEY,
  });

  return new Elysia()
    .use(cors())
    .use(
      swagger({
        documentation: {
          info: {
            title: "YoursTruly (OSS LingoClip) API",
            version: "1.0.0",
          },
        },
      }),
    )
    .get("/health", () => ({ status: "ok", timestamp: new Date().toISOString() }))
    .use(createLyricsController(lyricaGateway, lyricaRateLimiter))
    .use(createYouTubeController(youtubeGateway))
    .use(createSongsController(songService, turnstileGuard, songRateLimiter));
}

// Start standalone server when executed directly
if (import.meta.main) {
  const port = Number(process.env.PORT ?? 4000);
  const hostname = process.env.HOST ?? "0.0.0.0";
  const app = createApp();
  app.listen({ port, hostname });
  console.log(`YoursTruly API server listening on http://${hostname}:${port}`);
}
