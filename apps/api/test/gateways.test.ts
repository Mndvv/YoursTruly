import { describe, expect, it } from "bun:test";
import { LyricaGateway } from "../src/gateways/LyricaGateway";
import { YouTubeGateway } from "../src/gateways/YouTubeGateway";

describe("YouTubeGateway", () => {
  const yt = new YouTubeGateway();

  it("extracts 11-char video ID from various YouTube URL formats", () => {
    expect(yt.extractVideoId("dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
    expect(yt.extractVideoId("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
    expect(yt.extractVideoId("https://youtu.be/dQw4w9WgXcQ?si=abc")).toBe("dQw4w9WgXcQ");
    expect(yt.extractVideoId("https://www.youtube.com/embed/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
    expect(yt.extractVideoId("not_valid")).toBeNull();
    expect(yt.extractVideoId("https://example.com/not-youtube")).toBeNull();
  });
});

describe("LyricaGateway", () => {
  it("formats query params and returns error structure on unreachable server", async () => {
    const gateway = new LyricaGateway("http://127.0.0.1:59999", 500);
    const result = await gateway.fetchLyrics({
      artist: "Coldplay",
      song: "Yellow",
      timestamps: true,
      word: true,
      romanize: true,
      language: "en",
    });

    expect(result.status).toBe("error");
    expect(result.error?.message).toContain("Lyrica gateway error");
  });
});
