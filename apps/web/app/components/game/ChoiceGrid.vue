<script setup lang="ts">
import { PhLightbulb } from "@phosphor-icons/vue";

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
  <div class="flex flex-col items-center gap-1.5 w-full max-w-md">
    <div class="grid grid-cols-2 gap-2 sm:gap-2.5 w-full">
      <button
        v-for="(choice, idx) in choices"
        :key="choice + idx"
        type="button"
        :disabled="disabled || wrongChoices.has(choice)"
        class="py-2 sm:py-2.5 px-3 sm:px-4 rounded-xl font-bold text-sm sm:text-base transition-all flex items-center justify-between shadow-md active:scale-95 disabled:opacity-50 min-h-[44px] sm:min-h-[48px]"
        :class="[
          wrongChoices.has(choice)
            ? 'bg-rose-950/40 border-2 border-rose-600/80 text-rose-300 line-through'
            : 'bg-gray-900 border-2 border-gray-800 hover:border-violet-500 hover:bg-gray-850 text-white'
        ]"
        @click="$emit('select', choice)"
      >
        <span>{{ choice }}</span>
        <span class="text-xs text-gray-500 font-mono">{{ idx + 1 }}</span>
      </button>
    </div>

    <!-- 50/50 hint button -->
    <button
      v-if="choices.length > 2"
      type="button"
      class="text-xs text-amber-300/80 hover:text-amber-300 font-mono flex items-center gap-1 pt-0.5 min-h-[30px]"
      @click="$emit('hint')"
    >
      <PhLightbulb :size="13" weight="bold" aria-hidden="true" />
      50/50 Hint (Eliminate 2 wrong answers)
    </button>
  </div>
</template>
