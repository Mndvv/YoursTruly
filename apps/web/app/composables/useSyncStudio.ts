import type { LyricaCandidateDto, LyricsData, SongCreatedResponseDto } from "@yourstruly/contracts";
import { LyricsNormalizer, YouTubeTitleCleaner } from "@yourstruly/core";
import { ref } from "vue";
import { useStudioSongPersistence } from "./useStudioSongPersistence";
import { useStudioTapSync } from "./useStudioTapSync";

export function useSyncStudio(apiBase = "") {
  const normalizer = new LyricsNormalizer();
  const titleCleaner = new YouTubeTitleCleaner();
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
  const isLyricVideo = ref(false);
  const isAutoDetectedLyricVideo = ref(false);

  const lyricsData = ref<LyricsData | null>(null);
  const candidates = ref<LyricaCandidateDto[]>([]);
  const isSearchingLyrics = ref(false);

  const tapSync = useStudioTapSync(lyricsData);
  const persistence = useStudioSongPersistence(apiBase);

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
    const isLyric = titleCleaner.isLyricVideo(data.title || "");
    isLyricVideo.value = isLyric;
    isAutoDetectedLyricVideo.value = isLyric;

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
    const normalized = normalizer.normalize({
      source: "manual",
      artist: artistName.value || "Unknown Artist",
      title: songTitle.value || videoTitle.value,
      hasTimestamps: /\[\d{2}:\d{2}/.test(rawText),
      lyrics: rawText.trim(),
    });
    lyricsData.value = normalized.toData();
    currentStep.value = "sync";
  }

  async function loadSongForEditing(songId: string) {
    const song = await persistence.loadSong(songId);
    youtubeId.value = song.youtubeId;
    youtubeUrl.value = `https://www.youtube.com/watch?v=${song.youtubeId}`;
    songTitle.value = song.title;
    artistName.value = song.artist;
    languageCode.value = song.languageCode;
    videoStartMs.value = song.videoStartMs;
    videoEndMs.value = song.videoEndMs;
    globalOffsetMs.value = song.globalOffsetMs;
    lyricsData.value = song.lyricsData;
    isLyricVideo.value = Boolean(song.lyricsData?.isLyricVideo);
    isAutoDetectedLyricVideo.value = Boolean(song.lyricsData?.isLyricVideo);
    currentStep.value = "sync";
  }

  async function submitSong(): Promise<SongCreatedResponseDto> {
    if (!lyricsData.value || !youtubeId.value) throw new Error("Missing song or lyric data");
    const result = await persistence.saveSong({
      isEditMode: persistence.isEditMode.value,
      songId: persistence.editingSongId.value,
      youtubeId: youtubeId.value,
      title: songTitle.value || videoTitle.value,
      artist: artistName.value || "Unknown Artist",
      languageCode: languageCode.value,
      videoStartMs: videoStartMs.value,
      videoEndMs: videoEndMs.value,
      globalOffsetMs: globalOffsetMs.value,
      lyricsData: lyricsData.value,
      isLyricVideo: isLyricVideo.value,
    });
    currentStep.value = "done";
    return result;
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
    isLyricVideo,
    isAutoDetectedLyricVideo,
    lyricsData,
    candidates,
    isSearchingLyrics,
    isEditMode: persistence.isEditMode,
    editingSongId: persistence.editingSongId,
    editToken: persistence.editToken,
    isLoadingSong: persistence.isLoadingSong,
    isSubmitting: persistence.isSubmitting,
    createdSong: persistence.createdSong,
    loadSongForEditing,
    fetchYouTubeMetadata,
    searchCandidates,
    selectCandidate,
    useCustomLyrics,
    submitSong,
    allWords: tapSync.allWords,
    currentWord: tapSync.currentWord,
    currentWordIndex: tapSync.currentWordIndex,
    firstLyricStartMs: tapSync.firstLyricStartMs,
    recordTapDown: tapSync.recordTapDown,
    recordTapUp: tapSync.recordTapUp,
    toggleWordGap: tapSync.toggleWordGap,
    shiftAllLyrics: tapSync.shiftAllLyrics,
    alignStartToTime: tapSync.alignStartToTime,
  };
}
