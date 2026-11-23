import type { LyricaDataPayload } from "@yourstruly/contracts";
import type { SongLyrics } from "../domain/SongLyrics";

export interface ILyricsNormalizationStrategy {
  canHandle(payload: LyricaDataPayload): boolean;
  normalize(payload: LyricaDataPayload): SongLyrics;
}
