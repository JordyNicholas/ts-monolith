import { ErrorHandler } from '../../../shared/handlers/error.js';
import { IUsersRepository } from '../repositories/users-repository.interface.js';

export class RegisterUserService {
  constructor(private readonly usersRepository: IUsersRepository) {}

  async execute({ email, password }: { email: string; password: string }) {
    const validateEmail = await this.usersRepository.findByEmail(email);

    if (validateEmail) {
      throw new ErrorHandler('Email already exists', 400);
    }

    const user = await this.usersRepository.create({ email, password });
    return user;
  }
}
