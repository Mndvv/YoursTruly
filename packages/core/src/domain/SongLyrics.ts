import type { LyricsData, SyncLevel } from "@yourstruly/contracts";
import type { LyricLine } from "./LyricLine";

export interface SongLyricsConfig {
  version?: number;
  source?: string;
  syncLevel: SyncLevel;
  hasTransliteration?: boolean;
  lines: LyricLine[];
}

export class SongLyrics {
  private readonly version: number;
  private readonly source: string;
  private readonly syncLevel: SyncLevel;
  private readonly transliteration: boolean;
  private readonly lines: readonly LyricLine[];

  constructor(config: SongLyricsConfig) {
    this.version = config.version ?? 1;
    this.source = config.source ?? "lyrica";
    this.syncLevel = config.syncLevel;
    this.transliteration = config.hasTransliteration ?? false;
    this.lines = [...config.lines];
  }

  public getVersion(): number {
    return this.version;
  }

  public getSource(): string {
    return this.source;
  }

  public getSyncLevel(): SyncLevel {
    return this.syncLevel;
  }

  public hasTransliteration(): boolean {
    return this.transliteration;
  }

  public getLines(): readonly LyricLine[] {
    return this.lines;
  }

  public applyGlobalOffset(offsetMs: number): SongLyrics {
    if (offsetMs === 0) return this;
    return new SongLyrics({
      version: this.version,
      source: this.source,
      syncLevel: this.syncLevel,
      hasTransliteration: this.transliteration,
      lines: this.lines.map((l) => l.shift(offsetMs)),
    });
  }

  public toData(): LyricsData {
    return {
      version: 1,
      source: this.source,
      syncLevel: this.syncLevel,
      hasTransliteration: this.transliteration,
      lines: this.lines.map((l) => l.toData()),
    };
  }
}
