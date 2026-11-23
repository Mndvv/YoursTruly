<script setup lang="ts">
import type { WordTokenData } from "@yourstruly/contracts";

interface Props {
  lineIndex: number;
  text: string;
  words: WordTokenData[];
  transliteration?: string | null;
}

defineProps<Props>();

const emit = defineEmits<{
  (e: "toggleGap", wordId: string): void;
  (e: "editWordText", wordId: string, text: string): void;
}>();
</script>

<template>
  <div class="border border-gray-800 rounded-lg p-3 bg-gray-900/60 flex flex-col gap-2">
    <div class="flex items-center justify-between text-xs text-gray-500 font-mono">
      <span>Line #{{ lineIndex + 1 }}</span>
      <span v-if="transliteration" class="text-indigo-400 italic">{{ transliteration }}</span>
    </div>

    <div class="flex flex-wrap items-center gap-2">
      <div
        v-for="w in words"
        :key="w.id"
        class="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs border transition"
        :class="[
          w.isGapEligible
            ? 'bg-gray-800 border-indigo-700/60 text-gray-200'
            : 'bg-gray-900 border-gray-800 text-gray-500 line-through'
        ]"
      >
        <span class="font-semibold">{{ w.text }}</span>
        <span class="text-[10px] text-gray-400 font-mono">
          {{ w.startMs !== null ? `${w.startMs}ms` : '—' }}
        </span>
        <button
          type="button"
          class="text-[10px] px-1 rounded hover:bg-gray-700 text-gray-400"
          :title="w.isGapEligible ? 'Exclude from gaps' : 'Make eligible for gap'"
          @click="emit('toggleGap', w.id)"
        >
          {{ w.isGapEligible ? '🎯' : '🚫' }}
        </button>
      </div>
    </div>
  </div>
</template>
