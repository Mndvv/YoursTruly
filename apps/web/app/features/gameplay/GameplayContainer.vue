<script setup lang="ts">
import type { SongDetailDto } from "@yourstruly/contracts";
import { onMounted, ref } from "vue";
import ChoiceGrid from "../../components/game/ChoiceGrid.vue";
import ScoreBar from "../../components/game/ScoreBar.vue";
import WriteInput from "../../components/game/WriteInput.vue";
import LyricDisplay from "../../components/player/LyricDisplay.vue";
import YouTubePlayer from "../../components/player/YouTubePlayer.vue";
import { useGameplaySession } from "../../composables/useGameplaySession";

interface Props {
  song: SongDetailDto;
}

const props = defineProps<Props>();
const game = useGameplaySession(props.song);
const isPaused = ref(false);

function onTimeUpdate(timeMs: number) {
  game.onPlaybackTick(timeMs, () => {
    isPaused.value = true;
  });
}
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 py-4 flex flex-col gap-4">
    <!-- Sticky compact video on mobile -->
    <div class="sticky top-14 z-20 bg-gray-950 pb-2">
      <YouTubePlayer
        :video-id="song.youtubeId"
        :start-ms="song.videoStartMs"
        :end-ms="song.videoEndMs"
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

    <!-- Active Line Highlight -->
    <LyricDisplay
      :active-line="game.activeLine.value"
      :active-word-id="game.activeWord.value?.id"
    />

    <!-- Input Interaction Area -->
    <div class="flex flex-col items-center justify-center py-4">
      <WriteInput
        v-if="game.gameMode.value === 'write'"
        v-model="game.currentInput.value"
        @submit="game.submitAnswer"
      />
      <ChoiceGrid
        v-else
        :choices="game.activeChoices.value"
        @select="game.selectChoice"
      />
    </div>
  </div>
</template>
