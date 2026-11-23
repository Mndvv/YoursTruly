<script setup lang="ts">
import type { SongDetailDto } from "@yourstruly/contracts";
import type { DifficultyLevel } from "@yourstruly/core";
import { ref } from "vue";
import AppButton from "../ui/AppButton.vue";

interface Props {
  song: SongDetailDto;
  initialMode?: "write" | "choice";
  initialDifficulty?: DifficultyLevel;
  initialAutoPause?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  initialMode: "choice",
  initialDifficulty: "intermediate",
  initialAutoPause: true,
});

const emit =
  defineEmits<
    (
      e: "start",
      config: {
        mode: "write" | "choice";
        difficulty: DifficultyLevel;
        autoPause: boolean;
      },
    ) => void
  >();

const selectedMode = ref<"write" | "choice">(props.initialMode);
const selectedDifficulty = ref<DifficultyLevel>(props.initialDifficulty);
const autoPause = ref(props.initialAutoPause);

const difficultyOptions: Array<{
  level: DifficultyLevel;
  label: string;
  badge: string;
  desc: string;
  colorClass: string;
}> = [
  {
    level: "beginner",
    label: "Beginner",
    badge: "10% Gaps",
    desc: "Occasional missing words, great for casual listening",
    colorClass: "border-emerald-500/80 bg-emerald-950/30 text-emerald-300",
  },
  {
    level: "intermediate",
    label: "Intermediate",
    badge: "25% Gaps",
    desc: "Standard balanced lyrics practice",
    colorClass: "border-yellow-500/80 bg-yellow-950/30 text-yellow-300",
  },
  {
    level: "advanced",
    label: "Advanced",
    badge: "50% Gaps",
    desc: "Half the words missing for fast ears",
    colorClass: "border-orange-500/80 bg-orange-950/30 text-orange-300",
  },
  {
    level: "expert",
    label: "Expert",
    badge: "100% Gaps",
    desc: "Fill every single word in the entire song!",
    colorClass: "border-rose-500/80 bg-rose-950/30 text-rose-300",
  },
];

function handleStart() {
  emit("start", {
    mode: selectedMode.value,
    difficulty: selectedDifficulty.value,
    autoPause: autoPause.value,
  });
}
</script>

<template>
  <div class="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-6">
    <!-- Song Header Card -->
    <div class="bg-gray-900 border border-gray-800 rounded-2xl p-4 sm:p-5 flex items-center gap-4 shadow-xl">
      <img
        :src="`https://i.ytimg.com/vi/${song.youtubeId}/mqdefault.jpg`"
        :alt="song.title"
        class="w-24 sm:w-32 aspect-video object-cover rounded-xl border border-gray-800"
      />
      <div class="flex-1 min-w-0">
        <span class="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-950 text-indigo-300 border border-indigo-800 mb-1">
          {{ song.languageCode.toUpperCase() }}
        </span>
        <h1 class="text-lg sm:text-xl font-extrabold text-white truncate">{{ song.title }}</h1>
        <p class="text-sm text-gray-400 truncate">{{ song.artist }}</p>
      </div>
    </div>

    <!-- Mode Selection -->
    <div class="flex flex-col gap-2">
      <label class="text-xs font-semibold uppercase tracking-wider text-gray-400">Select Game Mode</label>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          type="button"
          class="p-4 rounded-xl border-2 text-left transition flex flex-col gap-1"
          :class="[
            selectedMode === 'choice'
              ? 'border-indigo-500 bg-indigo-950/40 text-white shadow-lg'
              : 'border-gray-800 bg-gray-900 text-gray-300 hover:border-gray-700'
          ]"
          @click="selectedMode = 'choice'"
        >
          <div class="flex items-center justify-between">
            <span class="font-bold text-base flex items-center gap-2">🔘 Choice Mode</span>
            <span v-if="selectedMode === 'choice'" class="text-indigo-400 text-sm font-bold">✓</span>
          </div>
          <p class="text-xs text-gray-400">Choose the missing word from 4 multiple choice buttons.</p>
        </button>

        <button
          type="button"
          class="p-4 rounded-xl border-2 text-left transition flex flex-col gap-1"
          :class="[
            selectedMode === 'write'
              ? 'border-indigo-500 bg-indigo-950/40 text-white shadow-lg'
              : 'border-gray-800 bg-gray-900 text-gray-300 hover:border-gray-700'
          ]"
          @click="selectedMode = 'write'"
        >
          <div class="flex items-center justify-between">
            <span class="font-bold text-base flex items-center gap-2">✍️ Write Mode</span>
            <span v-if="selectedMode === 'write'" class="text-indigo-400 text-sm font-bold">✓</span>
          </div>
          <p class="text-xs text-gray-400">Type the missing lyrics with your keyboard. Great for spelling.</p>
        </button>
      </div>
    </div>

    <!-- Difficulty Selection -->
    <div class="flex flex-col gap-2">
      <label class="text-xs font-semibold uppercase tracking-wider text-gray-400">Select Difficulty Level</label>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <button
          v-for="opt in difficultyOptions"
          :key="opt.level"
          type="button"
          class="p-3.5 rounded-xl border-2 text-left transition flex items-center justify-between"
          :class="[
            selectedDifficulty === opt.level
              ? `${opt.colorClass} shadow-md`
              : 'border-gray-800 bg-gray-900 text-gray-300 hover:border-gray-700'
          ]"
          @click="selectedDifficulty = opt.level"
        >
          <div>
            <div class="flex items-center gap-2">
              <span class="font-bold text-sm text-white">{{ opt.label }}</span>
              <span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-gray-800 text-gray-300 border border-gray-700">{{ opt.badge }}</span>
            </div>
            <p class="text-xs text-gray-400 mt-0.5">{{ opt.desc }}</p>
          </div>
          <span v-if="selectedDifficulty === opt.level" class="font-bold text-sm ml-2">✓</span>
        </button>
      </div>
    </div>

    <!-- Auto Pause Option -->
    <div class="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center justify-between">
      <div class="flex flex-col">
        <span class="text-sm font-semibold text-white">Auto-Pause on Missing Words</span>
        <span class="text-xs text-gray-400">Pauses playback at unsolved gaps so you don't miss anything.</span>
      </div>
      <input
        v-model="autoPause"
        type="checkbox"
        class="w-5 h-5 rounded text-indigo-600 bg-gray-800 border-gray-700 focus:ring-indigo-500 cursor-pointer"
      />
    </div>

    <!-- Start Button -->
    <div class="flex flex-col gap-2 pt-2">
      <AppButton size="lg" variant="primary" class="w-full text-lg py-4 shadow-xl" @click="handleStart">
        Start Playing ▶
      </AppButton>
      <NuxtLink to="/" class="text-center text-xs text-gray-500 hover:text-gray-300 pt-1">
        ← Back to Song Catalog
      </NuxtLink>
    </div>
  </div>
</template>
