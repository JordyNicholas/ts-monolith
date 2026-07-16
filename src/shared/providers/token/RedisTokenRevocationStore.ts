import { Redis } from 'ioredis';
import { env } from '@/shared/infra/env/index.js';
import { ITokenRevocationStore } from './TokenRevocationStore.interface.js';

let redis: Redis | undefined;

function getRedis(): Redis {
  if (!redis) {
    redis = new Redis(env.REDIS_URL);
  }
  return redis;
}

export class RedisTokenRevocationStore implements ITokenRevocationStore {
  public async revoke(jti: string, expiresAtMs: number): Promise<void> {
    const ttlSeconds = Math.max(1, Math.ceil((expiresAtMs - Date.now()) / 1000));
    await getRedis().set(`revoked:${jti}`, '1', 'EX', ttlSeconds);
  }

  public async isRevoked(jti: string): Promise<boolean> {
    const value = await getRedis().get(`revoked:${jti}`);
    return value === '1';
  }
}
