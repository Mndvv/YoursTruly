import type { LyricLineData, WordTokenData } from "@yourstruly/contracts";
import type { ActiveGapResolver } from "./ActiveGapResolver";
import type { AutoPauseController } from "./AutoPauseController";
import type { ChoiceDistractorGenerator } from "./ChoiceDistractorGenerator";

export class WordTransitionHelper {
  public activeWord: WordTokenData | null = null;
  public activeChoices: string[] = [];

  constructor(
    private readonly gapResolver: ActiveGapResolver,
    private readonly distractorGen: ChoiceDistractorGenerator,
    private readonly autoPauseCtrl: AutoPauseController,
    private readonly allWords: WordTokenData[],
  ) {}

  public transitionToWord(w: WordTokenData, onResetState: () => void): void {
    this.activeWord = w;
    onResetState();
    this.activeChoices = this.distractorGen.generateChoices(w, this.allWords);
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
}
