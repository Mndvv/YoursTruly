<script setup lang="ts">
interface Props {
  score: number;
  streak: number;
  difficulty: string;
  autoPause: boolean;
  gameMode: "write" | "choice";
}

defineProps<Props>();

const emit = defineEmits<{
  (e: "toggleAutoPause"): void;
  (e: "changeMode", mode: "write" | "choice"): void;
}>();
</script>

<template>
  <div class="flex flex-wrap items-center justify-between gap-3 bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 text-xs">
    <div class="flex items-center gap-4">
      <div class="flex items-center gap-1.5">
        <span class="text-gray-400">Score:</span>
        <span class="font-bold text-indigo-400 font-mono text-sm">{{ score }}</span>
      </div>
      <div class="flex items-center gap-1.5">
        <span class="text-gray-400">Streak:</span>
        <span class="font-bold text-amber-400 font-mono text-sm">🔥 {{ streak }}</span>
      </div>
      <span class="text-gray-600">|</span>
      <span class="uppercase tracking-wide font-semibold text-gray-300 font-mono">{{ difficulty }}</span>
    </div>

    <div class="flex items-center gap-2">
      <!-- Mode Toggle -->
      <button
        type="button"
        class="px-2 py-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium transition"
        @click="emit('changeMode', gameMode === 'write' ? 'choice' : 'write')"
      >
        Mode: {{ gameMode === 'write' ? '⌨️ Write' : '🔘 Choice' }}
      </button>

      <!-- Auto Pause Toggle -->
      <button
        type="button"
        class="px-2.5 py-1 rounded font-medium transition border"
        :class="[
          autoPause
            ? 'bg-indigo-950/70 border-indigo-700 text-indigo-300'
            : 'bg-gray-800 border-gray-700 text-gray-400'
        ]"
        @click="emit('toggleAutoPause')"
      >
        Auto-Pause: {{ autoPause ? 'ON' : 'OFF' }}
      </button>
    </div>
  </div>
</template>
