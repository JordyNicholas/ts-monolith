import { JwtTokenProvider } from '@/shared/providers/token/JwtTokenProvider.js';
import { getTokenRevocationStore } from '@/shared/providers/token/getTokenRevocationStore.js';
import { LogoutService } from '../services/logout.service.js';

export function makeLogoutService(): LogoutService {
  return new LogoutService(
    new JwtTokenProvider(getTokenRevocationStore()),
    getTokenRevocationStore(),
  );
}
