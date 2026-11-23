export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

interface RequestRecord {
  timestamps: number[];
}

export class RateLimitGuard {
  private readonly clients: Map<string, RequestRecord> = new Map();
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(config: RateLimitConfig) {
    this.maxRequests = config.maxRequests;
    this.windowMs = config.windowMs;
  }

  public check(clientId: string, nowMs = Date.now()): { allowed: boolean; remaining: number } {
    let record = this.clients.get(clientId);
    if (!record) {
      record = { timestamps: [] };
      this.clients.set(clientId, record);
    }

    const windowStart = nowMs - this.windowMs;
    record.timestamps = record.timestamps.filter((t) => t > windowStart);

    if (record.timestamps.length >= this.maxRequests) {
      return { allowed: false, remaining: 0 };
    }

    record.timestamps.push(nowMs);
    const remaining = this.maxRequests - record.timestamps.length;
    return { allowed: true, remaining };
  }

  public reset(): void {
    this.clients.clear();
  }
}
