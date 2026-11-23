<script setup lang="ts">
import AppButton from "../ui/AppButton.vue";

interface Props {
  globalOffsetMs: number;
  videoStartMs?: number;
  videoEndMs?: number | null;
}

const props = withDefaults(defineProps<Props>(), {
  videoStartMs: 0,
  videoEndMs: null,
});

const emit = defineEmits<{
  (e: "updateOffset", val: number): void;
  (e: "updateStart", val: number): void;
  (e: "updateEnd", val: number | null): void;
}>();

function adjustOffset(delta: number) {
  emit("updateOffset", props.globalOffsetMs + delta);
}
</script>

<template>
  <div class="bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-col gap-3">
    <div class="flex items-center justify-between">
      <span class="text-sm font-semibold text-gray-200">Global Sync Offset</span>
      <span class="text-xs font-mono font-bold px-2 py-0.5 rounded bg-gray-800 text-indigo-400">
        {{ globalOffsetMs >= 0 ? `+${globalOffsetMs}` : globalOffsetMs }} ms
      </span>
    </div>

    <div class="flex flex-wrap items-center gap-1.5">
      <AppButton size="sm" variant="secondary" @click="adjustOffset(-200)">-200ms</AppButton>
      <AppButton size="sm" variant="secondary" @click="adjustOffset(-50)">-50ms</AppButton>
      <AppButton size="sm" variant="ghost" @click="emit('updateOffset', 0)">Reset</AppButton>
      <AppButton size="sm" variant="secondary" @click="adjustOffset(50)">+50ms</AppButton>
      <AppButton size="sm" variant="secondary" @click="adjustOffset(200)">+200ms</AppButton>
    </div>
  </div>
</template>
