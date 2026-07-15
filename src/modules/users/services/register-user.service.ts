import z from 'zod';
import bcrypt from 'bcrypt';
import { AppError } from '../../../shared/core/errors/AppError.js';
import { registerBodySchema } from '../http/dtos/register.dto.js';
import { IUsersRepository } from '../repositories/users-repository.interface.js';

type RegisterUserRequest = z.infer<typeof registerBodySchema>;

export class RegisterUserService {
  constructor(private readonly usersRepository: IUsersRepository) {}

  async execute({ email, name, password }: RegisterUserRequest) {
    const userExists = await this.usersRepository.findByEmail(email);

    if (userExists) {
      throw new AppError('User already exists', 409);
    }

    // Salt and hash the password with a cost factor of 12
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await this.usersRepository.create({
      email,
      name,
      password: hashedPassword,
    });

    return user;
  }
}
