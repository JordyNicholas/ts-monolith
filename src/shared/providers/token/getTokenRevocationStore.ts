import { env } from '@/shared/infra/env/index.js';
import { inMemoryTokenRevocationStore } from './InMemoryTokenRevocationStore.js';
import { RedisTokenRevocationStore } from './RedisTokenRevocationStore.js';
import { ITokenRevocationStore } from './TokenRevocationStore.interface.js';

export function getTokenRevocationStore(): ITokenRevocationStore {
  if (env.TOKEN_REVOCATION_DRIVER === 'redis') {
    return new RedisTokenRevocationStore();
  }
  return inMemoryTokenRevocationStore;
}
