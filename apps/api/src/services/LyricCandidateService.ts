import type { LyricaCandidateDto, LyricaDataPayload, SyncLevel } from "@yourstruly/contracts";
import { LyricsNormalizer } from "@yourstruly/core";
import type { ILyricaGateway } from "../gateways/ILyricaGateway";

export interface SearchCandidateParams {
  q?: string;
  artist?: string;
  song?: string;
}

export class LyricCandidateService {
  private readonly gateway: ILyricaGateway;
  private readonly normalizer = new LyricsNormalizer();

  constructor(gateway: ILyricaGateway) {
    this.gateway = gateway;
  }

  public async findCandidates(params: SearchCandidateParams): Promise<LyricaCandidateDto[]> {
    const targets = await this.resolveTargets(params);
    const candidates: LyricaCandidateDto[] = [];
    const seenSignatures = new Set<string>();

    for (const target of targets.slice(0, 4)) {
      const resp = await this.gateway.fetchLyrics({
        artist: target.artist,
        song: target.song,
        timestamps: true,
        word: true,
        romanize: true,
        language: "en",
      });

      if (resp.status === "success" && resp.data) {
        const sig = `${resp.data.source}_${resp.data.title}_${resp.data.artist}`;
        if (!seenSignatures.has(sig)) {
          seenSignatures.add(sig);
          const candidate = this.buildCandidate(resp.data);
          if (candidate) candidates.push(candidate);
        }
      }
    }

    return candidates;
  }

  private async resolveTargets(
    params: SearchCandidateParams,
  ): Promise<{ artist: string; song: string }[]> {
    const targets: { artist: string; song: string }[] = [];

    if (params.artist && params.song) {
      targets.push({ artist: params.artist.trim(), song: params.song.trim() });
    }

    const keyword = params.q || `${params.artist ?? ""} ${params.song ?? ""}`.trim();
    if (keyword) {
      const suggestions = await this.gateway.fetchSuggestions(keyword);
      for (const s of suggestions) {
        if (!targets.some((t) => t.artist === s.artist && t.song === s.title)) {
          targets.push({ artist: s.artist, song: s.title });
        }
      }
    }

    return targets;
  }

  private buildCandidate(data: LyricaDataPayload): LyricaCandidateDto | null {
    try {
      const normalized = this.normalizer.normalize(data);
      const lines = normalized.getLines();
      const sample = lines
        .slice(0, 2)
        .map((l) => l.getText())
        .join(" / ");

      return {
        id: `${data.source}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        title: data.title,
        artist: data.artist,
        source: data.source,
        syncLevel: normalized.getSyncLevel(),
        sampleText: sample || "(No sample text)",
        payload: data,
      };
    } catch {
      return null;
    }
  }
}
