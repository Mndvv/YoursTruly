import type { LyricLineData, WordTokenData } from "@yourstruly/contracts";
import type { ActiveGapResolver } from "./ActiveGapResolver";
import type { AutoPauseController } from "./AutoPauseController";
import type { ChoiceDistractorGenerator } from "./ChoiceDistractorGenerator";

export class WordTransitionHelper {
  public activeWord: WordTokenData | null = null;
  public activeChoices: string[] = [];
  private lastCorrectTileIndex = -1;

  constructor(
    private readonly gapResolver: ActiveGapResolver,
    private readonly distractorGen: ChoiceDistractorGenerator,
    private readonly autoPauseCtrl: AutoPauseController,
    private readonly allWords: WordTokenData[],
  ) {}

  public transitionToWord(w: WordTokenData, onResetState: () => void): void {
    this.activeWord = w;
    onResetState();
    this.activeChoices = this.distractorGen.generateChoices(
      w,
      this.allWords,
      undefined,
      Math.random,
      this.lastCorrectTileIndex,
    );
    this.lastCorrectTileIndex = this.activeChoices.indexOf(w.text);
  }

  public advanceToNextGap(
    line: LyricLineData | null,
    gapIds: ReadonlySet<string>,
    isDone: (id: string) => boolean,
    onResetState: () => void,
  ): void {
    onResetState();
    const next = this.gapResolver.findTargetGap(line, gapIds, isDone);
    if (next) {
      this.transitionToWord(next, onResetState);
    } else {
      this.activeWord = null;
      this.activeChoices = [];
      if (line) this.autoPauseCtrl.markVerseCleared(line.id);
    }
  }

  public ensureTargetGap(
    line: LyricLineData,
    gapIds: ReadonlySet<string>,
    isDone: (id: string) => boolean,
    onResetState: () => void,
  ): void {
    const current = this.activeWord;
    if (current && !isDone(current.id) && line.words.some((w) => w.id === current.id)) {
      return;
    }
    const target = this.gapResolver.findTargetGap(line, gapIds, isDone);
    if (target) {
      this.transitionToWord(target, onResetState);
    } else {
      this.activeWord = null;
      this.activeChoices = [];
    }
  }

  public skipVerseGaps(
    unsolved: WordTokenData[],
    failedIds: Set<string>,
    onScoreFail: () => void,
    onAdvance: () => void,
  ): void {
    for (const g of unsolved) {
      failedIds.add(g.id);
      onScoreFail();
    }
    onAdvance();
  }

  public failWord(word: WordTokenData, failedIds: Set<string>, onAdvance: () => void): void {
    failedIds.add(word.id);
    this.autoPauseCtrl.markSolved(word.id);
    onAdvance();
  }

  public shouldFailStrict(consecutiveFails: number): boolean {
    return this.autoPauseCtrl.getPauseMode() === "strict" && consecutiveFails >= 3;
  }
}
