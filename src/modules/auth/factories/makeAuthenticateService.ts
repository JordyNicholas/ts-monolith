import { prisma } from "../../../shared/infra/database/prisma.js";
import { BcryptHashProvider } from "../../../shared/providers/cryptography/BcryptHashProvider.js";
import { JwtTokenProvider } from "../../../shared/providers/token/JwtTokenProvider.js";
import { PrismaUsersRepository } from "../../users/repositories/prisma-users.repository.js";
import { AuthenticationService } from "../services/authentication.service.js";

export function makeAuthenticateService(): AuthenticationService {
  const usersRepository: PrismaUsersRepository = new PrismaUsersRepository(prisma);
  const hashProvider: BcryptHashProvider = new BcryptHashProvider();
  const tokenProvider: JwtTokenProvider = new JwtTokenProvider();

  return new AuthenticationService(usersRepository, hashProvider, tokenProvider);
}