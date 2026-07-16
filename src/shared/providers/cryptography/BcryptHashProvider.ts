import bcrypt from 'bcrypt';
import { IHashProvider } from './HashProvider.interface.js';

export class BcryptHashProvider implements IHashProvider {
  async hash(payload: string): Promise<string> {
    return bcrypt.hash(payload, 12);
  }

  async compare(payload: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(payload, hashed);
  }
}