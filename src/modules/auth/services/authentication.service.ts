import { IUsersRepository } from '@/modules/users/repositories/usersRepository.interface.js';
import { UnauthorizedError } from '@/shared/core/errors/UnauthorizedError.js';
import { UserEntity } from '@/modules/users/domain/user.entity.js';
import { IHashProvider } from '@/shared/providers/cryptography/HashProvider.interface.js';
import { ITokenProvider } from '@/shared/providers/token/TokenProvider.interface.js';

export interface LoginRequest {
  email: string;
  password: string;
  tenantId: string;
}

export interface AuthenticationResponse {
  user: UserEntity;
  token: string;
}

export class AuthenticationService {
  constructor(
    private readonly usersRepository: IUsersRepository,
    private readonly hashProvider: IHashProvider,
    private readonly tokenProvider: ITokenProvider,
  ) {}

  public async execute({
    email,
    password,
    tenantId,
  }: LoginRequest): Promise<AuthenticationResponse> {
    const user = await this.usersRepository.findByEmail(email, tenantId);

    if (!user) {
      await this.hashProvider.hash(password);
      throw new UnauthorizedError('Invalid credentials');
    }

    const passwordMatches = await this.hashProvider.compare(password, user.password);

    if (!passwordMatches) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const token = await this.tokenProvider.sign({ tenantId: user.tenantId, role: 'user' }, user.id);

    return {
      user,
      token,
    };
  }
}
