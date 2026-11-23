<script setup lang="ts">
import type { LyricLineData } from "@yourstruly/contracts";

interface Props {
  activeLine: LyricLineData | null;
  activeWordId?: string | null;
  showTransliteration?: boolean;
  gapIds?: Set<string>;
  solvedGapIds?: Set<string>;
  failedGapIds?: Set<string>;
  currentHint?: string | null;
  isGameActive?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  activeWordId: null,
  showTransliteration: true,
  gapIds: () => new Set<string>(),
  solvedGapIds: () => new Set<string>(),
  failedGapIds: () => new Set<string>(),
  currentHint: null,
  isGameActive: false,
});

function isGapWord(wordId: string): boolean {
  return props.isGameActive && props.gapIds.has(wordId);
}

function isSolvedWord(wordId: string): boolean {
  return props.isGameActive && props.solvedGapIds.has(wordId);
}

function isFailedWord(wordId: string): boolean {
  return props.isGameActive && props.failedGapIds.has(wordId);
}

function formatBlank(text: string): string {
  const clean = text.replace(/[^a-zA-Z0-9]/g, "");
  const len = Math.max(3, Math.min(8, clean.length || text.length));
  return "_ ".repeat(len).trim();
}
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

      <div class="flex flex-wrap items-center justify-center gap-x-2 gap-y-1.5 text-lg sm:text-2xl font-bold">
        <template v-for="word in activeLine.words" :key="word.id">
          <!-- 1. Solved Gap Word (Green) -->
          <span
            v-if="isGapWord(word.id) && isSolvedWord(word.id)"
            class="text-emerald-400 font-extrabold bg-emerald-950/70 border border-emerald-600/70 rounded-lg px-2 py-0.5 shadow-sm transition-all"
            :class="{ 'scale-105 ring-2 ring-emerald-500/50': word.id === activeWordId }"
          >
            {{ word.text }}
          </span>

          <!-- 2. Failed / Missed Gap Word (Red) -->
          <span
            v-else-if="isGapWord(word.id) && isFailedWord(word.id)"
            class="text-rose-400 font-extrabold bg-rose-950/70 border border-rose-600/70 rounded-lg px-2 py-0.5 shadow-sm line-through decoration-rose-500/80"
          >
            {{ word.text }}
          </span>

          <!-- 3. Unsolved Active Gap with hint or blank (Amber) -->
          <span
            v-else-if="isGapWord(word.id) && word.id === activeWordId"
            class="font-mono text-base sm:text-xl font-bold text-amber-300 bg-amber-950/80 border-2 border-dashed border-amber-400 rounded-lg px-3 py-0.5 shadow-lg animate-pulse inline-flex items-center gap-1.5"
          >
            <span class="text-xs select-none">{{ currentHint ? '💡' : '✏️' }}</span>
            <span>{{ currentHint || formatBlank(word.text) }}</span>
          </span>

          <!-- 4. Unsolved Inactive Gap in current line -->
          <span
            v-else-if="isGapWord(word.id)"
            class="font-mono text-xs sm:text-sm text-gray-400 bg-gray-800/90 border border-dashed border-gray-600 rounded px-2 py-0.5 select-none"
          >
            {{ formatBlank(word.text) }}
          </span>

          <!-- 5. Regular Non-Gap Word -->
          <span
            v-else
            class="transition-colors duration-150 rounded px-1"
            :class="[
              word.id === activeWordId
                ? 'text-yellow-300 bg-yellow-950/60 scale-105 shadow-sm'
                : 'text-gray-200'
            ]"
          >
            {{ word.text }}
          </span>
        </template>
      </div>
    </template>

    <p v-else class="text-sm text-gray-500 italic select-none">
      •••
    </p>
  </div>
</template>
