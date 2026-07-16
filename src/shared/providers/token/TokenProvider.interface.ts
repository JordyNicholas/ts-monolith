
export interface SignTokenPayload {
  tenantId: string
  role?: string
}
export interface TokenPayload extends SignTokenPayload {
  sub: string;
}

export interface ITokenProvider {
  sign(payload: SignTokenPayload, subject: string): Promise<string>;
  verify(token: string): Promise<TokenPayload>;
}