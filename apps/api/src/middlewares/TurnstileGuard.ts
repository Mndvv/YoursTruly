export interface TurnstileConfig {
  enabled: boolean;
  secretKey?: string;
  verifyEndpoint?: string;
}

export class TurnstileGuard {
  private readonly enabled: boolean;
  private readonly secretKey: string;
  private readonly endpoint: string;

  constructor(config: TurnstileConfig) {
    this.enabled = config.enabled;
    this.secretKey = config.secretKey ?? "";
    this.endpoint =
      config.verifyEndpoint ?? "https://challenges.cloudflare.com/turnstile/v0/siteverify";
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public async verify(token?: string, remoteIp?: string): Promise<boolean> {
    if (!this.enabled) {
      return true;
    }

    if (!token || !this.secretKey) {
      return false;
    }

    try {
      const body = new URLSearchParams({
        secret: this.secretKey,
        response: token,
      });
      if (remoteIp) body.append("remoteip", remoteIp);

      const response = await fetch(this.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      });

      if (!response.ok) return false;
      const data = (await response.json()) as { success: boolean };
      return Boolean(data.success);
    } catch {
      return false;
    }
  }
}
