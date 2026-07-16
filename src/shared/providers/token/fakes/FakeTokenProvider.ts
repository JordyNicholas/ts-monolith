import { SignTokenPayload, TokenPayload, ITokenProvider } from '../TokenProvider.interface.js';

export class FakeTokenProvider implements ITokenProvider {
  public async sign(payload: SignTokenPayload, subject: string): Promise<string> {
    return `token.${subject}.${payload.tenantId}.${payload.role ?? 'user'}`;
  }

  public async verify(token: string): Promise<TokenPayload> {
    const [, sub, tenantId, role] = token.split('.');

    if (!sub || !tenantId) {
      throw new Error('Invalid fake token');
    }

    return {
      sub,
      tenantId,
      ...(role ? { role } : {}),
    };
  }
}
