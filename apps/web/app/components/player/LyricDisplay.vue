<script setup lang="ts">
import type { LyricLineData } from "@yourstruly/contracts";

interface Props {
  activeLine: LyricLineData | null;
  activeWordId?: string | null;
  showTransliteration?: boolean;
}

withDefaults(defineProps<Props>(), {
  activeWordId: null,
  showTransliteration: true,
});
</script>

<template>
  <div class="w-full min-h-[90px] flex flex-col items-center justify-center text-center px-4 py-3 bg-gray-900/90 rounded-xl border border-gray-800">
    <template v-if="activeLine">
      <p
        v-if="showTransliteration && activeLine.transliteration"
        class="text-xs sm:text-sm text-indigo-400 font-mono tracking-wide mb-1 select-none"
      >
        {{ activeLine.transliteration }}
      </p>

      <div class="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-lg sm:text-2xl font-bold">
        <span
          v-for="word in activeLine.words"
          :key="word.id"
          class="transition-colors duration-150 rounded px-1"
          :class="[
            word.id === activeWordId
              ? 'text-yellow-300 bg-yellow-950/60 scale-105 shadow-sm'
              : 'text-gray-200'
          ]"
        >
          {{ word.text }}
        </span>
      </div>
    </template>

    <p v-else class="text-sm text-gray-500 italic select-none">
      •••
    </p>
  </div>
</template>
