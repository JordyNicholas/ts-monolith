import { SignTokenPayload, TokenPayload, ITokenProvider } from '../TokenProvider.interface.js';

export class FakeTokenProvider implements ITokenProvider {
  public async signAccess(payload: SignTokenPayload, subject: string): Promise<string> {
    return `access.${subject}.${payload.tenantId}.${payload.role ?? 'user'}`;
  }

  public async signRefresh(payload: SignTokenPayload, subject: string): Promise<string> {
    return `refresh.${subject}.${payload.tenantId}.${payload.role ?? 'user'}`;
  }

  public async verifyAccess(token: string): Promise<TokenPayload> {
    return this.parse(token, 'access');
  }

  public async verifyRefresh(token: string): Promise<TokenPayload> {
    return this.parse(token, 'refresh');
  }

  private parse(token: string, type: 'access' | 'refresh'): TokenPayload {
    const [tokenType, sub, tenantId, role] = token.split('.');

    if (tokenType !== type || !sub || !tenantId) {
      throw new Error('Invalid fake token');
    }

    return {
      sub,
      tenantId,
      type,
      ...(role ? { role } : {}),
    };
  }
}
