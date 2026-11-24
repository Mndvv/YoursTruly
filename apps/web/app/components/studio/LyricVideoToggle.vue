<script setup lang="ts">
// LyricVideoToggle: lets the studio author mark a video as a lyric video,
// enabling blur in gameplay to prevent reading on-screen text lyrics.
import { PhEyeSlash } from "@phosphor-icons/vue";

interface Props {
  modelValue: boolean;
  isAutoDetected?: boolean;
}

defineProps<Props>();

const emit = defineEmits<(e: "update:modelValue", value: boolean) => void>();
</script>

<template>
  <div class="bg-gray-900/90 border border-gray-800 rounded-xl p-3 flex items-center justify-between gap-4">
    <div class="flex flex-col gap-0.5">
      <div class="flex items-center gap-2">
        <PhEyeSlash :size="14" weight="bold" aria-hidden="true" class="text-gray-400 shrink-0" />
        <span class="text-xs font-semibold text-gray-200">Lyric Video Anti-Cheat (Blur)</span>
        <span
          v-if="isAutoDetected"
          class="text-[10px] font-medium text-amber-400 bg-amber-950/80 border border-amber-800/60 px-1.5 py-0.5 rounded"
        >
          Auto-Detected
        </span>
      </div>
      <p class="text-[11px] text-gray-400 leading-tight">
        Blurs the video during gameplay so on-screen text lyrics cannot be used to cheat.
      </p>
    </div>

    <label class="relative inline-flex items-center cursor-pointer shrink-0">
      <input
        type="checkbox"
        :checked="modelValue"
        class="sr-only peer"
        @change="(e) => emit('update:modelValue', (e.target as HTMLInputElement).checked)"
      />
      <div class="w-10 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500" />
    </label>
  </div>
</template>
