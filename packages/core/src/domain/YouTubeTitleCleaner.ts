export interface ParsedTrackInfo {
  artist: string;
  song: string;
}

export class YouTubeTitleCleaner {
  public clean(rawTitle: string, authorName = ""): ParsedTrackInfo {
    const cleanAuthor = this.cleanAuthorName(authorName);
    let title = rawTitle.trim();

    // Remove trailing pipes like "| Star Guardian 2022" or "| Official Video"
    title = title.replace(/\s*\|.*$/, "").trim();

    // Remove common video/audio suffixes in parentheses or brackets
    title = title
      .replace(
        /\s*[\(\[](?:official\s+)?(?:music\s+)?(?:lyric\s+)?(?:video|audio|visualizer|mv|lyrics|hd|4k|remastered|explicit|clean|live.*|version)[\)\]]/gi,
        "",
      )
      .trim();

    // Check for "Artist - Title" separator
    const dashIndex = title.indexOf(" - ");
    if (dashIndex > 0) {
      const candidateArtist = title.substring(0, dashIndex).trim();
      const candidateSong = title.substring(dashIndex + 3).trim();

      return {
        artist: cleanAuthor || candidateArtist,
        song: candidateSong,
      };
    }

    return {
      artist: cleanAuthor,
      song: title,
    };
  }

  private cleanAuthorName(author: string): string {
    return author
      .replace(/\s*-\s*topic$/i, "")
      .replace(/vevo$/i, "")
      .replace(/\s*official$/i, "")
      .trim();
  }
}
