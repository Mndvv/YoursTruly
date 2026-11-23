<script setup lang="ts">
import type { SongDetailDto } from "@yourstruly/contracts";
import type { DifficultyLevel, PauseMode } from "@yourstruly/core";
import { ref } from "vue";
import AppButton from "../ui/AppButton.vue";

interface Props {
  song: SongDetailDto;
  initialMode?: "write" | "choice";
  initialDifficulty?: DifficultyLevel;
  initialPauseMode?: PauseMode;
  initialIgnoreSymbols?: boolean;
  initialDebounceDoubleLetters?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  initialMode: "choice",
  initialDifficulty: "intermediate",
  initialPauseMode: "verse_loop",
  initialIgnoreSymbols: true,
  initialDebounceDoubleLetters: true,
});

const emit =
  defineEmits<
    (
      e: "start",
      config: {
        mode: "write" | "choice";
        difficulty: DifficultyLevel;
        pauseMode: PauseMode;
        ignoreSymbols: boolean;
        debounceDoubleLetters: boolean;
      },
    ) => void
  >();

const selectedMode = ref<"write" | "choice">(props.initialMode);
const selectedDifficulty = ref<DifficultyLevel>(props.initialDifficulty);
const selectedPauseMode = ref<PauseMode>(props.initialPauseMode);
const selectedIgnoreSymbols = ref(props.initialIgnoreSymbols);
const selectedDebounce = ref(props.initialDebounceDoubleLetters);

const difficultyOptions: Array<{ level: DifficultyLevel; label: string; badge: string }> = [
  { level: "beginner", label: "Beginner", badge: "10% Gaps" },
  { level: "intermediate", label: "Intermediate", badge: "25% Gaps" },
  { level: "advanced", label: "Advanced", badge: "50% Gaps" },
  { level: "expert", label: "Expert", badge: "100% Gaps" },
];

const pauseOptions: Array<{ mode: PauseMode; label: string; desc: string }> = [
  {
    mode: "verse_loop",
    label: "🔁 Verse Loop (LingoClip Style)",
    desc: "Plays verse continuously. Rewinds if words missed.",
  },
  {
    mode: "strict",
    label: "🛑 Strict Word Pause",
    desc: "Pauses immediately at every missing word.",
  },
  {
    mode: "continuous",
    label: "▶️ Continuous Playback",
    desc: "Never pauses video. Missed words count as failed.",
  },
];

function handleStart() {
  emit("start", {
    mode: selectedMode.value,
    difficulty: selectedDifficulty.value,
    pauseMode: selectedPauseMode.value,
    ignoreSymbols: selectedIgnoreSymbols.value,
    debounceDoubleLetters: selectedDebounce.value,
  });
}
</script>

