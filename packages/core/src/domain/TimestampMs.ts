export class TimestampMs {
  private readonly value: number;

  constructor(value: number) {
    if (value < 0 || !Number.isFinite(value)) {
      throw new Error(`Invalid timestamp: ${value}. Must be a non-negative finite number.`);
    }
    this.value = Math.round(value);
  }

  public static from(value: number): TimestampMs {
    return new TimestampMs(value);
  }

  public getValue(): number {
    return this.value;
  }

  public add(deltaMs: number): TimestampMs {
    const next = Math.max(0, this.value + deltaMs);
    return new TimestampMs(next);
  }

  public isBefore(other: TimestampMs): boolean {
    return this.value < other.value;
  }

  public isAfter(other: TimestampMs): boolean {
    return this.value > other.value;
  }

  public isBetween(start: TimestampMs, end: TimestampMs): boolean {
    return this.value >= start.value && this.value <= end.value;
  }
}
