import type { LyricLineData, SongDetailDto, WordTokenData } from "@yourstruly/contracts";
import {
  AnswerValidator,
  AutoPauseController,
  ChoiceDistractorGenerator,
  type DifficultyLevel,
  GameplayScorer,
  GapGenerator,
  type PauseMode,
  SyncClockEngine,
  WordHintHelper,
} from "@yourstruly/core";
import { computed, ref, watch } from "vue";

export function useGameplaySession(song: SongDetailDto) {
  const gameMode = ref<"write" | "choice">("write");
  const difficulty = ref<DifficultyLevel>("intermediate");
  const pauseMode = ref<PauseMode>("verse_loop");

  const scorer = new GameplayScorer();
  const score = ref(0);
  const streak = ref(0);
  const successCount = ref(0);
  const failCount = ref(0);
  const currentInput = ref("");
  const inputHasError = ref(false);
  const solvedGapIds = ref<Set<string>>(new Set());
  const failedGapIds = ref<Set<string>>(new Set());
  const hintLevel = ref(0);
  const currentHint = ref<string | null>(null);

  const gapGenerator = new GapGenerator();
  const validator = new AnswerValidator();
  const autoPauseCtrl = new AutoPauseController(pauseMode.value);
  const distractorGen = new ChoiceDistractorGenerator();
  const hintHelper = new WordHintHelper();
  const clock = new SyncClockEngine();

  const domainLines = computed(() => song.lyricsData.lines);
  const allWords = computed(() => song.lyricsData.lines.flatMap((l) => l.words));
  const gapIds = ref<Set<string>>(new Set());

  const syncStats = () => {
    score.value = scorer.getScore();
    streak.value = scorer.getStreak();
    successCount.value = scorer.getSuccessCount();
    failCount.value = scorer.getFailCount();
  };

  function regenerateGaps() {
    gapIds.value = gapGenerator.generateGaps(allWords.value, difficulty.value);
    solvedGapIds.value.clear();
    failedGapIds.value.clear();
    scorer.reset();
    syncStats();
    hintLevel.value = 0;
    currentHint.value = null;
  }

  regenerateGaps();
  watch(difficulty, () => regenerateGaps());
  watch(pauseMode, (val) => autoPauseCtrl.setPauseMode(val));

  const activeLine = ref<LyricLineData | null>(null);
  const activeWord = ref<WordTokenData | null>(null);
  const activeChoices = ref<string[]>([]);
  const wrongChoices = ref<Set<string>>(new Set());

  const isDone = (id: string) => solvedGapIds.value.has(id) || failedGapIds.value.has(id);

  function handleWordTransition(newWord: WordTokenData) {
    activeWord.value = newWord;
    wrongChoices.value.clear();
    hintLevel.value = 0;
    currentHint.value = null;
    if (gapIds.value.has(newWord.id) && !isDone(newWord.id) && gameMode.value === "choice") {
      activeChoices.value = distractorGen.generateChoices(newWord, allWords.value);
    }
  }

  function checkVerseRewind(line: LyricLineData, timeMs: number, onRewind?: (ms: number) => void) {
    const unsolved = line.words.filter((w) => gapIds.value.has(w.id) && !isDone(w.id)).length;
    const res = autoPauseCtrl.checkVerseRewind(line.id, line.startMs, line.endMs, unsolved, timeMs);
    if (res && onRewind) {
      onRewind(res.rewindToMs);
      return true;
    }
    return false;
  }

  function onPlaybackTick(
    currentTimeMs: number,
    actions: { onAutoPause?: () => void; onRewindVerse?: (toMs: number) => void },
  ) {
    const state = clock.resolveState(domainLines.value, currentTimeMs, song.globalOffsetMs);
    activeLine.value = (state.activeLine as LyricLineData | null) ?? null;
    if (!activeLine.value) {
      activeWord.value = null;
      activeChoices.value = [];
      return;
    }
    if (checkVerseRewind(activeLine.value, state.effectiveTimeMs, actions.onRewindVerse)) return;

    const currentW = (state.activeWord as WordTokenData | null) ?? null;
    if (currentW && currentW.id !== activeWord.value?.id) handleWordTransition(currentW);

    if (activeWord.value) {
      const isGap = gapIds.value.has(activeWord.value.id);
      const pause = autoPauseCtrl.checkWordAutoPause(
        activeWord.value,
        isGap,
        isDone(activeWord.value.id),
        state.effectiveTimeMs,
      );
      if (pause && actions.onAutoPause) actions.onAutoPause();
    }
  }

  function submitAnswer(): boolean {
    if (!activeWord.value) return false;
    const ok = validator.validate(currentInput.value, activeWord.value.text);
    if (!ok) {
      inputHasError.value = true;
      scorer.recordFailure();
      syncStats();
      setTimeout(() => {
        inputHasError.value = false;
      }, 600);
      return false;
    }
    inputHasError.value = false;
    solvedGapIds.value.add(activeWord.value.id);
    autoPauseCtrl.markSolved(activeWord.value.id);
    scorer.recordSuccess();
    syncStats();
    currentInput.value = "";
    hintLevel.value = 0;
    currentHint.value = null;
    return true;
  }

  function selectChoice(choice: string): boolean {
    currentInput.value = choice;
    const solved = submitAnswer();
    if (!solved) wrongChoices.value.add(choice);
    return solved;
  }

  function giveHint() {
    if (!activeWord.value) return;
    const text = activeWord.value.text;
    if (gameMode.value === "choice") {
      activeChoices.value = hintHelper.get5050Choices(text, activeChoices.value);
    } else {
      hintLevel.value += 1;
      currentHint.value = hintHelper.getLetterHint(text, hintLevel.value);
      if (hintHelper.isFullyRevealed(text, hintLevel.value)) {
        failedGapIds.value.add(activeWord.value.id);
        scorer.recordFailure();
        syncStats();
        autoPauseCtrl.markSolved(activeWord.value.id);
      }
    }
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
