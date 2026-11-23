import type {
  CreateSongDto,
  LyricsData,
  SongCreatedResponseDto,
  WordTokenData,
} from "@yourstruly/contracts";
import { TapSyncRecorder } from "@yourstruly/core";
import { computed, ref } from "vue";

export function useSyncStudio(apiBase = "http://localhost:4000") {
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
    artistName.value = data.authorName;
    currentStep.value = "lyrics";
  }

  async function searchLyrica(artist: string, song: string) {
    artistName.value = artist;
    songTitle.value = song;
    const url = `${apiBase}/api/lyrics/search?artist=${encodeURIComponent(artist)}&song=${encodeURIComponent(song)}&normalize=true`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Could not find lyrics on Lyrica");
    const data = await res.json();
    if (data.normalized) {
      lyricsData.value = data.normalized;
      currentStep.value = "sync";
    }
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
    allWords,
    currentWord,
    currentWordIndex,
    createdSong,
    isSubmitting,
    fetchYouTubeMetadata,
    searchLyrica,
    recordTapDown,
    recordTapUp,
    toggleWordGap,
    submitSong,
  };
}
