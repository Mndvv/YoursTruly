import type { LyricLineData } from "@yourstruly/contracts";
import { TimestampMs } from "./TimestampMs";
import type { WordToken } from "./WordToken";

export interface LyricLineConfig {
  id: string;
  startMs: number | null;
  endMs: number | null;
  text: string;
  transliteration?: string | null;
  words: WordToken[];
}

export class LyricLine {
  private readonly id: string;
  private readonly start: TimestampMs | null;
  private readonly end: TimestampMs | null;
  private readonly text: string;
  private readonly transliteration: string | null;
  private readonly words: readonly WordToken[];

  constructor(config: LyricLineConfig) {
    this.id = config.id;
    this.text = config.text.trim();
    this.start = config.startMs !== null ? TimestampMs.from(config.startMs) : null;
    this.end = config.endMs !== null ? TimestampMs.from(config.endMs) : null;
    this.transliteration = config.transliteration ?? null;
    this.words = [...config.words];
  }

  public getId(): string {
    return this.id;
  }

  public getText(): string {
    return this.text;
  }

  public getStartMs(): number | null {
    return this.start?.getValue() ?? null;
  }

  public getEndMs(): number | null {
    return this.end?.getValue() ?? null;
  }

  public getTransliteration(): string | null {
    return this.transliteration;
  }

  public getWords(): readonly WordToken[] {
    return this.words;
  }

  public shift(deltaMs: number): LyricLine {
    return new LyricLine({
      id: this.id,
      text: this.text,
      startMs: this.start ? this.start.add(deltaMs).getValue() : null,
      endMs: this.end ? this.end.add(deltaMs).getValue() : null,
      transliteration: this.transliteration,
      words: this.words.map((w) => w.shift(deltaMs)),
    });
  }

  public toData(): LyricLineData {
    return {
      id: this.id,
      text: this.text,
      startMs: this.getStartMs(),
      endMs: this.getEndMs(),
      transliteration: this.transliteration,
      words: this.words.map((w) => w.toData()),
    };
  }
}
