import jwt from 'jsonwebtoken';
import { env } from '../../infra/env/index.js';
import { ITokenProvider, TokenPayload, SignTokenPayload } from './TokenProvider.interface.js';
import { AppError } from '../../core/errors/AppError.js';
import { UnauthorizedError } from '@/shared/core/errors/UnauthorizedError.js';

export class JwtTokenProvider implements ITokenProvider {
  public async sign(payload: SignTokenPayload, subject: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      jwt.sign(
        payload,
        env.JWT_SECRET,
        { subject, expiresIn: '1d' },
        (err: Error | null, token: string | undefined) => {
          if (err || !token) {
            return reject(new AppError('Failed to generate token'));
          }
          resolve(token);
        }
      );
    });
  }

  public async verify(token: string): Promise<TokenPayload> {
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as TokenPayload;

      if (typeof decoded === 'string' || !decoded.sub || !decoded.tenantId) {
        throw new UnauthorizedError('Invalid JWT token payload');
      }

      return decoded;
    } catch (error) {
      throw new AppError('Invalid or expired JWT token.');
    }
  }
}