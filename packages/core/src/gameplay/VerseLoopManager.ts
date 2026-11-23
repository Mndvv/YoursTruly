import type { LyricLineData, WordTokenData } from "@yourstruly/contracts";
import type { ActiveGapResolver } from "./ActiveGapResolver";
import type { AutoPauseController, PauseMode, VerseRewindTrigger } from "./AutoPauseController";

export interface PlaybackActions {
  onAutoPause?: () => void;
  onRewindVerse?: (toMs: number) => void;
  onSkipVerse?: () => void;
}

export interface EngineConfig {
  pauseMode?: PauseMode;
  ignoreSymbols?: boolean;
  debounceDoubleLetters?: boolean;
}

export interface VerseLoopResult {
  rewind: VerseRewindTrigger;
  unsolvedGaps: WordTokenData[];
  shouldSkip: boolean;
}

export class VerseLoopManager {
  constructor(
    private readonly autoPauseCtrl: AutoPauseController,
    private readonly gapResolver: ActiveGapResolver,
  ) {}

  public evaluate(
    line: LyricLineData,
    timeMs: number,
    gapIds: ReadonlySet<string>,
    isDone: (id: string) => boolean,
  ): VerseLoopResult | null {
    const unsolved = this.gapResolver.getUnsolvedGaps(line, gapIds, isDone);
    const rewind = this.autoPauseCtrl.checkVerseRewind({
      lineId: line.id,
      lineStartMs: line.startMs,
      lineEndMs: line.endMs,
      unsolvedGapCount: unsolved.length,
      currentTimeMs: timeMs,
    });
    if (!rewind) return null;
    return { rewind, unsolvedGaps: unsolved, shouldSkip: rewind.shouldSkipVerse };
  }

  public handleVerse(
    line: LyricLineData,
    timeMs: number,
    gapIds: ReadonlySet<string>,
    isDone: (id: string) => boolean,
    actions: PlaybackActions,
    onSkip: (gaps: WordTokenData[]) => void,
    onRewind: (first: WordTokenData | null) => void,
  ): boolean {
    const res = this.evaluate(line, timeMs, gapIds, isDone);
    if (!res) return false;
    if (res.shouldSkip) {
      onSkip(res.unsolvedGaps);
      actions.onSkipVerse?.();
      return true;
    }
    actions.onRewindVerse?.(res.rewind.rewindToMs);
    const first = this.gapResolver.findTargetGap(line, gapIds, isDone);
    onRewind(first);
    return true;
  }

  public checkStrictPause(
    word: WordTokenData | null,
    gapIds: ReadonlySet<string>,
    isDone: (id: string) => boolean,
    effectiveMs: number,
    onAutoPause?: () => void,
  ): void {
    if (!word || !gapIds.has(word.id) || isDone(word.id)) return;
    if (this.autoPauseCtrl.checkWordAutoPause(word, true, false, effectiveMs)) {
      onAutoPause?.();
    }
  }
}
