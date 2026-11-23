<script setup lang="ts">
import { ref } from "vue";

interface Props {
  modelValue: string;
  placeholder?: string;
  disabled?: boolean;
}

withDefaults(defineProps<Props>(), {
  placeholder: "Type the missing word...",
  disabled: false,
});

const emit = defineEmits<{
  (e: "update:modelValue", val: string): void;
  (e: "submit"): void;
  (e: "replay"): void;
}>();

function handleKeyDown(event: KeyboardEvent) {
  if (event.key === "Enter") {
    event.preventDefault();
    emit("submit");
  } else if (event.key === "Tab") {
    event.preventDefault();
    emit("replay");
  }
}
</script>

<template>
  <div class="flex items-center gap-2 w-full max-w-md">
    <div class="relative flex-1">
      <input
        type="text"
        :value="modelValue"
        :disabled="disabled"
        :placeholder="placeholder"
        autofocus
        autocomplete="off"
        autocorrect="off"
        autocapitalize="off"
        spellcheck="false"
        class="w-full bg-gray-900 border-2 border-indigo-600/80 rounded-xl px-4 py-3 text-lg font-bold text-center text-white placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/30 transition shadow-lg"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        @keydown="handleKeyDown"
      />
    </div>
    <button
      type="button"
      title="Replay Line (Shortcut: Tab)"
      class="px-3 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 text-xs font-mono font-medium flex items-center gap-1 transition"
      @click="$emit('replay')"
    >
      ↺ Tab
    </button>
  </div>
</template>
