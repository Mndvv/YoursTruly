<script setup lang="ts">
import { PhArrowsClockwise, PhCheck, PhHandPalm, PhPlay } from "@phosphor-icons/vue";
import type { PauseMode } from "@yourstruly/core";

interface Props {
  modelValue: PauseMode;
}

defineProps<Props>();

const emit = defineEmits<(e: "update:modelValue", mode: PauseMode) => void>();

const pauseOptions: Array<{ mode: PauseMode; label: string; desc: string }> = [
  {
    mode: "verse_loop",
    label: "Verse Loop",
    desc: "Plays verse continuously. Rewinds if words missed.",
  },
  {
    mode: "strict",
    label: "Strict Word Pause",
    desc: "Pauses immediately at every missing word.",
  },
  {
    mode: "continuous",
    label: "Continuous Playback",
    desc: "Never pauses video. Missed words count as failed.",
  },
];
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <label class="text-xs font-semibold text-gray-400">3. Playback &amp; Pause Behavior</label>
    <div class="flex flex-col gap-1.5">
      <button
        v-for="p in pauseOptions"
        :key="p.mode"
        type="button"
        class="p-2.5 rounded-xl border-2 text-left transition flex items-center justify-between min-h-[56px]"
        :class="[modelValue === p.mode ? 'border-accent-500 bg-accent-950/30 text-white' : 'border-gray-800 bg-gray-900 text-gray-300']"
        @click="emit('update:modelValue', p.mode)"
      >
        <div class="flex items-center gap-2">
          <PhArrowsClockwise v-if="p.mode === 'verse_loop'" :size="15" weight="bold" aria-hidden="true" class="shrink-0 text-amber-400" />
          <PhHandPalm v-else-if="p.mode === 'strict'" :size="15" weight="bold" aria-hidden="true" class="shrink-0 text-amber-400" />
          <PhPlay v-else :size="15" weight="bold" aria-hidden="true" class="shrink-0 text-amber-400" />
          <div>
            <div class="font-bold text-xs text-white">{{ p.label }}</div>
            <p class="text-[11px] text-gray-400">{{ p.desc }}</p>
          </div>
        </div>
        <PhCheck v-if="modelValue === p.mode" :size="14" weight="bold" class="text-amber-400 shrink-0 ml-2" aria-hidden="true" />
      </button>
    </div>
  </div>
</template>
