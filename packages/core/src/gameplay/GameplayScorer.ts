export class GameplayScorer {
  private score = 0;
  private streak = 0;
  private successes = 0;
  private failures = 0;

  public getScore(): number {
    return this.score;
  }

  public getStreak(): number {
    return this.streak;
  }

  public getSuccessCount(): number {
    return this.successes;
  }

  public getFailCount(): number {
    return this.failures;
  }

  public recordSuccess(): number {
    const gain = 10 + this.streak * 2;
    this.score += gain;
    this.streak += 1;
    this.successes += 1;
    return gain;
  }

  public recordFailure(): void {
    this.streak = 0;
    this.failures += 1;
  }

  public getAccuracyPercent(): number {
    const total = this.successes + this.failures;
    if (total === 0) return 100;
    return Math.round((this.successes / total) * 100);
  }

  public reset(): void {
    this.score = 0;
    this.streak = 0;
    this.successes = 0;
    this.failures = 0;
  }
}
