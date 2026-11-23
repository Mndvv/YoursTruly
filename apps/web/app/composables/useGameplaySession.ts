import type { LyricLineData, SongDetailDto, WordTokenData } from "@yourstruly/contracts";
import {
  type DifficultyLevel,
  GameplaySessionEngine,
  type PauseMode,
  type PlaybackActions,
} from "@yourstruly/core";
import { ref, watch } from "vue";

export function useGameplaySession(song: SongDetailDto) {
  const gameMode = ref<"write" | "choice">("write");
  const difficulty = ref<DifficultyLevel>("intermediate");
  const pauseMode = ref<PauseMode>("verse_loop");

  const engine = new GameplaySessionEngine(song, pauseMode.value);

  const score = ref(0);
  const streak = ref(0);
  const successCount = ref(0);
  const failCount = ref(0);
  const currentInput = ref("");
  const inputHasError = ref(false);

  const gapIds = ref<Set<string>>(new Set());
  const solvedGapIds = ref<Set<string>>(new Set());
  const failedGapIds = ref<Set<string>>(new Set());
  const activeLine = ref<LyricLineData | null>(null);
  const activeWord = ref<WordTokenData | null>(null);
  const activeChoices = ref<string[]>([]);
  const wrongChoices = ref<Set<string>>(new Set());
  const currentHint = ref<string | null>(null);
  const hintLevel = ref(0);

  function syncState() {
    score.value = engine.getScorer().getScore();
    streak.value = engine.getScorer().getStreak();
    successCount.value = engine.getScorer().getSuccessCount();
    failCount.value = engine.getScorer().getFailCount();
    gapIds.value = new Set(engine.gapIds);
    solvedGapIds.value = new Set(engine.solvedGapIds);
    failedGapIds.value = new Set(engine.failedGapIds);
    activeLine.value = engine.activeLine;
    activeWord.value = engine.activeWord;
    activeChoices.value = [...engine.activeChoices];
    wrongChoices.value = new Set(engine.wrongChoices);
    currentHint.value = engine.currentHint;
    hintLevel.value = engine.hintLevel;
  }

  function regenerateGaps() {
    engine.initGaps(difficulty.value);
    syncState();
  }

  regenerateGaps();
  watch(difficulty, () => regenerateGaps());
  watch(pauseMode, (val) => engine.setPauseMode(val));

  function onPlaybackTick(currentTimeMs: number, actions: PlaybackActions) {
    engine.tick(currentTimeMs, actions);
    syncState();
  }

  function submitAnswer(): boolean {
    const ok = engine.submitAnswer(currentInput.value);
    if (!ok) {
      inputHasError.value = true;
      setTimeout(() => {
        inputHasError.value = false;
      }, 600);
    } else {
      currentInput.value = "";
    }
    syncState();
    return ok;
  }

  function selectChoice(choice: string): boolean {
    currentInput.value = choice;
    const ok = engine.selectChoice(choice);
    syncState();
    return ok;
  }

  function giveHint() {
    engine.giveHint(gameMode.value === "choice");
    syncState();
  }

  return {
    gameMode,
    difficulty,
    pauseMode,
    score,
    streak,
    successCount,
    failCount,
    currentInput,
    inputHasError,
    gapIds,
    solvedGapIds,
    failedGapIds,
    hintLevel,
    currentHint,
    activeLine,
    activeWord,
    activeChoices,
    wrongChoices,
    onPlaybackTick,
    submitAnswer,
    selectChoice,
    giveHint,
  };
}
