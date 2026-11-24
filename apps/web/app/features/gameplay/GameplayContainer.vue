<script setup lang="ts">
import type { SongDetailDto } from "@yourstruly/contracts";
import type { DifficultyLevel, PauseMode } from "@yourstruly/core";
import { ref } from "vue";
import ChoiceGrid from "../../components/game/ChoiceGrid.vue";
import GameplayBanner from "../../components/game/GameplayBanner.vue";
import PreGameLobby from "../../components/game/PreGameLobby.vue";
import ScoreBar from "../../components/game/ScoreBar.vue";
import WriteInput from "../../components/game/WriteInput.vue";
import LyricDisplay from "../../components/player/LyricDisplay.vue";
import YouTubePlayer from "../../components/player/YouTubePlayer.vue";
import { useGameplaySession } from "../../composables/useGameplaySession";
import { useVirtualKeyboard } from "../../composables/useVirtualKeyboard";

const props = defineProps<{ song: SongDetailDto }>();
const game = useGameplaySession(props.song);
const { isKeyboardOpen, keyboardHeight, dismissKeyboard } = useVirtualKeyboard();

const isGameStarted = ref(false);
const isPaused = ref(false);
const bannerNotice = ref<string | null>(null);
const playerRef = ref<{ pause: () => void; play: () => void; seekTo: (s: number) => void } | null>(
  null,
);

function showBanner(msg: string, ms = 2200) {
  bannerNotice.value = msg;
  setTimeout(() => {
    bannerNotice.value = null;
  }, ms);
}

function checkResumeAfterSolve(solved: boolean) {
  if (solved && isPaused.value && !game.activeWord.value) {
    isPaused.value = false;
    playerRef.value?.play();
  }
}

interface StartConfig {
  mode: "write" | "choice";
  difficulty: DifficultyLevel;
  pauseMode: PauseMode;
  ignoreSymbols?: boolean;
  debounceDoubleLetters?: boolean;
}

function onStartGame(c: StartConfig) {
  game.gameMode.value = c.mode;
  game.difficulty.value = c.difficulty;
  game.pauseMode.value = c.pauseMode;
  if (c.ignoreSymbols !== undefined) game.ignoreSymbols.value = c.ignoreSymbols;
  if (c.debounceDoubleLetters !== undefined)
    game.debounceDoubleLetters.value = c.debounceDoubleLetters;
  isGameStarted.value = true;
  isPaused.value = false;
}

function onTimeUpdate(timeMs: number) {
  if (!isGameStarted.value) return;
  game.onPlaybackTick(timeMs, {
    onAutoPause: () => {
      isPaused.value = true;
      playerRef.value?.pause();
    },
    onRewindVerse: (toMs) => {
      playerRef.value?.seekTo(toMs / 1000);
      showBanner("🔁 Verse Rewind: Rewinding line so you can retry missed lyrics!");
      checkResumeAfterSolve(game.submitAnswer(true));
    },
    onSkipVerse: () => showBanner("⏭️ Verse Skipped: Max retries reached, continuing song!", 2500),
  });
  checkResumeAfterSolve(false);
}

