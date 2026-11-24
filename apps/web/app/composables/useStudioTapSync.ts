import type { LyricsData } from "@yourstruly/contracts";
import { LyricTimingShifter, TapSyncRecorder } from "@yourstruly/core";
import { type Ref, computed, ref } from "vue";

export function useStudioTapSync(lyricsData: Ref<LyricsData | null>) {
  const shifter = new LyricTimingShifter();
  const recorder = new TapSyncRecorder();
  const currentWordIndex = ref(0);

  const allWords = computed(() => {
    if (!lyricsData.value) return [];
    return lyricsData.value.lines.flatMap((line) => line.words);
  });

  const currentWord = computed(() => allWords.value[currentWordIndex.value] ?? null);

  const firstLyricStartMs = computed(() => {
    if (!lyricsData.value) return 0;
    return shifter.findFirstStartMs(lyricsData.value);
  });

  function recordTapDown(timeMs: number) {
    recorder.onTapDown(timeMs);
  }

  function recordTapUp(timeMs: number) {
    if (!lyricsData.value) return;
    const word = currentWord.value;
    if (!word) return;

    const interval = recorder.onTapUp(timeMs);
    const updated = lyricsData.value.lines.map((line) => ({
      ...line,
      words: line.words.map((w) =>
        w.id === word.id ? { ...w, startMs: interval.startMs, endMs: interval.endMs } : w,
      ),
    }));
    lyricsData.value = { ...lyricsData.value, lines: updated };
    currentWordIndex.value = Math.min(allWords.value.length, currentWordIndex.value + 1);
  }

  function toggleWordGap(wordId: string) {
    if (!lyricsData.value) return;
    const updated = lyricsData.value.lines.map((line) => ({
      ...line,
      words: line.words.map((w) =>
        w.id === wordId ? { ...w, isGapEligible: !w.isGapEligible } : w,
      ),
    }));
    lyricsData.value = { ...lyricsData.value, lines: updated };
  }

  function shiftAllLyrics(deltaMs: number) {
    if (!lyricsData.value) return;
    lyricsData.value = shifter.shiftAll(lyricsData.value, deltaMs);
  }

  function alignStartToTime(targetMs: number) {
    if (!lyricsData.value) return;
    lyricsData.value = shifter.alignStartToTime(lyricsData.value, targetMs);
  }

  return {
    allWords,
    currentWord,
    currentWordIndex,
    firstLyricStartMs,
    recordTapDown,
    recordTapUp,
    toggleWordGap,
    shiftAllLyrics,
    alignStartToTime,
  };
}
