<script setup lang="ts">
interface Props {
  choices: string[];
  disabled?: boolean;
}

withDefaults(defineProps<Props>(), {
  disabled: false,
});

defineEmits<(e: "select", choice: string) => void>();
</script>

<template>
  <div class="grid grid-cols-2 gap-3 w-full max-w-md">
    <button
      v-for="(choice, idx) in choices"
      :key="choice + idx"
      type="button"
      :disabled="disabled"
      class="py-3 px-4 rounded-xl font-bold text-base transition-all bg-gray-900 border-2 border-gray-800 hover:border-indigo-500 hover:bg-gray-850 text-white flex items-center justify-between shadow-md active:scale-95 disabled:opacity-50"
      @click="$emit('select', choice)"
    >
      <span>{{ choice }}</span>
      <span class="text-xs text-gray-500 font-mono">{{ idx + 1 }}</span>
    </button>
  </div>
</template>
