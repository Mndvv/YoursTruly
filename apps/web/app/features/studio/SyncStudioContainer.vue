<script setup lang="ts">
import { PhKey, PhPencilSimple } from "@phosphor-icons/vue";
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import YouTubePlayer from "../../components/player/YouTubePlayer.vue";
import LyricCandidatePicker from "../../components/studio/LyricCandidatePicker.vue";
import LyricVideoToggle from "../../components/studio/LyricVideoToggle.vue";
import OffsetControl from "../../components/studio/OffsetControl.vue";
import StudioLivePreview from "../../components/studio/StudioLivePreview.vue";
import StudioPublishedCard from "../../components/studio/StudioPublishedCard.vue";
import TapSyncPad from "../../components/studio/TapSyncPad.vue";
import TrackAlignmentControl from "../../components/studio/TrackAlignmentControl.vue";
import WordTimingRow from "../../components/studio/WordTimingRow.vue";
import YouTubeVideoSelector from "../../components/studio/YouTubeVideoSelector.vue";
import AppButton from "../../components/ui/AppButton.vue";
import { useSyncStudio } from "../../composables/useSyncStudio";

const route = useRoute();
const config = useRuntimeConfig();
const studio = useSyncStudio(config.public.apiBase);

const currentTimeMs = ref(0);
const statusError = ref<string | null>(null);

onMounted(async () => {
  const songId = route.query.id;
  if (songId && typeof songId === "string") {
    statusError.value = null;
    try {
      await studio.loadSongForEditing(songId);
    } catch (err: unknown) {
      statusError.value = err instanceof Error ? err.message : "Failed to load song for editing";
    }
  }
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
        <p class="text-xs text-gray-400 flex items-center gap-1.5 mt-0.5">
          <span v-if="studio.isEditMode.value" class="text-amber-400 font-semibold flex items-center gap-1 mr-2">
            <PhPencilSimple :size="13" weight="bold" aria-hidden="true" />
            Editing Song
          </span>
          <span>Step: <span class="uppercase font-mono text-violet-400 font-semibold">{{ studio.currentStep.value }}</span></span>
        </p>
      </div>
      <AppButton
        v-if="studio.currentStep.value === 'sync'"
        variant="primary"
        size="sm"
        :disabled="studio.isSubmitting.value"
        @click="studio.submitSong()"
      >
        {{ studio.isSubmitting.value ? (studio.isEditMode.value ? 'Saving...' : 'Publishing...') : (studio.isEditMode.value ? 'Save Changes' : 'Publish Song') }}
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
      <StudioLivePreview
        :lyrics-data="studio.lyricsData.value"
        :current-time-ms="currentTimeMs"
        :global-offset-ms="studio.globalOffsetMs.value"
      />

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

      <LyricVideoToggle
        v-model="studio.isLyricVideo.value"
        :is-auto-detected="studio.isAutoDetectedLyricVideo.value"
      />

      <OffsetControl
        :global-offset-ms="studio.globalOffsetMs.value"
        @update-offset="(v) => studio.globalOffsetMs.value = v"
      />

      <div v-if="studio.isEditMode.value" class="flex items-center gap-3 p-3 bg-gray-900 border border-gray-800 rounded-xl text-xs">
        <span class="text-gray-400 font-medium whitespace-nowrap flex items-center gap-1">
          <PhKey :size="13" weight="bold" aria-hidden="true" />
          Edit Token:
        </span>
        <input
          v-model="studio.editToken.value"
          type="password"
          placeholder="Paste your secret edit token"
          class="flex-1 bg-gray-950 border border-gray-700 px-2.5 py-1.5 rounded-lg text-white font-mono text-xs focus:border-violet-500 outline-none"
        />
      </div>

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
    <StudioPublishedCard
      v-else-if="studio.currentStep.value === 'done'"
      :song-id="studio.createdSong.value?.song.id"
      :is-edit-mode="studio.isEditMode.value"
    />
  </div>
</template>
