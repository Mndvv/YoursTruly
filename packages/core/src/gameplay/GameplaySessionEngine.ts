import type { LyricLineData, SongDetailDto, WordTokenData } from "@yourstruly/contracts";
import { SyncClockEngine } from "../sync/SyncClockEngine";
import { ActiveGapResolver } from "./ActiveGapResolver";
import { AnswerValidator } from "./AnswerValidator";
import { AutoPauseController, type PauseMode } from "./AutoPauseController";
import { ChoiceDistractorGenerator } from "./ChoiceDistractorGenerator";
import { GameplayScorer } from "./GameplayScorer";
import type { DifficultyLevel } from "./GapGenerator";
import { GapGenerator } from "./GapGenerator";
import { VerseLoopManager } from "./VerseLoopManager";
import { WordHintHelper } from "./WordHintHelper";

export interface PlaybackActions {
  onAutoPause?: () => void;
  onRewindVerse?: (toMs: number) => void;
  onSkipVerse?: () => void;
}

export class GameplaySessionEngine {
  private readonly allWords: WordTokenData[];
  private readonly scorer = new GameplayScorer();
  private readonly validator = new AnswerValidator();
  private readonly autoPauseCtrl = new AutoPauseController();
  private readonly distractorGen = new ChoiceDistractorGenerator();
  private readonly hintHelper = new WordHintHelper();
  private readonly clock = new SyncClockEngine();
  private readonly gapResolver = new ActiveGapResolver();
  private readonly verseLoop: VerseLoopManager;
  private ignoreSymbols = true;

  public readonly gapIds = new Set<string>();
  public readonly solvedGapIds = new Set<string>();
  public readonly failedGapIds = new Set<string>();
  public readonly wrongChoices = new Set<string>();
  public activeLine: LyricLineData | null = null;
  public activeWord: WordTokenData | null = null;
  public activeChoices: string[] = [];
  public currentHint: string | null = null;
  public hintLevel = 0;
  public consecutiveFails = 0;

  constructor(
    private readonly song: SongDetailDto,
    pauseMode: PauseMode = "verse_loop",
  ) {
    this.allWords = song.lyricsData.lines.flatMap((l) => l.words);
    this.autoPauseCtrl.setPauseMode(pauseMode);
    this.verseLoop = new VerseLoopManager(this.autoPauseCtrl, this.gapResolver);
  }

  public initGaps(difficulty: DifficultyLevel): void {
    this.gapIds.clear();
    for (const g of new GapGenerator().generateGaps(this.allWords, difficulty)) this.gapIds.add(g);
    this.solvedGapIds.clear();
    this.failedGapIds.clear();
    this.scorer.reset();
    this.resetWordState();
  }

  public configure(opts: { pauseMode?: PauseMode; ignoreSymbols?: boolean }): void {
    if (opts.pauseMode) this.autoPauseCtrl.setPauseMode(opts.pauseMode);
    if (opts.ignoreSymbols !== undefined) this.ignoreSymbols = opts.ignoreSymbols;
  }

  public tick(currentTimeMs: number, actions: PlaybackActions): void {
    const lines = this.song.lyricsData.lines;
    const state = this.clock.resolveState(lines, currentTimeMs, this.song.globalOffsetMs);
    this.activeLine = (state.activeLine as LyricLineData | null) ?? null;
    if (!this.activeLine) {
      this.activeWord = null;
      this.activeChoices = [];
      return;
    }
    if (this.handleVerse(this.activeLine, state.effectiveTimeMs, actions)) return;
    this.ensureTargetGap(this.activeLine);
    this.checkStrictPause(state.effectiveTimeMs, actions.onAutoPause);
  }

  public submitAnswer(input: string, isAutoCheck = false): boolean {
    if (!this.activeWord) return false;
    const word = this.activeWord;
    const ok = this.validator.validate(input, word.text, {
      ignoreApostrophes: this.ignoreSymbols,
      stripPunctuation: this.ignoreSymbols,
    });
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
    } else {
      this.hintLevel += 1;
      this.currentHint = this.hintHelper.getLetterHint(text, this.hintLevel);
      if (this.hintHelper.isFullyRevealed(text, this.hintLevel)) {
        this.failedGapIds.add(this.activeWord.id);
        this.scorer.recordFailure();
        this.autoPauseCtrl.markSolved(this.activeWord.id);
        this.advanceToNextGap();
      }
    }
  }

  public getScorer(): GameplayScorer {
    return this.scorer;
  }

  private isDone = (id: string): boolean => this.solvedGapIds.has(id) || this.failedGapIds.has(id);

  private resetWordState(): void {
    this.hintLevel = 0;
    this.currentHint = null;
    this.wrongChoices.clear();
    this.consecutiveFails = 0;
  }

  private handleVerse(line: LyricLineData, timeMs: number, actions: PlaybackActions): boolean {
    const res = this.verseLoop.evaluate(line, timeMs, this.gapIds, this.isDone);
    if (!res) return false;
    if (res.shouldSkip) {
      for (const g of res.unsolvedGaps) {
        this.failedGapIds.add(g.id);
        this.scorer.recordFailure();
      }
      this.advanceToNextGap();
      actions.onSkipVerse?.();
    } else {
      actions.onRewindVerse?.(res.rewind.rewindToMs);
      const first = this.gapResolver.findTargetGap(line, this.gapIds, this.isDone);
      if (first) this.transitionToWord(first);
    }
    return true;
  }

  private ensureTargetGap(line: LyricLineData): void {
    const ok =
      this.activeWord &&
      !this.isDone(this.activeWord.id) &&
      line.words.some((w) => w.id === this.activeWord?.id);
    if (ok) return;
    const target = this.gapResolver.findTargetGap(line, this.gapIds, this.isDone);
    if (target) this.transitionToWord(target);
    else {
      this.activeWord = null;
      this.activeChoices = [];
    }
  }

  private checkStrictPause(effectiveMs: number, onAutoPause?: () => void): void {
    if (!this.activeWord || !this.gapIds.has(this.activeWord.id) || this.isDone(this.activeWord.id))
      return;
    if (this.autoPauseCtrl.checkWordAutoPause(this.activeWord, true, false, effectiveMs))
      onAutoPause?.();
  }

  private handleFailure(word: WordTokenData): boolean {
    this.consecutiveFails += 1;
    this.scorer.recordFailure();
    if (this.autoPauseCtrl.getPauseMode() !== "strict" || this.consecutiveFails < 3) return false;
    this.failedGapIds.add(word.id);
    this.autoPauseCtrl.markSolved(word.id);
    this.advanceToNextGap();
    return true;
  }

  private transitionToWord(w: WordTokenData): void {
    this.activeWord = w;
    this.resetWordState();
    this.activeChoices = this.distractorGen.generateChoices(w, this.allWords);
  }

  private advanceToNextGap(): void {
    this.resetWordState();
    const next = this.gapResolver.findTargetGap(this.activeLine, this.gapIds, this.isDone);
    if (next) this.transitionToWord(next);
    else {
      this.activeWord = null;
      this.activeChoices = [];
      if (this.activeLine) this.autoPauseCtrl.markVerseCleared(this.activeLine.id);
    }
  }
}
