import { AppError } from '@/shared/core/errors/AppError.js';
import { IHashProvider } from '@/shared/providers/cryptography/HashProvider.interface.js';
import { UserEntity } from '../domain/user.entity.js';
import { IUsersRepository } from '../repositories/usersRepository.interface.js';

export interface RegisterUserRequest {
  email: string;
  name: string;
  password: string;
}

export class RegisterUserService {
  constructor(
    private readonly usersRepository: IUsersRepository,
    private readonly hashProvider: IHashProvider,
    private readonly tenantId: string,
  ) {}

  async execute({ email, name, password }: RegisterUserRequest): Promise<UserEntity> {
    const userExists = await this.usersRepository.findByEmail(email, this.tenantId);

    if (userExists) {
      throw new AppError('User already exists');
    }

    const hashedPassword = await this.hashProvider.hash(password);

    return this.usersRepository.create({
      email,
      name,
      password: hashedPassword,
      tenantId: this.tenantId,
    });
  }
}
