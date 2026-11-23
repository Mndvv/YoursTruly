import type { LyricaCandidateDto, LyricaDataPayload } from "@yourstruly/contracts";
import { LyricsNormalizer, YouTubeTitleCleaner } from "@yourstruly/core";
import type { ILyricaGateway } from "../gateways/ILyricaGateway";

export interface SearchCandidateParams {
  q?: string;
  artist?: string;
  song?: string;
}

export class LyricCandidateService {
  private readonly gateway: ILyricaGateway;
  private readonly normalizer = new LyricsNormalizer();
  private readonly cleaner = new YouTubeTitleCleaner();
  private readonly providers = ["lrclib", "netease", "lrcmux", "genius", undefined];

  constructor(gateway: ILyricaGateway) {
    this.gateway = gateway;
  }

  public async findCandidates(params: SearchCandidateParams): Promise<LyricaCandidateDto[]> {
    const targets = await this.resolveTargets(params);
    const candidates: LyricaCandidateDto[] = [];
    const seenSignatures = new Set<string>();

    for (const target of targets.slice(0, 3)) {
      const payloads = await this.queryProvidersForTarget(target);
      for (const d of payloads) {
        const sig = `${d.source}_${d.title}_${d.artist}`;
        if (!seenSignatures.has(sig)) {
          seenSignatures.add(sig);
          const candidate = this.buildCandidate(d);
          if (candidate) candidates.push(candidate);
        }
      }
    }

    return candidates;
  }

  private async queryProvidersForTarget(target: {
    artist: string;
    song: string;
  }): Promise<LyricaDataPayload[]> {
    const results = await Promise.allSettled(
      this.providers.map((seq) =>
        this.gateway.fetchLyrics(
          {
            artist: target.artist,
            song: target.song,
            timestamps: true,
            word: true,
            romanize: false,
            language: "en",
          },
          seq,
        ),
      ),
    );

    const payloads: LyricaDataPayload[] = [];
    for (const res of results) {
      if (res.status === "fulfilled" && res.value.status === "success" && res.value.data) {
        payloads.push(res.value.data);
      }
    }
    return payloads;
  }

  private async resolveTargets(
    params: SearchCandidateParams,
  ): Promise<{ artist: string; song: string }[]> {
    const targets: { artist: string; song: string }[] = [];

    if (params.artist && params.song) {
      targets.push({ artist: params.artist.trim(), song: params.song.trim() });
    }

    const rawKeyword = params.q?.trim() || "";
    if (rawKeyword) {
      const suggestions = await this.gateway.fetchSuggestions(rawKeyword);
      for (const s of suggestions.slice(0, 4)) {
        if (
          !targets.some(
            (t) =>
              t.artist.toLowerCase() === s.artist.toLowerCase() &&
              t.song.toLowerCase() === s.title.toLowerCase(),
          )
        ) {
          targets.push({ artist: s.artist, song: s.title });
        }
      }

      const cleaned = this.cleaner.clean(rawKeyword, params.artist);
      if (
        cleaned.song &&
        cleaned.artist &&
        !targets.some((t) => t.song.toLowerCase() === cleaned.song.toLowerCase())
      ) {
        targets.push(cleaned);
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
