import { prisma } from "../../../shared/infra/database/prisma.js";
import { PrismaUsersRepository } from "../../users/repositories/prisma-users.repository.js";
import { AuthenticateService } from "../services/authentication.service.js";

export function makeAuthenticateService() {
  const usersRepository = new PrismaUsersRepository(prisma);
  return new AuthenticateService(usersRepository);
}