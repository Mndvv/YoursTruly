import type { CreateSongDto, UpdateSongDto } from "@yourstruly/contracts";
import { Elysia, t } from "elysia";
import type { RateLimitGuard } from "../middlewares/RateLimitGuard";
import type { TurnstileGuard } from "../middlewares/TurnstileGuard";
import type { SongService } from "../services/SongService";

export function createSongsController(
  songService: SongService,
  turnstile?: TurnstileGuard,
  rateLimiter?: RateLimitGuard,
) {
  return new Elysia({ prefix: "/api/songs" })
    .get("/", async ({ query }) => {
      const limit = query.limit ? Number(query.limit) : 50;
      const offset = query.offset ? Number(query.offset) : 0;
      return songService.listSongs(limit, offset);
    })
    .get("/:id", async ({ params, set }) => {
      const song = await songService.getSong(params.id);
      if (!song) {
        set.status = 404;
        return { error: "Song not found" };
      }
      return song;
    })
    .post(
      "/",
      async ({ body, set, headers }) => {
        const ip = String(headers["x-forwarded-for"] || "127.0.0.1");
        if (rateLimiter && !rateLimiter.check(ip).allowed) {
          set.status = 429;
          return { error: "Submission rate limit exceeded. Please wait a moment." };
        }

        const payload = body as CreateSongDto;
        if (turnstile?.isEnabled()) {
          const valid = await turnstile.verify(payload.turnstileToken, ip);
          if (!valid) {
            set.status = 403;
            return { error: "Turnstile verification failed" };
          }
        }

        const created = await songService.createSong(payload);
        set.status = 201;
        return created;
      },
      { body: t.Any() },
    )
    .put(
      "/:id",
      async ({ params, body, set, headers }) => {
        const payload = body as UpdateSongDto;
        const editToken = payload.editToken || headers["x-edit-token"];
        if (!editToken) {
          set.status = 401;
          return { error: "Missing required edit token" };
        }

        try {
          const updated = await songService.updateSong(params.id, {
            ...payload,
            editToken: String(editToken),
          });
          return updated;
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : "Update failed";
          set.status = msg.includes("Unauthorized") ? 401 : 400;
          return { error: msg };
        }
      },
      { body: t.Any() },
    )
    .post("/:id/play", async ({ params }) => {
      await songService.recordPlay(params.id);
      return { success: true };
    });
}
