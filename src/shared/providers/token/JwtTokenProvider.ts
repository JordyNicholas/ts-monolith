import { randomUUID } from 'node:crypto';
import jwt from 'jsonwebtoken';
import { env } from '../../infra/env/index.js';
import {
  ITokenProvider,
  SignTokenPayload,
  TokenPair,
  TokenPayload,
} from './TokenProvider.interface.js';
import { AppError } from '../../core/errors/AppError.js';
import { UnauthorizedError } from '@/shared/core/errors/UnauthorizedError.js';
import { ITokenRevocationStore } from './TokenRevocationStore.interface.js';

export class JwtTokenProvider implements ITokenProvider {
  constructor(private readonly revocationStore: ITokenRevocationStore) {}

  public async signAccess(payload: SignTokenPayload, subject: string): Promise<string> {
    return this.sign(payload, subject, env.JWT_SECRET, { expiresIn: '15m' }, 'access');
  }

  public async signRefresh(payload: SignTokenPayload, subject: string): Promise<string> {
    return this.sign(payload, subject, env.JWT_REFRESH_SECRET, { expiresIn: '7d' }, 'refresh');
  }

  public async signTokenPair(payload: SignTokenPayload, subject: string): Promise<TokenPair> {
    const [accessToken, refreshToken] = await Promise.all([
      this.signAccess(payload, subject),
      this.signRefresh(payload, subject),
    ]);
    return { accessToken, refreshToken };
  }

  public async verifyAccess(token: string): Promise<TokenPayload> {
    return this.verify(token, env.JWT_SECRET, 'access');
  }

  public async verifyRefresh(token: string): Promise<TokenPayload> {
    return this.verify(token, env.JWT_REFRESH_SECRET, 'refresh');
  }

  private async sign(
    payload: SignTokenPayload,
    subject: string,
    secret: string,
    options: jwt.SignOptions,
    type: 'access' | 'refresh',
  ): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      jwt.sign(
        { ...payload, type, jti: randomUUID() },
        secret,
        { ...options, subject },
        (err: Error | null, token: string | undefined) => {
          if (err || !token) {
            return reject(new AppError('Failed to generate token'));
          }
          resolve(token);
        },
      );
    });
  }

  private async verify(
    token: string,
    secret: string,
    expectedType: 'access' | 'refresh',
  ): Promise<TokenPayload> {
    try {
      const decoded = jwt.verify(token, secret) as TokenPayload;

      if (
        typeof decoded === 'string' ||
        !decoded.sub ||
        !decoded.tenantId ||
        decoded.type !== expectedType
      ) {
        throw new UnauthorizedError('Invalid JWT token payload');
      }

      if (decoded.jti && (await this.revocationStore.isRevoked(decoded.jti))) {
        throw new UnauthorizedError('Token has been revoked');
      }

      return decoded;
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        throw error;
      }
      throw new AppError('Invalid or expired JWT token.');
    }
  }
}