function cyclePauseMode() {
  const modes: PauseMode[] = ["verse_loop", "strict", "continuous"];
  game.pauseMode.value = modes[(modes.indexOf(game.pauseMode.value) + 1) % modes.length];
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
  <PreGameLobby
    v-if="!isGameStarted"
    :song="song"
    :initial-mode="game.gameMode.value"
    :initial-difficulty="game.difficulty.value"
    :initial-pause-mode="game.pauseMode.value"
    :initial-ignore-symbols="game.ignoreSymbols.value"
    :initial-debounce-double-letters="game.debounceDoubleLetters.value"
    @start="onStartGame"
  />

  <div
    v-else
    class="max-w-4xl mx-auto px-4 py-4 flex flex-col gap-4 transition-all duration-200"
    :style="{ paddingBottom: isKeyboardOpen ? `${keyboardHeight}px` : '1rem' }"
  >
    <div class="flex items-center justify-between">
      <NuxtLink to="/" class="text-xs text-gray-400 hover:text-white flex items-center gap-1 font-medium">← Exit Game</NuxtLink>
      <button
        type="button"
        class="text-xs text-indigo-400 hover:text-indigo-300 font-semibold px-2.5 py-1 rounded-lg bg-gray-900 border border-gray-800"
        @click="isGameStarted = false"
      >⚙️ Change Difficulty / Mode</button>
    </div>

    <!-- Sticky Video Player (Scrubber & Controls Disabled for Gameplay) -->
    <div class="sticky top-14 z-20 bg-gray-950 pb-2">
      <YouTubePlayer
        ref="playerRef"
        :video-id="song.youtubeId"
        :start-ms="song.videoStartMs"
        :end-ms="song.videoEndMs"
        :is-paused="isPaused"
        :autoplay="true"
        :show-controls="false"
        :disable-scrubbing="true"
        :is-blurred="Boolean(song.lyricsData?.isLyricVideo)"
        @timeupdate="onTimeUpdate"
      />
    </div>

    <ScoreBar
      :score="game.score.value"
      :streak="game.streak.value"
      :difficulty="game.difficulty.value"
      :pause-mode="game.pauseMode.value"
      :game-mode="game.gameMode.value"
      :success-count="game.successCount.value"
      :fail-count="game.failCount.value"
      :ignore-symbols="game.ignoreSymbols.value"
      :debounce-double-letters="game.debounceDoubleLetters.value"
      @cycle-pause-mode="cyclePauseMode"
      @change-mode="(m) => game.gameMode.value = m"
      @toggle-ignore-symbols="() => game.ignoreSymbols.value = !game.ignoreSymbols.value"
      @toggle-debounce="() => game.debounceDoubleLetters.value = !game.debounceDoubleLetters.value"
    />

    <GameplayBanner
      :banner-notice="bannerNotice"
      :is-paused="isPaused"
      @replay="replayCurrentLine"
    />

    <LyricDisplay
      :active-line="game.activeLine.value"
      :active-word-id="game.activeWord.value?.id"
      :gap-ids="game.gapIds.value"
      :solved-gap-ids="game.solvedGapIds.value"
      :failed-gap-ids="game.failedGapIds.value"
      :current-hint="game.currentHint.value"
      :is-game-active="true"
    />

    <div class="flex flex-col items-center justify-center py-2">
      <WriteInput
        v-if="game.gameMode.value === 'write'"
        :model-value="game.currentInput.value"
        :has-error="game.inputHasError.value"
        :target-word="game.activeWord.value?.text"
        :debounce-double-letters="game.debounceDoubleLetters.value"
        @update:model-value="(val) => { game.onInputChange(val); checkResumeAfterSolve(true); }"
        @submit="checkResumeAfterSolve(game.submitAnswer(false))"
        @replay="replayCurrentLine"
        @hint="game.giveHint"
      />
      <ChoiceGrid
        v-else
        :choices="game.activeChoices.value"
        :wrong-choices="game.wrongChoices.value"
        @select="(c) => checkResumeAfterSolve(game.selectChoice(c))"
        @hint="game.giveHint"
      />
    </div>

    <!-- Floating Virtual Keyboard Toolbar on Mobile -->
    <div v-if="isKeyboardOpen" class="fixed bottom-3 right-4 z-50 sm:hidden">
      <button
        type="button"
        class="px-3 py-1.5 rounded-full bg-gray-900 border border-gray-700 text-xs font-semibold text-gray-200 shadow-xl backdrop-blur flex items-center gap-1 active:scale-95 transition"
        @click="dismissKeyboard"
      >
        <span>Hide Keyboard ✕</span>
      </button>
    </div>
  </div>
</template>
