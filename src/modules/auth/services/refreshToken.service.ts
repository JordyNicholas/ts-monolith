import { UnauthorizedError } from '@/shared/core/errors/UnauthorizedError.js';
import { ITokenProvider } from '@/shared/providers/token/TokenProvider.interface.js';
import { ITokenRevocationStore } from '@/shared/providers/token/TokenRevocationStore.interface.js';

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export class RefreshTokenService {
  constructor(
    private readonly tokenProvider: ITokenProvider,
    private readonly revocationStore: ITokenRevocationStore,
  ) {}

  public async execute({ refreshToken }: RefreshTokenRequest): Promise<RefreshTokenResponse> {
    const payload = await this.tokenProvider.verifyRefresh(refreshToken);

    if (payload.jti) {
      const expiresAtMs = Date.now() + 7 * 24 * 60 * 60 * 1000;
      await this.revocationStore.revoke(payload.jti, expiresAtMs);
    }

    const tokenPayload = {
      tenantId: payload.tenantId,
      ...(payload.role !== undefined ? { role: payload.role } : {}),
    };

    const accessToken = await this.tokenProvider.signAccess(tokenPayload, payload.sub);
    const newRefreshToken = await this.tokenProvider.signRefresh(tokenPayload, payload.sub);

    return { accessToken, refreshToken: newRefreshToken };
  }
}
