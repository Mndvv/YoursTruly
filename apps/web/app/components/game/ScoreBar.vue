<script setup lang="ts">
import type { PauseMode } from "@yourstruly/core";
import { computed } from "vue";

interface Props {
  score: number;
  streak: number;
  difficulty: string;
  pauseMode: PauseMode;
  gameMode: "write" | "choice";
  successCount?: number;
  failCount?: number;
  ignoreSymbols?: boolean;
  debounceDoubleLetters?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  successCount: 0,
  failCount: 0,
  ignoreSymbols: true,
  debounceDoubleLetters: true,
});

const emit = defineEmits<{
  (e: "cyclePauseMode"): void;
  (e: "changeMode", mode: "write" | "choice"): void;
  (e: "toggleIgnoreSymbols"): void;
  (e: "toggleDebounce"): void;
}>();

const accuracy = computed(() => {
  const total = props.successCount + props.failCount;
  if (total === 0) return 100;
  return Math.round((props.successCount / total) * 100);
});

const pauseModeLabel = computed(() => {
  if (props.pauseMode === "verse_loop") return "🔁 Verse Loop";
  if (props.pauseMode === "strict") return "🛑 Strict Pause";
  return "▶️ Continuous";
});
</script>

<template>
  <div class="flex flex-wrap items-center justify-between gap-3 bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5 text-xs">
    <div class="flex flex-wrap items-center gap-3">
      <div class="flex items-center gap-1.5">
        <span class="text-gray-400">Score:</span>
        <span class="font-bold text-indigo-400 font-mono text-sm">{{ score }}</span>
      </div>
      <div class="flex items-center gap-1.5">
        <span class="font-bold text-amber-400 font-mono text-sm">🔥 {{ streak }}</span>
      </div>
      <span class="text-gray-700 hidden sm:inline">|</span>
      <div class="flex items-center gap-2 font-mono">
        <span class="text-emerald-400 font-bold">✅ {{ successCount }}</span>
        <span class="text-rose-400 font-bold">❌ {{ failCount }}</span>
        <span class="text-gray-400 text-[11px]">({{ accuracy }}%)</span>
      </div>
      <span class="text-gray-700 hidden sm:inline">|</span>
      <span class="uppercase tracking-wide font-semibold text-gray-400 font-mono text-[11px]">{{ difficulty }}</span>
    </div>

    <div class="flex items-center gap-2">
      <!-- Anti-Chatter Debounce Toggle -->
      <button
        v-if="gameMode === 'write'"
        type="button"
        :title="debounceDoubleLetters ? 'Anti-Chatter enabled (filters accidental double characters)' : 'Standard typing'"
        class="px-2.5 py-1 rounded-lg font-medium transition border text-[11px]"
        :class="[
          debounceDoubleLetters
            ? 'bg-sky-950/70 border-sky-700 text-sky-300'
            : 'bg-gray-800 border-gray-700 text-gray-400'
        ]"
        @click="emit('toggleDebounce')"
      >
        {{ debounceDoubleLetters ? '🛡️ Anti-Chatter' : '🛡️ Chatter: Off' }}
      </button>

      <!-- Ignore Symbols Toggle -->
      <button
        type="button"
        :title="ignoreSymbols ? 'Symbols & apostrophes ignored (e.g. dont matches don\'t)' : 'Exact symbols required'"
        class="px-2.5 py-1 rounded-lg font-medium transition border text-[11px]"
        :class="[
          ignoreSymbols
            ? 'bg-emerald-950/70 border-emerald-700 text-emerald-300'
            : 'bg-gray-800 border-gray-700 text-gray-400'
        ]"
        @click="emit('toggleIgnoreSymbols')"
      >
        {{ ignoreSymbols ? '🔤 Symbols: Auto' : '🔤 Symbols: Exact' }}
      </button>

      <!-- Mode Toggle -->
      <button
        type="button"
        class="px-2.5 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium transition"
        @click="emit('changeMode', gameMode === 'write' ? 'choice' : 'write')"
      >
        {{ gameMode === 'write' ? '⌨️ Write' : '🔘 Choice' }}
      </button>

      <!-- Pause Mode Cycle Button -->
      <button
        type="button"
        title="Click to cycle pause mode (Verse Loop / Strict / Continuous)"
        class="px-2.5 py-1 rounded-lg font-medium transition border text-[11px]"
        :class="[
          pauseMode === 'verse_loop'
            ? 'bg-indigo-950/70 border-indigo-700 text-indigo-300'
            : pauseMode === 'strict'
              ? 'bg-amber-950/70 border-amber-700 text-amber-300'
              : 'bg-gray-850 border-gray-700 text-gray-400'
        ]"
        @click="emit('cyclePauseMode')"
      >
        {{ pauseModeLabel }}
      </button>
    </div>
  </div>
</template>
