export interface ITokenRevocationStore {
  revoke(jti: string, expiresAtMs: number): Promise<void>;
  isRevoked(jti: string): Promise<boolean>;
}
