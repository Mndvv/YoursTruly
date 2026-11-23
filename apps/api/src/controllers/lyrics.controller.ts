import type { LyricaQuery } from "@yourstruly/contracts";
import { LyricsNormalizer } from "@yourstruly/core";
import { Elysia, t } from "elysia";
import type { ILyricaGateway } from "../gateways/ILyricaGateway";
import type { RateLimitGuard } from "../middlewares/RateLimitGuard";

function toLyricaQuery(raw: Record<string, unknown>): LyricaQuery {
  return {
    artist: String(raw.artist ?? ""),
    song: String(raw.song ?? ""),
    timestamps: raw.timestamps !== false && raw.timestamps !== "false",
    word: raw.word !== false && raw.word !== "false",
    romanize: raw.romanize !== false && raw.romanize !== "false",
    language: String(raw.language ?? "en"),
  };
}

export function createLyricsController(gateway: ILyricaGateway, rateLimiter?: RateLimitGuard) {
  const normalizer = new LyricsNormalizer();

  return new Elysia({ prefix: "/api/lyrics" }).get(
    "/search",
    async ({ query, set, headers }) => {
      const ip = String(headers["x-forwarded-for"] || "127.0.0.1");
      if (rateLimiter && !rateLimiter.check(ip).allowed) {
        set.status = 429;
        return { error: "Rate limit exceeded. Please wait a moment." };
      }

      const lyricaQuery = toLyricaQuery(query);
      const raw = await gateway.fetchLyrics(lyricaQuery);

      if (raw.status !== "success" || !raw.data) {
        set.status = 404;
        return { error: raw.error?.message ?? "Lyrics not found" };
      }

      const shouldNormalize = query.normalize === "true" || query.normalize === true;
      const normalized = shouldNormalize ? normalizer.normalize(raw.data).toData() : null;

      return { raw: raw.data, normalized };
    },
    {
      query: t.Object({
        artist: t.String({ minLength: 1 }),
        song: t.String({ minLength: 1 }),
        timestamps: t.Optional(t.Union([t.Boolean(), t.String()])),
        word: t.Optional(t.Union([t.Boolean(), t.String()])),
        romanize: t.Optional(t.Union([t.Boolean(), t.String()])),
        language: t.Optional(t.String()),
        normalize: t.Optional(t.Union([t.Boolean(), t.String()])),
      }),
    },
  );
}
