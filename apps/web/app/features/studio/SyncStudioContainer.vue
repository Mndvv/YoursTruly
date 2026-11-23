<script setup lang="ts">
import { ref } from "vue";
import LyricDisplay from "../../components/player/LyricDisplay.vue";
import YouTubePlayer from "../../components/player/YouTubePlayer.vue";
import OffsetControl from "../../components/studio/OffsetControl.vue";
import TapSyncPad from "../../components/studio/TapSyncPad.vue";
import WordTimingRow from "../../components/studio/WordTimingRow.vue";
import AppButton from "../../components/ui/AppButton.vue";
import { useSyncStudio } from "../../composables/useSyncStudio";

const config = useRuntimeConfig();
const studio = useSyncStudio(config.public.apiBase);

const currentTimeMs = ref(0);
const lyricArtistInput = ref("");
const lyricSongInput = ref("");
const statusError = ref<string | null>(null);

async function onFindVideo() {
  statusError.value = null;
  try {
    await studio.fetchYouTubeMetadata();
    lyricArtistInput.value = studio.artistName.value;
    lyricSongInput.value = studio.videoTitle.value;
  } catch (err: unknown) {
    statusError.value = err instanceof Error ? err.message : "Error loading video";
  }
}

async function onSearchLyrics() {
  statusError.value = null;
  try {
    await studio.searchLyrica(lyricArtistInput.value, lyricSongInput.value);
  } catch (err: unknown) {
    statusError.value = err instanceof Error ? err.message : "Error searching Lyrica";
  }
}
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 py-6 flex flex-col gap-6">
    <div class="flex items-center justify-between border-b border-gray-800 pb-4">
      <div>
        <h1 class="text-2xl font-extrabold text-white">Authoring & Sync Studio</h1>
        <p class="text-xs text-gray-400">Step: <span class="uppercase font-mono text-indigo-400">{{ studio.currentStep.value }}</span></p>
      </div>
      <AppButton
        v-if="studio.currentStep.value === 'sync'"
        variant="primary"
        size="sm"
        :disabled="studio.isSubmitting.value"
        @click="studio.submitSong()"
      >
        {{ studio.isSubmitting.value ? 'Publishing...' : 'Publish Song 🚀' }}
      </AppButton>
    </div>

    <div v-if="statusError" class="p-3 bg-red-950/60 border border-red-800 text-red-300 text-sm rounded-lg">
      {{ statusError }}
    </div>

    <!-- Step 1: YouTube -->
    <div v-if="studio.currentStep.value === 'youtube'" class="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col gap-4">
      <h2 class="text-lg font-bold text-white">1. Select YouTube Video</h2>
      <input
        v-model="studio.youtubeUrl.value"
        type="text"
        placeholder="Paste YouTube Video URL or ID (e.g., https://www.youtube.com/watch?v=...)"
        class="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <AppButton @click="onFindVideo">Load Video Metadata</AppButton>
    </div>

    <!-- Step 2: Lyrica Lyrics Search -->
    <div v-else-if="studio.currentStep.value === 'lyrics'" class="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col gap-4">
      <h2 class="text-lg font-bold text-white">2. Fetch Lyrics from Lyrica</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input v-model="lyricArtistInput" type="text" placeholder="Artist" class="bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white" />
        <input v-model="lyricSongInput" type="text" placeholder="Song Title" class="bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white" />
      </div>
      <AppButton @click="onSearchLyrics">Search Lyrica & Start Sync</AppButton>
    </div>

    <!-- Step 3: Tap-to-Sync & Fine Tuning -->
    <div v-else-if="studio.currentStep.value === 'sync'" class="flex flex-col gap-5">
      <YouTubePlayer :video-id="studio.youtubeId.value" @timeupdate="(t) => currentTimeMs = t" />

      <TapSyncPad
        :current-word-text="studio.currentWord.value?.text"
        :current-word-index="studio.currentWordIndex.value"
        :total-words="studio.allWords.value.length"
        @tapdown="studio.recordTapDown(currentTimeMs)"
        @tapup="studio.recordTapUp(currentTimeMs)"
      />

      <OffsetControl
        :global-offset-ms="studio.globalOffsetMs.value"
        @update-offset="(v) => studio.globalOffsetMs.value = v"
      />

      <div class="flex flex-col gap-2 max-h-80 overflow-y-auto pr-1">
        <WordTimingRow
          v-for="(line, idx) in studio.lyricsData.value?.lines"
          :key="line.id"
          :line-index="idx"
          :text="line.text"
          :words="line.words"
          :transliteration="line.transliteration"
          @toggle-gap="studio.toggleWordGap"
        />
      </div>
    </div>

    <!-- Step 4: Done / Edit Link -->
    <div v-else-if="studio.currentStep.value === 'done'" class="bg-gray-900 border border-indigo-700 rounded-2xl p-6 text-center flex flex-col items-center gap-4">
      <span class="text-4xl">🎉</span>
      <h2 class="text-2xl font-bold text-white">Song Published Successfully!</h2>
      <p class="text-gray-300 text-sm max-w-md">Your secret edit token has been saved to your browser. You can edit this track at any time.</p>
      <NuxtLink :to="`/game/${studio.createdSong.value?.song.id}`">
        <AppButton size="lg" variant="primary">Play Song Now ▶</AppButton>
      </NuxtLink>
    </div>
  </div>
</template>
