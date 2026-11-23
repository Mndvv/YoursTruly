import type { LyricLineData, WordTokenData } from "@yourstruly/contracts";

export class ActiveGapResolver {
  public findTargetGap(
    line: LyricLineData | null,
    gapIds: ReadonlySet<string>,
    isDone: (wordId: string) => boolean,
  ): WordTokenData | null {
    if (!line) return null;
    return line.words.find((w) => gapIds.has(w.id) && !isDone(w.id)) ?? null;
  }

  public getUnsolvedGaps(
    line: LyricLineData | null,
    gapIds: ReadonlySet<string>,
    isDone: (wordId: string) => boolean,
  ): WordTokenData[] {
    if (!line) return [];
    return line.words.filter((w) => gapIds.has(w.id) && !isDone(w.id));
  }

  public findNextUpcomingGap(
    lines: readonly LyricLineData[],
    currentLineIndex: number,
    gapIds: ReadonlySet<string>,
    isDone: (wordId: string) => boolean,
  ): WordTokenData | null {
    for (let i = currentLineIndex; i < lines.length; i++) {
      const gap = this.findTargetGap(lines[i], gapIds, isDone);
      if (gap) return gap;
    }
    return null;
  }
}
