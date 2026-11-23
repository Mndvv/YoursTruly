import { describe, expect, it } from "bun:test";
import type { LyricaApiResponse, LyricaQuery } from "@yourstruly/contracts";
import type { ILyricaGateway, LyricaSuggestionItem } from "../src/gateways/ILyricaGateway";
import { LyricCandidateService } from "../src/services/LyricCandidateService";

describe("LyricCandidateService", () => {
  const mockGateway: ILyricaGateway = {
    async fetchSuggestions(_keyword: string): Promise<LyricaSuggestionItem[]> {
      return [{ title: "Everything Goes On", artist: "Porter Robinson" }];
    },
    async fetchLyrics(query: LyricaQuery): Promise<LyricaApiResponse> {
      return {
        status: "success",
        data: {
          source: "lrclib",
          artist: query.artist,
          title: query.song,
          hasTimestamps: true,
          lyrics:
            "[00:16.10] Don't try to make yourself remember, darling\n[00:22.16] Don't look for me",
        },
      };
    },
  };

  it("finds candidates by keyword query and sets syncLevel", async () => {
    const service = new LyricCandidateService(mockGateway);
    const candidates = await service.findCandidates({ q: "Porter Robinson" });

    expect(candidates.length).toBeGreaterThan(0);
    expect(candidates[0].artist).toBe("Porter Robinson");
    expect(candidates[0].title).toBe("Everything Goes On");
    expect(candidates[0].syncLevel).toBe("line");
    expect(candidates[0].sampleText).toContain("Don't try to make yourself remember");
  });
});
