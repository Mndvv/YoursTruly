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
  <!-- Fixed-height slot prevents layout shifts for lyrics and options below -->
  <div class="h-9 sm:h-10 w-full relative flex items-center justify-center select-none">
    <!-- Transient banner notice (verse rewind, skip) -->
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="bannerNotice"
        class="absolute inset-0 z-10 bg-violet-950/95 border border-violet-500 rounded-xl px-4 flex items-center justify-center text-center text-xs text-violet-200 font-bold shadow-md"
      >
        {{ bannerNotice }}
      </div>
    </Transition>

    <!-- Paused state -->
    <div
      v-if="!bannerNotice && isPaused"
      class="w-full h-full bg-amber-950/80 border border-amber-600/80 rounded-xl px-3 flex items-center justify-between gap-2"
    >
      <span class="text-xs text-amber-200 font-bold flex items-center gap-1.5 truncate">
        <PhPause :size="13" weight="fill" aria-hidden="true" class="shrink-0" />
        Paused at missing word
      </span>
      <AppButton size="sm" variant="secondary" class="h-7 text-xs px-2 shrink-0 min-h-[28px]" @click="emit('replay')">
        <PhArrowCounterClockwise :size="12" weight="bold" aria-hidden="true" />
        Replay (Tab)
      </AppButton>
    </div>
  </div>
</template>
