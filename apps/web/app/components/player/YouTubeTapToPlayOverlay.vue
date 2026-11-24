<script setup lang="ts">
import { PhPlay } from "@phosphor-icons/vue";

defineProps<{ isVisible: boolean }>();
defineEmits<(e: "play") => void>();
</script>

<template>
  <div
    v-if="isVisible"
    class="absolute inset-0 z-20 flex flex-col items-center justify-center p-4 bg-gray-950/80 backdrop-blur-sm cursor-pointer select-none"
    @click="$emit('play')"
  >
    <button
      type="button"
      class="w-12 h-12 rounded-full bg-violet-600 hover:bg-violet-500 text-white flex items-center justify-center shadow-lg transition active:scale-90"
    >
      <PhPlay :size="24" weight="fill" aria-hidden="true" />
    </button>
    <span class="text-xs font-semibold text-white mt-2">Tap to Start Video</span>
  </div>
</template>
