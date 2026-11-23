import { Elysia, t } from "elysia";
import type { IYouTubeGateway } from "../gateways/IYouTubeGateway";

export function createYouTubeController(gateway: IYouTubeGateway) {
  return new Elysia({ prefix: "/api/youtube" })
    .get(
      "/metadata",
      async ({ query, set }) => {
        try {
          const input = query.url ?? query.id;
          if (!input) {
            set.status = 400;
            return { error: "Missing required parameter: 'url' or 'id'" };
          }

          return await gateway.fetchMetadata(input);
        } catch (err: unknown) {
          set.status = 400;
          const message = err instanceof Error ? err.message : "Failed to fetch YouTube metadata";
          return { error: message };
        }
      },
      {
        query: t.Object({
          url: t.Optional(t.String()),
          id: t.Optional(t.String()),
        }),
      },
    )
    .get(
      "/search",
      async ({ query, set }) => {
        try {
          const q = query.q?.trim();
          if (!q) {
            set.status = 400;
            return { error: "Missing required query parameter: 'q'" };
          }
          const limit = query.limit ? Math.min(Number(query.limit), 20) : 10;
          return await gateway.search(q, limit);
        } catch (err: unknown) {
          set.status = 500;
          const message = err instanceof Error ? err.message : "Failed to search YouTube";
          return { error: message };
        }
      },
      {
        query: t.Object({
          q: t.String(),
          limit: t.Optional(t.String()),
        }),
      },
    );
}
