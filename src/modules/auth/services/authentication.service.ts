import { z } from 'zod';
import { IUsersRepository } from '../../users/repositories/users-repository.interface.js';
import { loginBodySchema } from '../http/dtos/login.dto.js';
import { AppError } from '../../../shared/core/errors/AppError.js';

type LoginRequest = z.infer<typeof loginBodySchema>;

export class AuthenticateService {
  constructor(private readonly usersRepository: IUsersRepository) {}

  async execute({ email, password }: LoginRequest) {
    const user = await this.usersRepository.findByEmail(email);

    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    // In a real application, compare using bcrypt
    const passwordMatches: boolean = password === user.password;

    if (!passwordMatches) {
      throw new AppError('Invalid credentials', 401);
    }

    return user;
  }
}
