import z from "zod";
import { UnauthorizedError } from "../../../shared/core/errors/UnauthorizedError.js";
import { User } from "../../../shared/infra/database/client/client.js";
import { IHashProvider } from "../../../shared/providers/cryptography/HashProvider.interface.js";
import { ITokenProvider } from "../../../shared/providers/token/TokenProvider.interface.js";
import { IUsersRepository } from "../../users/repositories/users-repository.interface.js";
import { loginBodySchema } from "../http/dtos/login.dto.js";

export type LoginRequest = z.infer<typeof loginBodySchema>;
export interface AuthenticationResponse {
  user: User;
  token: string;
}

export class AuthenticationService {
  constructor(
    private readonly usersRepository: IUsersRepository,
    private readonly hashProvider: IHashProvider,
    private readonly tokenProvider: ITokenProvider
  ) {}

  public async execute({ email, password }: LoginRequest): Promise<AuthenticationResponse> {
    const user: User | null = await this.usersRepository.findByEmail(email);

    if (!user) {
      await this.hashProvider.hash(password);
      throw new UnauthorizedError('Invalid credentials');
    }

    const passwordMatches: boolean = await this.hashProvider.compare(password, user.password);

    if (!passwordMatches) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const token: string = await this.tokenProvider.sign({ role: 'user' }, user.id);

    return {
      user,
      token,
    };
  }
}