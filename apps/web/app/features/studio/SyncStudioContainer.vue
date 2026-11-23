<script setup lang="ts">
import type { LyricLineData, LyricaCandidateDto } from "@yourstruly/contracts";
import { SyncClockEngine, type WordToken } from "@yourstruly/core";
import { computed, ref } from "vue";
import LyricDisplay from "../../components/player/LyricDisplay.vue";
import YouTubePlayer from "../../components/player/YouTubePlayer.vue";
import LyricCandidatePicker from "../../components/studio/LyricCandidatePicker.vue";
import OffsetControl from "../../components/studio/OffsetControl.vue";
import TapSyncPad from "../../components/studio/TapSyncPad.vue";
import TrackAlignmentControl from "../../components/studio/TrackAlignmentControl.vue";
import WordTimingRow from "../../components/studio/WordTimingRow.vue";
import YouTubeVideoSelector from "../../components/studio/YouTubeVideoSelector.vue";
import AppButton from "../../components/ui/AppButton.vue";
import { useSyncStudio } from "../../composables/useSyncStudio";

const config = useRuntimeConfig();
const studio = useSyncStudio(config.public.apiBase);
const clockEngine = new SyncClockEngine();

const currentTimeMs = ref(0);
const statusError = ref<string | null>(null);

const previewState = computed(() => {
  if (!studio.lyricsData.value) {
    return { activeLine: null, activeWord: null };
  }
  return clockEngine.resolveState(
    studio.lyricsData.value.lines,
    currentTimeMs.value,
    studio.globalOffsetMs.value,
  );
});

const previewLine = computed<LyricLineData | null>(() => {
  return (previewState.value.activeLine as LyricLineData | null) ?? null;
});

const previewWordId = computed<string | null>(() => {
  const w = previewState.value.activeWord;
  if (!w) return null;
  return "getId" in w && typeof (w as WordToken).getId === "function"
    ? (w as WordToken).getId()
    : (w as { id: string }).id;
});

async function onFindVideo(urlOrId?: string) {
  if (urlOrId) studio.youtubeUrl.value = urlOrId;
  statusError.value = null;
  try {
    await studio.fetchYouTubeMetadata();
  } catch (err: unknown) {
    statusError.value = err instanceof Error ? err.message : "Error loading video";
  }
}

async function onSearchCandidates(keyword: string) {
  statusError.value = null;
  try {
    await studio.searchCandidates(keyword);
  } catch (err: unknown) {
    statusError.value = err instanceof Error ? err.message : "Error searching candidates";
  }
}

function onApplyCustom(lyrics: string) {
  statusError.value = null;
  try {
    studio.useCustomLyrics(lyrics);
  } catch (err: unknown) {
    statusError.value = err instanceof Error ? err.message : "Failed to load custom lyrics";
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
    <YouTubeVideoSelector
      v-if="studio.currentStep.value === 'youtube'"
      :api-base="config.public.apiBase"
      :initial-url="studio.youtubeUrl.value"
      @select="onFindVideo"
    />

    <!-- Step 2: Lyrica Lyrics Candidates -->
    <LyricCandidatePicker
      v-else-if="studio.currentStep.value === 'lyrics'"
      :candidates="studio.candidates.value"
      :is-searching="studio.isSearchingLyrics.value"
      :initial-keyword="`${studio.artistName.value} ${studio.songTitle.value}`.trim()"
      @search="onSearchCandidates"
      @select="studio.selectCandidate"
      @apply-custom="onApplyCustom"
    />

    <!-- Step 3: Tap-to-Sync, Alignment & Preview -->
    <div v-else-if="studio.currentStep.value === 'sync'" class="flex flex-col gap-5">
      <YouTubePlayer :video-id="studio.youtubeId.value" @timeupdate="(t) => currentTimeMs = t" />

      <!-- Live Sync Preview -->
      <div class="flex flex-col gap-1.5">
        <div class="flex items-center justify-between px-1">
          <span class="text-xs font-semibold uppercase tracking-wider text-gray-400">Live Lyrics Sync Preview</span>
          <span class="text-xs font-mono text-indigo-400">{{ (currentTimeMs / 1000).toFixed(1) }}s</span>
        </div>
        <LyricDisplay
          :active-line="previewLine"
          :active-word-id="previewWordId"
          :show-transliteration="true"
        />
      </div>

      <!-- Whole Track Alignment / Intro Offset -->
      <TrackAlignmentControl
        :current-time-ms="currentTimeMs"
        :first-lyric-start-ms="studio.firstLyricStartMs.value"
        @align-to-current-time="studio.alignStartToTime"
        @shift-all="studio.shiftAllLyrics"
      />

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
