<script setup lang="ts">
import { PhLightbulb, PhPencilSimple } from "@phosphor-icons/vue";
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
  const clean = text.replace(/[\p{P}\p{S}\s]+/gu, "");
  const chars = Array.from(clean || text);
  const len = Math.max(2, Math.min(6, chars.length));
  return "_ ".repeat(len).trim();
}
</script>

<template>
  <div class="w-full min-h-[68px] sm:min-h-[76px] flex flex-col items-center justify-center text-center px-3 py-2 bg-gray-900/90 rounded-xl border border-gray-800">
    <template v-if="activeLine">
      <p
        v-if="showTransliteration && activeLine.transliteration"
        class="text-xs text-violet-400 font-mono tracking-wide mb-0.5 select-none"
      >
        {{ activeLine.transliteration }}
      </p>

      <div class="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-base sm:text-xl font-bold">
        <template v-for="word in activeLine.words" :key="word.id">
          <!-- Solved gap: green -->
          <span
            v-if="isGapWord(word.id) && isSolvedWord(word.id)"
            class="text-emerald-400 font-extrabold bg-emerald-950/70 border border-emerald-600/70 rounded-lg px-2 py-0.5 transition-all"
            :class="{ 'scale-105 ring-2 ring-emerald-500/50': word.id === activeWordId }"
          >
            {{ word.text }}
          </span>

          <!-- Failed gap: red strikethrough -->
          <span
            v-else-if="isGapWord(word.id) && isFailedWord(word.id)"
            class="text-rose-400 font-extrabold bg-rose-950/70 border border-rose-600/70 rounded-lg px-2 py-0.5 line-through decoration-rose-500/80"
          >
            {{ word.text }}
          </span>

          <!-- Active unsolved gap: amber pulse (glow reserved for this focal element, R-13) -->
          <span
            v-else-if="isGapWord(word.id) && word.id === activeWordId"
            class="font-mono text-base sm:text-xl font-bold text-amber-300 bg-amber-950/80 border-2 border-dashed border-amber-400 rounded-lg px-3 py-0.5 animate-pulse inline-flex items-center gap-1.5"
          >
            <PhLightbulb v-if="currentHint" :size="14" weight="bold" aria-hidden="true" />
            <PhPencilSimple v-else :size="14" weight="bold" aria-hidden="true" />
            <span>{{ currentHint || formatBlank(word.text) }}</span>
          </span>

          <!-- Inactive unsolved gap -->
          <span
            v-else-if="isGapWord(word.id)"
            class="font-mono text-xs sm:text-sm text-gray-400 bg-gray-800/90 border border-dashed border-gray-600 rounded px-2 py-0.5 select-none"
          >
            {{ formatBlank(word.text) }}
          </span>

          <!-- Regular word -->
          <span
            v-else
            class="transition-colors duration-150 rounded px-1"
            :class="[
              word.id === activeWordId
                ? 'text-yellow-300 bg-yellow-950/60 scale-105'
                : 'text-gray-200'
            ]"
          >
            {{ word.text }}
          </span>
        </template>
      </div>
    </template>

    <p v-else class="text-sm text-gray-500 italic select-none">
      &bull;&bull;&bull;
    </p>
  </div>
</template>
