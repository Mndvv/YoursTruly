<script setup lang="ts">
import { PhArrowCounterClockwise, PhPause } from "@phosphor-icons/vue";
import AppButton from "../ui/AppButton.vue";

interface Props {
  bannerNotice: string | null;
  isPaused: boolean;
}

defineProps<Props>();

const emit = defineEmits<(e: "replay") => void>();
</script>

<template>
  <div>
    <!-- Info banner (verse rewind, skip, etc.) -->
    <div
      v-if="bannerNotice"
      class="bg-violet-950/80 border border-violet-500 rounded-xl px-4 py-2 text-center text-xs text-violet-200 font-bold"
    >
      {{ bannerNotice }}
    </div>

    <!-- Paused state: static (no endless pulse — R-19) -->
    <div
      v-else-if="isPaused"
      class="bg-amber-950/80 border border-amber-600/80 rounded-xl px-4 py-2.5 text-center flex flex-col sm:flex-row sm:items-center justify-between gap-2"
    >
      <span class="text-xs sm:text-sm text-amber-200 font-bold flex items-center justify-center sm:justify-start gap-1.5">
        <PhPause :size="14" weight="fill" aria-hidden="true" />
        Paused at missing word. Enter your answer or use a hint.
      </span>
      <AppButton size="sm" variant="secondary" @click="emit('replay')">
        <PhArrowCounterClockwise :size="14" weight="bold" aria-hidden="true" />
        Replay Line (Tab)
      </AppButton>
    </div>
  </div>
</template>
