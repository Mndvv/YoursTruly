import type {
  DifficultyLevel,
  LyricLineData,
  PauseMode,
  SongDetailDto,
  WordTokenData,
} from "@yourstruly/contracts";
import { SyncClockEngine } from "../sync/SyncClockEngine";
import { ActiveGapResolver } from "./ActiveGapResolver";
import { AnswerValidator, type ValidationOptions } from "./AnswerValidator";
import { AutoPauseController } from "./AutoPauseController";
import { ChoiceDistractorGenerator } from "./ChoiceDistractorGenerator";
import { GameplayScorer } from "./GameplayScorer";
import { GapGenerator } from "./GapGenerator";
import type { EngineConfig, PlaybackActions } from "./VerseLoopManager";
import { VerseLoopManager } from "./VerseLoopManager";
import { WordHintHelper } from "./WordHintHelper";
import { WordTransitionHelper } from "./WordTransitionHelper";

export class GameplaySessionEngine {
  private readonly allWords: WordTokenData[];
  private readonly scorer = new GameplayScorer();
  private readonly validator = new AnswerValidator();
  private readonly autoPauseCtrl = new AutoPauseController();
  private readonly hintHelper = new WordHintHelper();
  private readonly clock = new SyncClockEngine();
  private readonly gapResolver = new ActiveGapResolver();
  private readonly verseLoop: VerseLoopManager;
  private readonly transitions: WordTransitionHelper;
  private ignoreSymbols = true;
  private debounceDoubleLetters = true;

  public readonly gapIds = new Set<string>();
  public readonly solvedGapIds = new Set<string>();
  public readonly failedGapIds = new Set<string>();
  public readonly wrongChoices = new Set<string>();
  public activeLine: LyricLineData | null = null;
  public currentHint: string | null = null;
  public hintLevel = 0;
  public consecutiveFails = 0;

  public get activeWord(): WordTokenData | null {
    return this.transitions.activeWord;
  }
  public get activeChoices(): string[] {
    return this.transitions.activeChoices;
  }
  public set activeChoices(val: string[]) {
    this.transitions.activeChoices = val;
  }

  constructor(
    public readonly song: SongDetailDto,
    pauseMode: PauseMode = "verse_loop",
  ) {
    this.allWords = song.lyricsData.lines.flatMap((l) => l.words);
    this.autoPauseCtrl.setPauseMode(pauseMode);
    this.verseLoop = new VerseLoopManager(this.autoPauseCtrl, this.gapResolver);
    this.transitions = new WordTransitionHelper(
      this.gapResolver,
      new ChoiceDistractorGenerator(),
      this.autoPauseCtrl,
      this.allWords,
    );
  }

  public initGaps(difficulty: DifficultyLevel): void {
    this.gapIds.clear();
    for (const g of new GapGenerator().generateGaps(this.allWords, difficulty)) this.gapIds.add(g);
    this.solvedGapIds.clear();
    this.failedGapIds.clear();
    this.scorer.reset();
    this.resetWordState();
  }

  public configure(opts: EngineConfig): void {
    if (opts.pauseMode) this.autoPauseCtrl.setPauseMode(opts.pauseMode);
    if (opts.ignoreSymbols !== undefined) this.ignoreSymbols = opts.ignoreSymbols;
    if (opts.debounceDoubleLetters !== undefined) {
      this.debounceDoubleLetters = opts.debounceDoubleLetters;
    }
  }

  public tick(currentTimeMs: number, actions: PlaybackActions): void {
    const lines = this.song.lyricsData.lines;
    const state = this.clock.resolveState(lines, currentTimeMs, this.song.globalOffsetMs);
    this.activeLine = (state.activeLine as LyricLineData | null) ?? null;
    if (!this.activeLine) {
      this.transitions.activeWord = null;
      this.transitions.activeChoices = [];
      return;
    }
    const handled = this.verseLoop.handleVerse(
      this.activeLine,
      state.effectiveTimeMs,
      this.gapIds,
      this.isDone,
      actions,
      (unsolved) => this.skipVerseGaps(unsolved),
      (first) => first && this.transitions.transitionToWord(first, () => this.resetWordState()),
    );
    if (handled) return;
    this.transitions.ensureTargetGap(this.activeLine, this.gapIds, this.isDone, () =>
      this.resetWordState(),
    );
    this.verseLoop.checkStrictPause(
      this.activeWord,
      this.gapIds,
      this.isDone,
      state.effectiveTimeMs,
      actions.onAutoPause,
    );
  }

  public submitAnswer(input: string, isAutoCheck = false): boolean {
    if (!this.activeWord) return false;
    const word = this.activeWord;
    const ok = this.validator.validate(input, word.text, this.validationOpts);
    if (!ok) return isAutoCheck ? false : this.handleFailure(word);
    this.consecutiveFails = 0;
    this.solvedGapIds.add(word.id);
    this.autoPauseCtrl.markSolved(word.id);
    this.scorer.recordSuccess();
    this.advanceToNextGap();
    return true;
  }

  public selectChoice(choice: string): boolean {
    const ok = this.submitAnswer(choice, false);
    if (!ok) this.wrongChoices.add(choice);
    return ok;
  }

  public giveHint(isChoiceMode: boolean): void {
    if (!this.activeWord) return;
    const text = this.activeWord.text;
    if (isChoiceMode) {
      this.activeChoices = this.hintHelper.get5050Choices(text, this.activeChoices);
      return;
    }
    this.hintLevel += 1;
    this.currentHint = this.hintHelper.getLetterHint(text, this.hintLevel);
    if (this.hintHelper.isFullyRevealed(text, this.hintLevel)) {
      this.scorer.recordFailure();
      this.failWord(this.activeWord);
    }
  }

  public getScorer(): GameplayScorer {
    return this.scorer;
  }

  private get validationOpts(): ValidationOptions {
    return {
      ignoreApostrophes: this.ignoreSymbols,
      stripPunctuation: this.ignoreSymbols,
      debounceDoubleLetters: this.debounceDoubleLetters,
    };
  }

  private isDone = (id: string): boolean => this.solvedGapIds.has(id) || this.failedGapIds.has(id);

  private resetWordState(): void {
    this.hintLevel = 0;
    this.currentHint = null;
    this.wrongChoices.clear();
    this.consecutiveFails = 0;
  }

  private advanceToNextGap(): void {
    this.transitions.advanceToNextGap(this.activeLine, this.gapIds, this.isDone, () =>
      this.resetWordState(),
    );
  }

  private skipVerseGaps(unsolved: WordTokenData[]): void {
    for (const g of unsolved) {
      this.failedGapIds.add(g.id);
      this.scorer.recordFailure();
    }
    this.advanceToNextGap();
  }

  private failWord(word: WordTokenData): void {
    this.failedGapIds.add(word.id);
    this.autoPauseCtrl.markSolved(word.id);
    this.advanceToNextGap();
  }

  private handleFailure(word: WordTokenData): boolean {
    this.consecutiveFails += 1;
    this.scorer.recordFailure();
    if (this.autoPauseCtrl.getPauseMode() !== "strict" || this.consecutiveFails < 3) return false;
    this.failWord(word);
    return true;
  }
}
