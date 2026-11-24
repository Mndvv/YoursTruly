<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";

interface Props {
  currentWordText?: string;
  currentWordIndex: number;
  totalWords: number;
  isRecording?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  currentWordText: "",
  isRecording: false,
});

const emit = defineEmits<{
  (e: "tapdown"): void;
  (e: "tapup"): void;
}>();

const isPressed = ref(false);

function handlePointerDown() {
  if (isPressed.value) return;
  isPressed.value = true;
  emit("tapdown");
}

function handlePointerUp() {
  if (!isPressed.value) return;
  isPressed.value = false;
  emit("tapup");
}

function handleKeyDown(event: KeyboardEvent) {
  if (event.code === "Space" && !event.repeat) {
    const target = event.target as HTMLElement;
    if (target.tagName !== "INPUT" && target.tagName !== "TEXTAREA") {
      event.preventDefault();
      handlePointerDown();
    }
  }
}

function handleKeyUp(event: KeyboardEvent) {
  if (event.code === "Space") {
    handlePointerUp();
  }
}

onMounted(() => {
  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleKeyDown);
  window.removeEventListener("keyup", handleKeyUp);
});
</script>

<template>
  <div class="flex flex-col items-center gap-3 w-full">
    <div class="flex items-center justify-between w-full text-xs text-gray-400 font-mono">
      <span>Word {{ currentWordIndex + 1 }} of {{ totalWords }}</span>
      <span class="text-violet-400">Shortcut: Hold &amp; Release [Spacebar]</span>
    </div>

    <button
      type="button"
      class="w-full py-8 px-4 rounded-2xl border-2 transition-all select-none flex flex-col items-center justify-center cursor-pointer shadow-lg active:scale-[0.99]"
      :class="[
        isPressed
          ? 'bg-yellow-500/20 border-yellow-400 text-yellow-300 ring-4 ring-yellow-500/30'
          : 'bg-gray-800/80 border-gray-700 hover:border-violet-500 text-gray-200'
      ]"
      @pointerdown="handlePointerDown"
      @pointerup="handlePointerUp"
      @pointerleave="handlePointerUp"
    >
      <span class="text-xs uppercase tracking-wider text-gray-400 mb-1 font-semibold">
        {{ isPressed ? "Recording Hold..." : "Tap or Hold" }}
      </span>
      <span class="text-2xl sm:text-3xl font-extrabold tracking-tight">
        {{ currentWordText || "(End of Track)" }}
      </span>
    </button>
  </div>
</template>
