import jwt from 'jsonwebtoken';
import { ITokenProvider, TokenPayload } from './TokenProvider.interface.js';
import { AppError } from '../../core/errors/AppError.js';

export class JwtTokenProvider implements ITokenProvider {
  private readonly secret: string;

  constructor() {
    const secret: string | undefined = process.env.JWT_SECRET;
    if (!secret) {
      throw new AppError('JWT_SECRET environment variable is missing', 500);
    }
    this.secret = secret;
  }

  public async sign(payload: TokenPayload, subject: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      jwt.sign(
        payload,
        this.secret,
        { subject, expiresIn: '1d' },
        (err: Error | null, token: string | undefined) => {
          if (err || !token) {
            return reject(new AppError('Failed to generate token', 500));
          }
          resolve(token);
        }
      );
    });
  }
}