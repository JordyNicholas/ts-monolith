import { IHashProvider } from "../HashProvider.interface.js";

export class FakeHashProvider implements IHashProvider {
  public async hash(payload: string): Promise<string> {
    return `${payload}-hashed`;
  }

  public async compare(payload: string, hashed: string): Promise<boolean> {
    return payload === hashed.replace('-hashed', '');
  }
}