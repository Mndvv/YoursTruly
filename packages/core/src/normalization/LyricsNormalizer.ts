import type { LyricaDataPayload } from "@yourstruly/contracts";
import type { SongLyrics } from "../domain/SongLyrics";
import type { ILyricsNormalizationStrategy } from "./ILyricsNormalizationStrategy";
import { LineSyncedLyricaStrategy } from "./LineSyncedLyricaStrategy";
import { PlainTextLyricaStrategy } from "./PlainTextLyricaStrategy";
import { WordSyncedLyricaStrategy } from "./WordSyncedLyricaStrategy";

export class LyricsNormalizer {
  private readonly strategies: readonly ILyricsNormalizationStrategy[];

  constructor(strategies?: ILyricsNormalizationStrategy[]) {
    this.strategies = strategies ?? [
      new WordSyncedLyricaStrategy(),
      new LineSyncedLyricaStrategy(),
      new PlainTextLyricaStrategy(),
    ];
  }

  public normalize(payload: LyricaDataPayload): SongLyrics {
    for (const strategy of this.strategies) {
      if (strategy.canHandle(payload)) {
        return strategy.normalize(payload);
      }
    }
    throw new Error(`No compatible normalization strategy found for source: ${payload.source}`);
  }
}
