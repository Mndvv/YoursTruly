import type { LyricaApiResponse, LyricaQuery } from "@yourstruly/contracts";

export interface ILyricaGateway {
  fetchLyrics(query: LyricaQuery): Promise<LyricaApiResponse>;
}
