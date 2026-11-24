<script setup lang="ts">
import { PhArrowSquareOut, PhWarningCircle, PhYoutubeLogo } from "@phosphor-icons/vue";
import { computed } from "vue";

interface Props {
  errorCode: number | null;
  videoId: string;
}

const props = defineProps<Props>();
defineEmits<(e: "retry") => void>();

const isEmbedRestricted = computed(() => props.errorCode === 101 || props.errorCode === 150);
const watchUrl = computed(() => `https://www.youtube.com/watch?v=${props.videoId}`);
</script>

<template>
  <div
    v-if="errorCode !== null"
    class="absolute inset-0 z-20 flex flex-col items-center justify-center p-3.5 bg-gray-950/95 text-center text-white backdrop-blur-md rounded-xl select-none"
  >
    <div class="w-9 h-9 rounded-full bg-rose-950/80 border border-rose-600/60 flex items-center justify-center text-rose-400 mb-1.5">
      <PhWarningCircle :size="22" weight="bold" aria-hidden="true" />
    </div>

    <h3 class="text-xs sm:text-sm font-bold text-white mb-1">
      {{ isEmbedRestricted ? "Embedding Disabled by Owner" : "Video Playback Error" }}
    </h3>

    <p class="text-[11px] text-gray-300 max-w-xs mb-2.5 leading-relaxed">
      <template v-if="isEmbedRestricted">
        The copyright owner has blocked embedding for this video.
      </template>
      <template v-else>
        This video could not be loaded or is restricted on this device.
      </template>
    </p>

    <div class="flex items-center gap-2">
      <button
        type="button"
        class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-medium border border-gray-700 shadow transition min-h-[34px]"
        @click="$emit('retry')"
      >
        <span>Retry</span>
      </button>

      <a
        :href="watchUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow transition min-h-[34px]"
      >
        <PhYoutubeLogo :size="15" weight="fill" aria-hidden="true" />
        <span>Watch on YouTube</span>
        <PhArrowSquareOut :size="12" weight="bold" aria-hidden="true" />
      </a>
    </div>

    <p class="text-[10px] text-amber-300/80 mt-2 max-w-xs font-mono">
      Tip: Swap this YouTube ID in Sync Studio with a lyric or official audio version that allows embedding.
    </p>
  </div>
</template>
