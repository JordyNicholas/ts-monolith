import { JwtTokenProvider } from '@/shared/providers/token/JwtTokenProvider.js';
import { getTokenRevocationStore } from '@/shared/providers/token/getTokenRevocationStore.js';
import { RefreshTokenService } from '../services/refreshToken.service.js';

export function makeRefreshTokenService(): RefreshTokenService {
  return new RefreshTokenService(
    new JwtTokenProvider(getTokenRevocationStore()),
    getTokenRevocationStore(),
  );
}
