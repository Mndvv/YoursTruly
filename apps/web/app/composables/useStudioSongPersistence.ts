import type {
  CreateSongDto,
  LyricsData,
  SongCreatedResponseDto,
  SongDetailDto,
  UpdateSongDto,
} from "@yourstruly/contracts";
import { ref } from "vue";

export interface StudioSavePayload {
  isEditMode: boolean;
  songId?: string | null;
  youtubeId: string;
  title: string;
  artist: string;
  languageCode: string;
  videoStartMs: number;
  videoEndMs: number | null;
  globalOffsetMs: number;
  lyricsData: LyricsData;
  isLyricVideo: boolean;
  editToken?: string;
}

export function useStudioSongPersistence(apiBase = "") {
  const isEditMode = ref(false);
  const editingSongId = ref<string | null>(null);
  const editToken = ref("");
  const isSubmitting = ref(false);
  const isLoadingSong = ref(false);
  const createdSong = ref<SongCreatedResponseDto | null>(null);

  function getStoredToken(songId: string): string {
    if (typeof window === "undefined" || !window.localStorage) return "";
    return localStorage.getItem(`yourstruly:editToken:${songId}`) || "";
  }

  function storeToken(songId: string, token: string): void {
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.setItem(`yourstruly:editToken:${songId}`, token);
    }
  }

  async function loadSong(songId: string): Promise<SongDetailDto> {
    isLoadingSong.value = true;
    try {
      const res = await fetch(`${apiBase}/api/songs/${encodeURIComponent(songId)}`);
      if (!res.ok) throw new Error(`Could not load song (HTTP ${res.status})`);
      const song: SongDetailDto = await res.json();
      isEditMode.value = true;
      editingSongId.value = songId;
      editToken.value = getStoredToken(songId);
      return song;
    } finally {
      isLoadingSong.value = false;
    }
  }

  function resolveEditToken(songId: string, explicitToken?: string): string {
    let token = explicitToken || editToken.value || getStoredToken(songId);
    if (!token.trim() && typeof window !== "undefined") {
      token = window.prompt("Enter secret edit token for this song:") || "";
    }
    if (!token.trim()) throw new Error("Edit token is required to save updates.");
    return token.trim();
  }

  async function updateExistingSong(payload: StudioSavePayload, lyrics: LyricsData) {
    const songId = payload.songId as string;
    const token = resolveEditToken(songId, payload.editToken);
    const dto: UpdateSongDto = {
      title: payload.title,
      artist: payload.artist,
      languageCode: payload.languageCode,
      videoStartMs: payload.videoStartMs,
      videoEndMs: payload.videoEndMs,
      globalOffsetMs: payload.globalOffsetMs,
      lyricsData: lyrics,
      editToken: token,
    };
    const res = await fetch(`${apiBase}/api/songs/${encodeURIComponent(songId)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dto),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Update failed (HTTP ${res.status})`);
    }
    const updated: SongDetailDto = await res.json();
    storeToken(songId, token);
    editToken.value = token;
    return { song: updated, editToken: token };
  }

  async function createNewSong(payload: StudioSavePayload, lyrics: LyricsData) {
    const dto: CreateSongDto = {
      youtubeId: payload.youtubeId,
      title: payload.title,
      artist: payload.artist,
      languageCode: payload.languageCode,
      videoStartMs: payload.videoStartMs,
      videoEndMs: payload.videoEndMs,
      globalOffsetMs: payload.globalOffsetMs,
      lyricsData: lyrics,
    };
    const res = await fetch(`${apiBase}/api/songs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dto),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Publish failed (HTTP ${res.status})`);
    }
    const result: SongCreatedResponseDto = await res.json();
    storeToken(result.song.id, result.editToken);
    return result;
  }

  async function saveSong(payload: StudioSavePayload): Promise<SongCreatedResponseDto> {
    isSubmitting.value = true;
    const lyrics = { ...payload.lyricsData, isLyricVideo: payload.isLyricVideo };
    try {
      const result =
        payload.isEditMode && payload.songId
          ? await updateExistingSong(payload, lyrics)
          : await createNewSong(payload, lyrics);
      createdSong.value = result;
      return result;
    } finally {
      isSubmitting.value = false;
    }
  }

  return {
    isEditMode,
    editingSongId,
    editToken,
    isSubmitting,
    isLoadingSong,
    createdSong,
    loadSong,
    saveSong,
  };
}
