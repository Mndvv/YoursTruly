import { describe, expect, it } from "bun:test";
import { YouTubeTitleCleaner } from "../src/domain/YouTubeTitleCleaner";

describe("YouTubeTitleCleaner", () => {
  const cleaner = new YouTubeTitleCleaner();

  it("cleans user reported Porter Robinson title", () => {
    const raw = "Porter Robinson - Everything Goes On (Official Lyric Video) | Star Guardian 2022";
    const author = "Porter Robinson";
    const result = cleaner.clean(raw, author);

    expect(result.artist).toBe("Porter Robinson");
    expect(result.song).toBe("Everything Goes On");
  });

  it("handles topic channels and brackets", () => {
    const raw = "Coldplay - Yellow [Official Audio]";
    const author = "Coldplay - Topic";
    const result = cleaner.clean(raw, author);

    expect(result.artist).toBe("Coldplay");
    expect(result.song).toBe("Yellow");
  });

  it("handles title without dash separator", () => {
    const raw = "Bohemian Rhapsody (Live at Wembley)";
    const author = "Queen Official";
    const result = cleaner.clean(raw, author);

    expect(result.artist).toBe("Queen");
    expect(result.song).toBe("Bohemian Rhapsody");
  });

  it("detects lyric videos by title keywords", () => {
    expect(
      cleaner.isLyricVideo("Porter Robinson - Everything Goes On (Official Lyric Video)"),
    ).toBe(true);
    expect(cleaner.isLyricVideo("Taylor Swift - Cardigan (Lyrics)")).toBe(true);
    expect(cleaner.isLyricVideo("Song Name (Lyricss video)")).toBe(true);
    expect(cleaner.isLyricVideo("Coldplay - Yellow [Official Music Video]")).toBe(false);
    expect(cleaner.isLyricVideo("Radiohead - Creep (Live)")).toBe(false);
  });
});
