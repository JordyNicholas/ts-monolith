import { AppError } from "@/shared/core/errors/AppError.js";
import { IHashProvider } from "@/shared/providers/cryptography/HashProvider.interface.js";
import z from "zod";
import { registerBodySchema } from "../http/dtos/register.dto.js";
import { IUsersRepository } from "../repositories/users-repository.interface.js";

type RegisterUserRequest = z.infer<typeof registerBodySchema>;

export class RegisterUserService {
  constructor(private readonly usersRepository: IUsersRepository, private readonly hashProvider: IHashProvider) {}

  async execute({ email, name, password }: RegisterUserRequest) {
    const userExists = await this.usersRepository.findByEmail(email);

    if (userExists) {
      throw new AppError('User already exists');
    }

    // Salt and hash the password with a cost factor of 12
    const hashedPassword = await this.hashProvider.hash(password);
    const user = await this.usersRepository.create({
      email,
      name,
      password: hashedPassword,
    });

    return user;
  }
}
