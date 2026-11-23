<script setup lang="ts">
interface Props {
  choices: string[];
  disabled?: boolean;
  wrongChoices?: Set<string>;
}

withDefaults(defineProps<Props>(), {
  disabled: false,
  wrongChoices: () => new Set<string>(),
});

defineEmits<{
  (e: "select", choice: string): void;
  (e: "hint"): void;
}>();
</script>

<template>
  <div class="flex flex-col items-center gap-2 w-full max-w-md">
    <div class="grid grid-cols-2 gap-3 w-full">
      <button
        v-for="(choice, idx) in choices"
        :key="choice + idx"
        type="button"
        :disabled="disabled || wrongChoices.has(choice)"
        class="py-3 px-4 rounded-xl font-bold text-base transition-all flex items-center justify-between shadow-md active:scale-95 disabled:opacity-50"
        :class="[
          wrongChoices.has(choice)
            ? 'bg-rose-950/40 border-2 border-rose-600/80 text-rose-300 line-through'
            : 'bg-gray-900 border-2 border-gray-800 hover:border-indigo-500 hover:bg-gray-850 text-white'
        ]"
        @click="$emit('select', choice)"
      >
        <span>{{ choice }}</span>
        <span class="text-xs text-gray-500 font-mono">{{ idx + 1 }}</span>
      </button>
    </div>

    <!-- 50/50 Hint Button -->
    <button
      v-if="choices.length > 2"
      type="button"
      class="text-xs text-amber-300/80 hover:text-amber-300 font-mono flex items-center gap-1 pt-1"
      @click="$emit('hint')"
    >
      💡 50/50 Hint (Eliminate 2 wrong answers)
    </button>
  </div>
</template>
