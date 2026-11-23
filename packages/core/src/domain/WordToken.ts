import type { WordTokenData } from "@yourstruly/contracts";
import { TimestampMs } from "./TimestampMs";

export interface WordTokenConfig {
  id: string;
  text: string;
  startMs: number | null;
  endMs: number | null;
  isGapEligible?: boolean;
}

export class WordToken {
  private readonly id: string;
  private readonly text: string;
  private readonly start: TimestampMs | null;
  private readonly end: TimestampMs | null;
  private readonly gapEligible: boolean;

  constructor(config: WordTokenConfig) {
    this.id = config.id;
    this.text = config.text.trim();
    this.start = config.startMs !== null ? TimestampMs.from(config.startMs) : null;
    this.end = config.endMs !== null ? TimestampMs.from(config.endMs) : null;
    this.gapEligible = config.isGapEligible ?? true;
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

  public isEligibleForGap(): boolean {
    return this.gapEligible;
  }

  public shift(deltaMs: number): WordToken {
    return new WordToken({
      id: this.id,
      text: this.text,
      startMs: this.start ? this.start.add(deltaMs).getValue() : null,
      endMs: this.end ? this.end.add(deltaMs).getValue() : null,
      isGapEligible: this.gapEligible,
    });
  }

  public toData(): WordTokenData {
    return {
      id: this.id,
      text: this.text,
      startMs: this.getStartMs(),
      endMs: this.getEndMs(),
      isGapEligible: this.gapEligible,
    };
  }
}
