<script setup lang="ts">
import type { LyricLineData, LyricsData } from "@yourstruly/contracts";
import { SyncClockEngine, type WordToken } from "@yourstruly/core";
import { computed } from "vue";
import LyricDisplay from "../player/LyricDisplay.vue";

interface Props {
  lyricsData: LyricsData | null;
  currentTimeMs: number;
  globalOffsetMs: number;
}

const props = defineProps<Props>();
const clockEngine = new SyncClockEngine();

const previewState = computed(() => {
  if (!props.lyricsData) return { activeLine: null, activeWord: null };
  return clockEngine.resolveState(
    props.lyricsData.lines,
    props.currentTimeMs,
    props.globalOffsetMs,
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
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <div class="flex items-center justify-between px-1">
      <span class="text-xs font-semibold uppercase tracking-wider text-gray-400">Live Lyrics Sync Preview</span>
      <span class="text-xs font-mono text-violet-400">{{ (currentTimeMs / 1000).toFixed(1) }}s</span>
    </div>
    <LyricDisplay
      :active-line="previewLine"
      :active-word-id="previewWordId"
      :show-transliteration="true"
    />
  </div>
</template>
