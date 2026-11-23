<script setup lang="ts">
import type { SongDetailDto } from "@yourstruly/contracts";
import type { DifficultyLevel } from "@yourstruly/core";
import { ref } from "vue";
import ChoiceGrid from "../../components/game/ChoiceGrid.vue";
import PreGameLobby from "../../components/game/PreGameLobby.vue";
import ScoreBar from "../../components/game/ScoreBar.vue";
import WriteInput from "../../components/game/WriteInput.vue";
import LyricDisplay from "../../components/player/LyricDisplay.vue";
import YouTubePlayer from "../../components/player/YouTubePlayer.vue";
import AppButton from "../../components/ui/AppButton.vue";
import { useGameplaySession } from "../../composables/useGameplaySession";

interface Props {
  song: SongDetailDto;
}

const props = defineProps<Props>();
const game = useGameplaySession(props.song);

const isGameStarted = ref(false);
const isPaused = ref(false);
const playerRef = ref<{
  pause: () => void;
  play: () => void;
  seekTo: (sec: number) => void;
} | null>(null);

function onStartGame(config: {
  mode: "write" | "choice";
  difficulty: DifficultyLevel;
  autoPause: boolean;
}) {
  game.gameMode.value = config.mode;
  game.difficulty.value = config.difficulty;
  game.autoPause.value = config.autoPause;
  isGameStarted.value = true;
  isPaused.value = false;
}

function onTimeUpdate(timeMs: number) {
  if (!isGameStarted.value) return;
  game.onPlaybackTick(timeMs, () => {
    isPaused.value = true;
    playerRef.value?.pause();
  });
}

function handleWriteSubmit() {
  const solved = game.submitAnswer();
  if (solved && isPaused.value) {
    isPaused.value = false;
    playerRef.value?.play();
  }
}

function handleChoiceSelect(choice: string) {
  const solved = game.selectChoice(choice);
  if (solved && isPaused.value) {
    isPaused.value = false;
    playerRef.value?.play();
  }
}

function replayCurrentLine() {
  const start = game.activeLine.value?.startMs;
  if (start !== null && start !== undefined) {
    playerRef.value?.seekTo(start / 1000);
    isPaused.value = false;
    playerRef.value?.play();
  }
}
</script>

<template>
  <!-- 1. Pre-Game Lobby: Choose mode & difficulty before starting -->
  <PreGameLobby
    v-if="!isGameStarted"
    :song="song"
    :initial-mode="game.gameMode.value"
    :initial-difficulty="game.difficulty.value"
    :initial-auto-pause="game.autoPause.value"
    @start="onStartGame"
  />

  <!-- 2. Active Game Arena -->
  <div v-else class="max-w-4xl mx-auto px-4 py-4 flex flex-col gap-4">
    <!-- Header Controls & Switch Mode -->
    <div class="flex items-center justify-between">
      <NuxtLink to="/" class="text-xs text-gray-400 hover:text-white flex items-center gap-1 font-medium">
        ← Exit Game
      </NuxtLink>
      <button
        type="button"
        class="text-xs text-indigo-400 hover:text-indigo-300 font-semibold px-2.5 py-1 rounded-lg bg-gray-900 border border-gray-800"
        @click="isGameStarted = false"
      >
        ⚙️ Change Difficulty / Mode
      </button>
    </div>

    <!-- Sticky compact video on mobile -->
    <div class="sticky top-14 z-20 bg-gray-950 pb-2">
      <YouTubePlayer
        ref="playerRef"
        :video-id="song.youtubeId"
        :start-ms="song.videoStartMs"
        :end-ms="song.videoEndMs"
        :is-paused="isPaused"
        :autoplay="true"
        @timeupdate="onTimeUpdate"
      />
    </div>

    <!-- Score & Controls Bar -->
    <ScoreBar
      :score="game.score.value"
      :streak="game.streak.value"
      :difficulty="game.difficulty.value"
      :auto-pause="game.autoPause.value"
      :game-mode="game.gameMode.value"
      @toggle-auto-pause="game.autoPause.value = !game.autoPause.value"
      @change-mode="(m) => game.gameMode.value = m"
    />

    <!-- Auto-Pause Notification Banner -->
    <div
      v-if="isPaused"
      class="bg-amber-950/80 border border-amber-600/80 rounded-xl px-4 py-2.5 text-center flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-lg animate-pulse"
    >
      <span class="text-xs sm:text-sm text-amber-200 font-bold">
        ⏸️ Paused at missing word! Enter the correct answer to continue.
      </span>
      <AppButton size="sm" variant="secondary" @click="replayCurrentLine">
        🔄 Replay Line (Tab)
      </AppButton>
    </div>

    <!-- Active Line Highlight with missing word blanks -->
    <LyricDisplay
      :active-line="game.activeLine.value"
      :active-word-id="game.activeWord.value?.id"
      :gap-ids="game.gapIds.value"
      :solved-gap-ids="game.solvedGapIds.value"
      :is-game-active="true"
    />

    <!-- Input Interaction Area -->
    <div class="flex flex-col items-center justify-center py-2">
      <WriteInput
        v-if="game.gameMode.value === 'write'"
        v-model="game.currentInput.value"
        @submit="handleWriteSubmit"
        @replay="replayCurrentLine"
      />
      <ChoiceGrid
        v-else
        :choices="game.activeChoices.value"
        @select="handleChoiceSelect"
      />
    </div>
  </div>
</template>
