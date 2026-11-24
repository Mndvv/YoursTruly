<script setup lang="ts">
import { PhArrowSquareOut, PhWarningCircle, PhYoutubeLogo } from "@phosphor-icons/vue";
import { computed } from "vue";

interface Props {
  errorCode: number | null;
  videoId: string;
}

const props = defineProps<Props>();

const isEmbedRestricted = computed(() => props.errorCode === 101 || props.errorCode === 150);
const watchUrl = computed(() => `https://www.youtube.com/watch?v=${props.videoId}`);
</script>

<template>
  <div
    v-if="errorCode !== null"
    class="absolute inset-0 z-20 flex flex-col items-center justify-center p-4 bg-gray-950/95 text-center text-white backdrop-blur-md rounded-xl select-none"
  >
    <div class="w-10 h-10 rounded-full bg-rose-950/80 border border-rose-600/60 flex items-center justify-center text-rose-400 mb-2">
      <PhWarningCircle :size="24" weight="bold" aria-hidden="true" />
    </div>

    <h3 class="text-sm sm:text-base font-bold text-white mb-1">
      {{ isEmbedRestricted ? "Embedding Disabled by Owner" : "Video Playback Error" }}
    </h3>

    <p class="text-xs text-gray-400 max-w-xs mb-3 leading-relaxed">
      <template v-if="isEmbedRestricted">
        The copyright owner has blocked playing this video inside embedded website players.
      </template>
      <template v-else>
        This video could not be loaded or is restricted on this device.
      </template>
    </p>

    <div class="flex items-center gap-2">
      <a
        :href="watchUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow transition min-h-[36px]"
      >
        <PhYoutubeLogo :size="16" weight="fill" aria-hidden="true" />
        <span>Watch on YouTube</span>
        <PhArrowSquareOut :size="13" weight="bold" aria-hidden="true" />
      </a>
    </div>

    <p class="text-[11px] text-amber-300/80 mt-2.5 max-w-xs font-mono">
      Tip: In Sync Studio, you can swap this YouTube ID with an official audio or lyric video that allows embedding.
    </p>
  </div>
</template>
