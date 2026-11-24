<script setup lang="ts">
import { PhX } from "@phosphor-icons/vue";

defineEmits<(e: "dismiss") => void>();
</script>

<template>
  <div class="fixed bottom-3 right-4 z-50 sm:hidden">
    <button
      type="button"
      class="px-3 py-1.5 rounded-full bg-gray-900 border border-gray-700 text-xs font-semibold text-gray-200 shadow-xl backdrop-blur flex items-center gap-1 active:scale-95 transition min-h-[36px]"
      @click="$emit('dismiss')"
    >
      <PhX :size="12" weight="bold" aria-hidden="true" />
      <span>Hide Keyboard</span>
    </button>
  </div>
</template>
