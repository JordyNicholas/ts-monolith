import argon2 from 'argon2';
import { IHashProvider } from './HashProvider.interface.js';

export class Argon2HashProvider implements IHashProvider {
  async hash(payload: string): Promise<string> {
    return argon2.hash(payload, { type: argon2.argon2id });
  }

  async compare(payload: string, hashed: string): Promise<boolean> {
    return argon2.verify(hashed, payload);
  }
}
