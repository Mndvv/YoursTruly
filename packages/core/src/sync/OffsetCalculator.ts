export class OffsetCalculator {
  public applyOffset(timeMs: number, offsetMs: number): number {
    return Math.max(0, Math.round(timeMs + offsetMs));
  }

  public clampTime(timeMs: number, minMs: number, maxMs: number | null): number {
    const clampedMin = Math.max(minMs, timeMs);
    if (maxMs !== null) {
      return Math.min(clampedMin, maxMs);
    }
    return clampedMin;
  }

  public isValidTimeRange(startMs: number, endMs: number | null): boolean {
    if (startMs < 0) return false;
    if (endMs === null) return true;
    return endMs > startMs;
  }
}
