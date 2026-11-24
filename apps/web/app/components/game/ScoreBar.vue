<script setup lang="ts">
import {
  PhArrowsClockwise,
  PhCheckCircle,
  PhHandPalm,
  PhLightning,
  PhPenNib,
  PhPlay,
  PhShieldCheck,
  PhSquaresFour,
  PhTextbox,
  PhXCircle,
} from "@phosphor-icons/vue";
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
  if (props.pauseMode === "verse_loop") return "Verse Loop";
  if (props.pauseMode === "strict") return "Strict Pause";
  return "Continuous";
});
</script>

<template>
  <div class="flex flex-wrap items-center justify-between gap-2 bg-gray-900 border border-gray-800 rounded-xl px-3 py-1.5 text-xs">
    <!-- Left: score / streak / accuracy / difficulty -->
    <div class="flex flex-wrap items-center gap-2.5">
      <div class="flex items-center gap-1.5">
        <span class="text-gray-400">Score:</span>
        <span class="font-bold text-violet-400 font-mono text-sm">{{ score }}</span>
      </div>
      <!-- Streak: amber accent, earned by gameplay -->
      <div class="flex items-center gap-1 text-amber-400 font-mono font-bold text-sm">
        <PhLightning :size="14" weight="fill" aria-hidden="true" />
        {{ streak }}
      </div>
      <span class="text-gray-700 hidden sm:inline">|</span>
      <div class="flex items-center gap-2 font-mono">
        <span class="text-emerald-400 font-bold flex items-center gap-0.5">
          <PhCheckCircle :size="13" weight="fill" aria-hidden="true" />
          {{ successCount }}
        </span>
        <span class="text-rose-400 font-bold flex items-center gap-0.5">
          <PhXCircle :size="13" weight="fill" aria-hidden="true" />
          {{ failCount }}
        </span>
        <span class="text-gray-400 text-[11px]">({{ accuracy }}%)</span>
      </div>
      <span class="text-gray-700 hidden sm:inline">|</span>
      <span class="font-semibold text-gray-400 font-mono text-[11px] uppercase tracking-wide">{{ difficulty }}</span>
    </div>

    <!-- Right: toggle controls -->
    <div class="flex items-center gap-2">
      <!-- Anti-chatter toggle (write mode only) -->
      <button
        v-if="gameMode === 'write'"
        type="button"
        :title="debounceDoubleLetters ? 'Anti-Chatter enabled' : 'Standard typing'"
        class="px-2 py-1 rounded-lg font-medium transition border text-[11px] flex items-center gap-1 min-h-[32px]"
        :class="[
          debounceDoubleLetters
            ? 'bg-sky-950/70 border-sky-700 text-sky-300'
            : 'bg-gray-800 border-gray-700 text-gray-400'
        ]"
        @click="emit('toggleDebounce')"
      >
        <PhShieldCheck :size="12" weight="bold" aria-hidden="true" />
        {{ debounceDoubleLetters ? "Anti-Chatter" : "Chatter: Off" }}
      </button>

      <!-- Ignore symbols toggle -->
      <button
        type="button"
        :title="ignoreSymbols ? 'Symbols ignored' : 'Exact symbols required'"
        class="px-2 py-1 rounded-lg font-medium transition border text-[11px] flex items-center gap-1 min-h-[32px]"
        :class="[
          ignoreSymbols
            ? 'bg-emerald-950/70 border-emerald-700 text-emerald-300'
            : 'bg-gray-800 border-gray-700 text-gray-400'
        ]"
        @click="emit('toggleIgnoreSymbols')"
      >
        <PhTextbox :size="12" weight="bold" aria-hidden="true" />
        {{ ignoreSymbols ? "Symbols: Auto" : "Symbols: Exact" }}
      </button>

      <!-- Mode toggle -->
      <button
        type="button"
        class="px-2 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium transition text-[11px] flex items-center gap-1 min-h-[32px]"
        @click="emit('changeMode', gameMode === 'write' ? 'choice' : 'write')"
      >
        <PhPenNib v-if="gameMode === 'write'" :size="12" weight="bold" aria-hidden="true" />
        <PhSquaresFour v-else :size="12" weight="bold" aria-hidden="true" />
        {{ gameMode === "write" ? "Write" : "Choice" }}
      </button>

      <!-- Pause mode cycle -->
      <button
        type="button"
        title="Click to cycle pause mode"
        class="px-2 py-1 rounded-lg font-medium transition border text-[11px] flex items-center gap-1 min-h-[32px]"
        :class="[
          pauseMode === 'verse_loop'
            ? 'bg-violet-950/70 border-violet-700 text-violet-300'
            : pauseMode === 'strict'
              ? 'bg-amber-950/70 border-amber-700 text-amber-300'
              : 'bg-gray-800 border-gray-700 text-gray-400'
        ]"
        @click="emit('cyclePauseMode')"
      >
        <PhArrowsClockwise v-if="pauseMode === 'verse_loop'" :size="12" weight="bold" aria-hidden="true" />
        <PhHandPalm v-else-if="pauseMode === 'strict'" :size="12" weight="bold" aria-hidden="true" />
        <PhPlay v-else :size="12" weight="bold" aria-hidden="true" />
        {{ pauseModeLabel }}
      </button>
    </div>
  </div>
</template>
