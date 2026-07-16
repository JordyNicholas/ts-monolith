import { env } from '@/shared/infra/env/index.js';
import { Argon2HashProvider } from './Argon2HashProvider.js';
import { BcryptHashProvider } from './BcryptHashProvider.js';
import { IHashProvider } from './HashProvider.interface.js';

export function getHashProvider(): IHashProvider {
  if (env.HASH_ALGORITHM === 'bcrypt') {
    return new BcryptHashProvider();
  }
  return new Argon2HashProvider();
}
