import { ITokenRevocationStore } from './TokenRevocationStore.interface.js';

export class InMemoryTokenRevocationStore implements ITokenRevocationStore {
  private readonly revoked = new Map<string, number>();

  public async revoke(jti: string, expiresAtMs: number): Promise<void> {
    this.revoked.set(jti, expiresAtMs);
    this.cleanup();
  }

  public async isRevoked(jti: string): Promise<boolean> {
    this.cleanup();
    return this.revoked.has(jti);
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [jti, expiresAt] of this.revoked.entries()) {
      if (expiresAt <= now) {
        this.revoked.delete(jti);
      }
    }
  }
}

export const inMemoryTokenRevocationStore = new InMemoryTokenRevocationStore();
