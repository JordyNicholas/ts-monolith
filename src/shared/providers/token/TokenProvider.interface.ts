export interface SignTokenPayload {
  tenantId: string;
  role?: string;
  type?: 'access' | 'refresh';
}

export interface TokenPayload extends SignTokenPayload {
  sub: string;
  jti?: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface ITokenProvider {
  signAccess(payload: SignTokenPayload, subject: string): Promise<string>;
  signRefresh(payload: SignTokenPayload, subject: string): Promise<string>;
  verifyAccess(token: string): Promise<TokenPayload>;
  verifyRefresh(token: string): Promise<TokenPayload>;
}
