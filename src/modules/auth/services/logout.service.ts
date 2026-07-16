import { UnauthorizedError } from '@/shared/core/errors/UnauthorizedError.js';
import { ITokenProvider } from '@/shared/providers/token/TokenProvider.interface.js';
import { ITokenRevocationStore } from '@/shared/providers/token/TokenRevocationStore.interface.js';

export interface LogoutRequest {
  accessToken: string;
  refreshToken?: string;
}

export class LogoutService {
  constructor(
    private readonly tokenProvider: ITokenProvider,
    private readonly revocationStore: ITokenRevocationStore,
  ) {}

  public async execute({ accessToken, refreshToken }: LogoutRequest): Promise<void> {
    try {
      const accessPayload = await this.tokenProvider.verifyAccess(accessToken);
      if (accessPayload.jti) {
        await this.revocationStore.revoke(accessPayload.jti, Date.now() + 15 * 60 * 1000);
      }
    } catch {
      throw new UnauthorizedError('Invalid access token');
    }

    if (refreshToken) {
      try {
        const refreshPayload = await this.tokenProvider.verifyRefresh(refreshToken);
        if (refreshPayload.jti) {
          await this.revocationStore.revoke(
            refreshPayload.jti,
            Date.now() + 7 * 24 * 60 * 60 * 1000,
          );
        }
      } catch {
        // Refresh token may already be expired; access revocation is enough for logout.
      }
    }
  }
}
