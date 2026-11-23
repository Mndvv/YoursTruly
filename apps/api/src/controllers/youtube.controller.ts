import { Elysia, t } from "elysia";
import type { IYouTubeGateway } from "../gateways/IYouTubeGateway";

export function createYouTubeController(gateway: IYouTubeGateway) {
  return new Elysia({ prefix: "/api/youtube" }).get(
    "/metadata",
    async ({ query, set }) => {
      try {
        const input = query.url ?? query.id;
        if (!input) {
          set.status = 400;
          return { error: "Missing required parameter: 'url' or 'id'" };
        }

        const metadata = await gateway.fetchMetadata(input);
        return metadata;
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
  );
}
