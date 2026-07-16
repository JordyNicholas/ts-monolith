export type TokenPayload = Record<string, string | number | boolean>;

export interface ITokenProvider {
  sign(payload: TokenPayload, subject: string): Promise<string>;
}