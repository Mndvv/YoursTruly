<script setup lang="ts">
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
    <div
      v-if="bannerNotice"
      class="bg-indigo-950/80 border border-indigo-500 rounded-xl px-4 py-2 text-center text-xs text-indigo-200 font-bold shadow-lg"
    >
      {{ bannerNotice }}
    </div>

    <div
      v-else-if="isPaused"
      class="bg-amber-950/80 border border-amber-600/80 rounded-xl px-4 py-2.5 text-center flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-lg animate-pulse"
    >
      <span class="text-xs sm:text-sm text-amber-200 font-bold">
        ⏸️ Paused at missing word! Enter answer or click Hint to continue.
      </span>
      <AppButton size="sm" variant="secondary" @click="emit('replay')">
        🔄 Replay Line (Tab)
      </AppButton>
    </div>
  </div>
</template>
