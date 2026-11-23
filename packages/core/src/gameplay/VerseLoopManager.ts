import type { LyricLineData, WordTokenData } from "@yourstruly/contracts";
import type { ActiveGapResolver } from "./ActiveGapResolver";
import type { AutoPauseController, VerseRewindTrigger } from "./AutoPauseController";

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
}
