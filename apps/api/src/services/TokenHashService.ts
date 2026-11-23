import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

export class TokenHashService {
  public generateToken(): string {
    return randomBytes(24).toString("hex");
  }

  public hashToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
  }

  public verifyToken(token: string, expectedHash: string): boolean {
    const candidateHash = this.hashToken(token);
    const candidateBuf = Buffer.from(candidateHash, "hex");
    const expectedBuf = Buffer.from(expectedHash, "hex");

    if (candidateBuf.length !== expectedBuf.length) {
      return false;
    }

    return timingSafeEqual(candidateBuf, expectedBuf);
  }
}
