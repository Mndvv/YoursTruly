import type {
  CreateSongDto,
  LyricaCandidateDto,
  LyricsData,
  SongCreatedResponseDto,
} from "@yourstruly/contracts";
import { LyricsNormalizer, TapSyncRecorder, YouTubeTitleCleaner } from "@yourstruly/core";
import { computed, ref } from "vue";

export function useSyncStudio(apiBase = "http://localhost:4000") {
  const titleCleaner = new YouTubeTitleCleaner();
  const normalizer = new LyricsNormalizer();
  const currentStep = ref<"youtube" | "lyrics" | "sync" | "done">("youtube");

  const youtubeUrl = ref("");
  const youtubeId = ref("");
  const videoTitle = ref("");
  const artistName = ref("");
  const songTitle = ref("");
  const languageCode = ref("en");
  const globalOffsetMs = ref(0);
  const videoStartMs = ref(0);
  const videoEndMs = ref<number | null>(null);

  const lyricsData = ref<LyricsData | null>(null);
  const candidates = ref<LyricaCandidateDto[]>([]);
  const isSearchingLyrics = ref(false);
  const createdSong = ref<SongCreatedResponseDto | null>(null);
  const isSubmitting = ref(false);

  const recorder = new TapSyncRecorder();
  const currentWordIndex = ref(0);

  const allWords = computed(() => {
    if (!lyricsData.value) return [];
    return lyricsData.value.lines.flatMap((line) => line.words);
  });

  const currentWord = computed(() => allWords.value[currentWordIndex.value] ?? null);

  async function fetchYouTubeMetadata() {
    if (!youtubeUrl.value) return;
    const res = await fetch(
      `${apiBase}/api/youtube/metadata?url=${encodeURIComponent(youtubeUrl.value)}`,
    );
    if (!res.ok) throw new Error("Could not fetch YouTube video metadata");
    const data = await res.json();
    youtubeId.value = data.videoId;
    videoTitle.value = data.title;
    artistName.value = data.parsedArtist || data.authorName;
    songTitle.value = data.parsedTitle || data.title;

    currentStep.value = "lyrics";
    await searchCandidates("", artistName.value, songTitle.value);
  }

  async function searchCandidates(keyword?: string, artist?: string, song?: string) {
    isSearchingLyrics.value = true;
    candidates.value = [];
    try {
      const params = new URLSearchParams();
      if (keyword) params.append("q", keyword);
      if (artist) params.append("artist", artist);
      if (song) params.append("song", song);

      const res = await fetch(`${apiBase}/api/lyrics/candidates?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to search lyrics candidates");
      const data = await res.json();
      candidates.value = data.candidates ?? [];
      return candidates.value;
    } finally {
      isSearchingLyrics.value = false;
    }
  }

  function selectCandidate(candidate: LyricaCandidateDto) {
    artistName.value = candidate.artist;
    songTitle.value = candidate.title;
    const normalized = normalizer.normalize(candidate.payload);
    lyricsData.value = normalized.toData();
    currentStep.value = "sync";
  }

  function useCustomLyrics(rawText: string) {
    if (!rawText.trim()) throw new Error("Lyrics text cannot be empty");
    const payload = {
      source: "manual",
      artist: artistName.value || "Unknown Artist",
      title: songTitle.value || videoTitle.value,
      hasTimestamps: /\[\d{2}:\d{2}/.test(rawText),
      lyrics: rawText.trim(),
    };
    const normalized = normalizer.normalize(payload);
    lyricsData.value = normalized.toData();
    currentStep.value = "sync";
  }

  function recordTapDown(timeMs: number) {
    recorder.onTapDown(timeMs);
  }

  function recordTapUp(timeMs: number) {
    const timing = recorder.onTapUp(timeMs);
    if (timing && allWords.value[timing.wordIndex]) {
      const target = allWords.value[timing.wordIndex];
      target.startMs = timing.startMs;
      target.endMs = timing.endMs;
    }
    currentWordIndex.value = recorder.getCurrentWordIndex();
  }

  function toggleWordGap(wordId: string) {
    const word = allWords.value.find((w) => w.id === wordId);
    if (word) word.isGapEligible = !word.isGapEligible;
  }

  async function submitSong(): Promise<SongCreatedResponseDto> {
    if (!lyricsData.value || !youtubeId.value) throw new Error("Missing song or lyric data");
    isSubmitting.value = true;

    const payload: CreateSongDto = {
      youtubeId: youtubeId.value,
      title: songTitle.value || videoTitle.value,
      artist: artistName.value || "Unknown Artist",
      languageCode: languageCode.value,
      videoStartMs: videoStartMs.value,
      videoEndMs: videoEndMs.value,
      globalOffsetMs: globalOffsetMs.value,
      lyricsData: lyricsData.value,
    };

    try {
      const res = await fetch(`${apiBase}/api/songs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`Server returned HTTP ${res.status}`);
      const result: SongCreatedResponseDto = await res.json();
      createdSong.value = result;

      if (typeof window !== "undefined" && window.localStorage) {
        localStorage.setItem(`yourstruly:editToken:${result.song.id}`, result.editToken);
      }

      currentStep.value = "done";
      return result;
    } finally {
      isSubmitting.value = false;
    }
  }

  return {
    currentStep,
    youtubeUrl,
    youtubeId,
    videoTitle,
    artistName,
    songTitle,
    languageCode,
    globalOffsetMs,
    videoStartMs,
    videoEndMs,
    lyricsData,
    candidates,
    isSearchingLyrics,
    allWords,
    currentWord,
    currentWordIndex,
    createdSong,
    isSubmitting,
    fetchYouTubeMetadata,
    searchCandidates,
    selectCandidate,
    useCustomLyrics,
    recordTapDown,
    recordTapUp,
    toggleWordGap,
    submitSong,
  };
}
