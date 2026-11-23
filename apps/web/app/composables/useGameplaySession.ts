import type { LyricLineData, SongDetailDto, WordTokenData } from "@yourstruly/contracts";
import {
  AnswerValidator,
  AutoPauseController,
  ChoiceDistractorGenerator,
  type DifficultyLevel,
  GapGenerator,
  type WordToken,
} from "@yourstruly/core";
import { computed, ref, watch } from "vue";

export function useGameplaySession(song: SongDetailDto) {
  const gameMode = ref<"write" | "choice">("write");
  const difficulty = ref<DifficultyLevel>("intermediate");
  const autoPause = ref(true);

  const score = ref(0);
  const streak = ref(0);
  const currentInput = ref("");
  const solvedGapIds = ref<Set<string>>(new Set());

  const gapGenerator = new GapGenerator();
  const validator = new AnswerValidator();
  const autoPauseCtrl = new AutoPauseController(autoPause.value);
  const distractorGen = new ChoiceDistractorGenerator();

  const domainLines = computed(() => song.lyricsData.lines);
  const allWords = computed(() => song.lyricsData.lines.flatMap((l) => l.words));
  const gapIds = ref<Set<string>>(new Set());

  function regenerateGaps() {
    gapIds.value = gapGenerator.generateGaps(allWords.value, difficulty.value);
    solvedGapIds.value.clear();
  }

  regenerateGaps();
  watch(difficulty, () => regenerateGaps());
  watch(autoPause, (val) => autoPauseCtrl.setEnabled(val));

  const activeLine = ref<LyricLineData | null>(null);
  const activeWord = ref<WordTokenData | null>(null);
  const activeChoices = ref<string[]>([]);

  function onPlaybackTick(currentTimeMs: number, onAutoPauseTrigger?: () => void) {
    const effectiveMs = currentTimeMs + song.globalOffsetMs;
    const currentLine = domainLines.value.find(
      (l) =>
        l.startMs !== null &&
        l.endMs !== null &&
        effectiveMs >= l.startMs &&
        effectiveMs <= l.endMs,
    );
    activeLine.value = currentLine ?? null;

    if (!currentLine) {
      activeWord.value = null;
      activeChoices.value = [];
      return;
    }

    const currentW = currentLine.words.find(
      (w) =>
        w.startMs !== null &&
        w.endMs !== null &&
        effectiveMs >= w.startMs &&
        effectiveMs <= w.endMs,
    );
    activeWord.value = currentW ?? null;

    if (currentW) {
      handleWordTick(currentW, effectiveMs, onAutoPauseTrigger);
    }
  }

  function handleWordTick(word: WordTokenData, effectiveMs: number, onAutoPause?: () => void) {
    const isGap = gapIds.value.has(word.id);
    const isSolved = solvedGapIds.value.has(word.id);

    if (isGap && !isSolved && gameMode.value === "choice" && activeChoices.value.length === 0) {
      activeChoices.value = distractorGen.generateChoices(word, allWords.value);
    }

    const trigger = autoPauseCtrl.checkAutoPause(word, isGap, isSolved, effectiveMs);
    if (trigger && onAutoPause) {
      onAutoPause();
    }
  }

  function submitAnswer(): boolean {
    if (!activeWord.value) return false;
    const isCorrect = validator.validate(currentInput.value, activeWord.value.text);

    if (isCorrect) {
      solvedGapIds.value.add(activeWord.value.id);
      autoPauseCtrl.markSolved(activeWord.value.id);
      score.value += 10 + streak.value * 2;
      streak.value += 1;
      currentInput.value = "";
      return true;
    }

    streak.value = 0;
    return false;
  }

  function selectChoice(choice: string): boolean {
    currentInput.value = choice;
    return submitAnswer();
  }

  return {
    gameMode,
    difficulty,
    autoPause,
    score,
    streak,
    currentInput,
    gapIds,
    solvedGapIds,
    activeLine,
    activeWord,
    activeChoices,
    onPlaybackTick,
    submitAnswer,
    selectChoice,
  };
}
