<script setup lang="ts">
interface Props {
  modelValue: string;
  placeholder?: string;
  disabled?: boolean;
  hasError?: boolean;
}

withDefaults(defineProps<Props>(), {
  placeholder: "Type the missing word...",
  disabled: false,
  hasError: false,
});

const emit = defineEmits<{
  (e: "update:modelValue", val: string): void;
  (e: "submit"): void;
  (e: "replay"): void;
  (e: "hint"): void;
}>();

function handleKeyDown(event: KeyboardEvent) {
  if (event.key === "Enter") {
    event.preventDefault();
    emit("submit");
  } else if (event.key === "Tab") {
    event.preventDefault();
    emit("replay");
  } else if (event.key === "Control" || event.key === "F1") {
    event.preventDefault();
    emit("hint");
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
        class="w-full bg-gray-900 border-2 rounded-xl px-4 py-3 text-lg font-bold text-center text-white placeholder-gray-500 focus:outline-none transition shadow-lg"
        :class="[
          hasError
            ? 'border-rose-500 ring-4 ring-rose-500/30'
            : 'border-indigo-600/80 focus:ring-4 focus:ring-indigo-500/30'
        ]"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        @keydown="handleKeyDown"
      />
    </div>

    <!-- Hint Button -->
    <button
      type="button"
      title="Give Letter Hint (Shortcut: Ctrl or F1)"
      class="px-3 py-3 rounded-xl bg-amber-950/40 hover:bg-amber-950/80 text-amber-300 border border-amber-700/60 text-xs font-mono font-bold flex items-center gap-1 transition"
      @click="$emit('hint')"
    >
      💡 Hint
    </button>

    <!-- Replay Line Button -->
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