<template>
  <div class="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-4">
    <div class="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex items-center gap-4 shadow-xl">
      <img
        :src="`https://i.ytimg.com/vi/${song.youtubeId}/mqdefault.jpg`"
        :alt="song.title"
        class="w-24 sm:w-28 aspect-video object-cover rounded-xl border border-gray-800"
      />
      <div class="flex-1 min-w-0">
        <span class="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-950 text-indigo-300 border border-indigo-800 mb-1">
          {{ song.languageCode.toUpperCase() }}
        </span>
        <h1 class="text-base sm:text-lg font-extrabold text-white truncate">{{ song.title }}</h1>
        <p class="text-xs text-gray-400 truncate">{{ song.artist }}</p>
      </div>
    </div>

    <!-- Mode Selection -->
    <div class="flex flex-col gap-1.5">
      <label class="text-xs font-semibold uppercase tracking-wider text-gray-400">1. Game Mode</label>
      <div class="grid grid-cols-2 gap-3">
        <button
          type="button"
          class="p-3 rounded-xl border-2 text-left transition flex items-center justify-between"
          :class="[selectedMode === 'choice' ? 'border-indigo-500 bg-indigo-950/40 text-white shadow-lg' : 'border-gray-800 bg-gray-900 text-gray-300']"
          @click="selectedMode = 'choice'"
        >
          <div>
            <div class="font-bold text-sm">🔘 Choice Mode</div>
            <p class="text-[11px] text-gray-400">Tap 1 of 4 choices</p>
          </div>
          <span v-if="selectedMode === 'choice'" class="text-indigo-400 font-bold">✓</span>
        </button>

        <button
          type="button"
          class="p-3 rounded-xl border-2 text-left transition flex items-center justify-between"
          :class="[selectedMode === 'write' ? 'border-indigo-500 bg-indigo-950/40 text-white shadow-lg' : 'border-gray-800 bg-gray-900 text-gray-300']"
          @click="selectedMode = 'write'"
        >
          <div>
            <div class="font-bold text-sm">✍️ Write Mode</div>
            <p class="text-[11px] text-gray-400">Fast auto-submit typing</p>
          </div>
          <span v-if="selectedMode === 'write'" class="text-indigo-400 font-bold">✓</span>
        </button>
      </div>
    </div>

    <!-- Difficulty Selection -->
    <div class="flex flex-col gap-1.5">
      <label class="text-xs font-semibold uppercase tracking-wider text-gray-400">2. Difficulty Level</label>
      <div class="grid grid-cols-2 gap-2">
        <button
          v-for="opt in difficultyOptions"
          :key="opt.level"
          type="button"
          class="p-2.5 rounded-xl border-2 text-left transition flex items-center justify-between"
          :class="[selectedDifficulty === opt.level ? 'border-indigo-500 bg-indigo-950/40 text-white shadow-md' : 'border-gray-800 bg-gray-900 text-gray-300']"
          @click="selectedDifficulty = opt.level"
        >
          <div>
            <span class="font-bold text-xs text-white">{{ opt.label }}</span>
            <span class="text-[10px] font-mono ml-1.5 text-gray-400">{{ opt.badge }}</span>
          </div>
          <span v-if="selectedDifficulty === opt.level" class="font-bold text-xs text-indigo-400">✓</span>
        </button>
      </div>
    </div>

    <!-- Pause Mode Selection -->
    <div class="flex flex-col gap-1.5">
      <label class="text-xs font-semibold uppercase tracking-wider text-gray-400">3. Playback & Pause Behavior</label>
      <div class="flex flex-col gap-1.5">
        <button
          v-for="p in pauseOptions"
          :key="p.mode"
          type="button"
          class="p-2.5 rounded-xl border-2 text-left transition flex items-center justify-between"
          :class="[selectedPauseMode === p.mode ? 'border-amber-500/80 bg-amber-950/30 text-white shadow-md' : 'border-gray-800 bg-gray-900 text-gray-300']"
          @click="selectedPauseMode = p.mode"
        >
          <div>
            <div class="font-bold text-xs text-white">{{ p.label }}</div>
            <p class="text-[11px] text-gray-400">{{ p.desc }}</p>
          </div>
          <span v-if="selectedPauseMode === p.mode" class="font-bold text-xs text-amber-400 ml-2">✓</span>
        </button>
      </div>
    </div>

    <!-- Preferences: Symbols & Debounce -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
      <label class="flex items-center gap-2.5 p-2.5 bg-gray-900 border border-gray-800 rounded-xl cursor-pointer hover:border-gray-700 transition">
        <input v-model="selectedIgnoreSymbols" type="checkbox" class="w-4 h-4 rounded text-indigo-600 bg-gray-800 border-gray-700" />
        <div class="flex-1 text-xs">
          <span class="font-bold text-white block">🔤 Ignore Symbols</span>
          <span class="text-gray-400 text-[10px]">dont matches don't</span>
        </div>
      </label>
      <label class="flex items-center gap-2.5 p-2.5 bg-gray-900 border border-gray-800 rounded-xl cursor-pointer hover:border-gray-700 transition">
        <input v-model="selectedDebounce" type="checkbox" class="w-4 h-4 rounded text-indigo-600 bg-gray-800 border-gray-700" />
        <div class="flex-1 text-xs">
          <span class="font-bold text-white block">🛡️ Anti-Chatter</span>
          <span class="text-gray-400 text-[10px]">Filter double letters like 'llike'</span>
        </div>
      </label>
    </div>

    <div class="flex flex-col gap-2 pt-1">
      <AppButton size="lg" variant="primary" class="w-full text-base py-3 shadow-xl" @click="handleStart">
        Start Playing ▶
      </AppButton>
      <NuxtLink to="/" class="text-center text-xs text-gray-500 hover:text-gray-300">
        ← Back to Song Catalog
      </NuxtLink>
    </div>
  </div>
</template>
