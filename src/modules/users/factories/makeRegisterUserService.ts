import { prisma } from "@/shared/infra/database/prisma.js";
import { BcryptHashProvider } from "@/shared/providers/cryptography/BcryptHashProvider.js";
import { PrismaUsersRepository } from "../repositories/prismaUsers.repository.js";
import { RegisterUserService } from "../services/registerUser.service.js";

export function makeRegisterUserService() {
  const usersRepository = new PrismaUsersRepository(prisma);
  const hashProvider = new BcryptHashProvider();

  return new RegisterUserService(usersRepository, hashProvider);
}