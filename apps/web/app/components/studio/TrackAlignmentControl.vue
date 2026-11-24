<script setup lang="ts">
import { PhCrosshair } from "@phosphor-icons/vue";
import AppButton from "../ui/AppButton.vue";

interface Props {
  currentTimeMs: number;
  firstLyricStartMs: number | null;
}

defineProps<Props>();

const emit = defineEmits<{
  (e: "alignToCurrentTime", timeMs: number): void;
  (e: "shiftAll", deltaMs: number): void;
}>();

function formatTime(ms: number | null): string {
  if (ms === null) return "--:--";
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  const tenths = Math.floor((ms % 1000) / 100);
  return `${m}:${s.toString().padStart(2, "0")}.${tenths}`;
}
</script>

<template>
  <div class="bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-col gap-3">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <h3 class="text-sm font-semibold text-gray-200">Track Alignment &amp; Intro Shift</h3>
        <p class="text-xs text-gray-400 mt-0.5">
          First lyric starts at:
          <span class="font-mono text-amber-400 font-bold">{{ formatTime(firstLyricStartMs) }}</span>
          • Current video time:
          <span class="font-mono text-violet-400 font-bold">{{ formatTime(currentTimeMs) }}</span>
        </p>
      </div>

      <AppButton
        size="sm"
        variant="primary"
        @click="emit('alignToCurrentTime', currentTimeMs)"
      >
        <PhCrosshair :size="14" weight="bold" class="mr-1" aria-hidden="true" />
        Align all lyrics to {{ formatTime(currentTimeMs) }}
      </AppButton>
    </div>

    <div class="flex flex-wrap items-center gap-1.5 pt-2 border-t border-gray-800/80">
      <span class="text-xs text-gray-400 mr-1">Shift track:</span>
      <AppButton size="sm" variant="secondary" @click="emit('shiftAll', -5000)">-5s</AppButton>
      <AppButton size="sm" variant="secondary" @click="emit('shiftAll', -1000)">-1s</AppButton>
      <AppButton size="sm" variant="secondary" @click="emit('shiftAll', -200)">-200ms</AppButton>
      <AppButton size="sm" variant="secondary" @click="emit('shiftAll', 200)">+200ms</AppButton>
      <AppButton size="sm" variant="secondary" @click="emit('shiftAll', 1000)">+1s</AppButton>
      <AppButton size="sm" variant="secondary" @click="emit('shiftAll', 5000)">+5s</AppButton>
    </div>
  </div>
</template>
