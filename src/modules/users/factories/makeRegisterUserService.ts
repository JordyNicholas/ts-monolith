import { getTenantPrisma } from '@/shared/infra/database/prisma.js';
import { BcryptHashProvider } from '@/shared/providers/cryptography/BcryptHashProvider.js';
import { PrismaUsersRepository } from '../repositories/prismaUsers.repository.js';
import { RegisterUserService } from '../services/registerUser.service.js';

export function makeRegisterUserService(tenantId: string) {
  const tenantPrisma = getTenantPrisma(tenantId);
  const usersRepository = new PrismaUsersRepository(tenantPrisma);
  const hashProvider = new BcryptHashProvider();

  return new RegisterUserService(usersRepository, hashProvider, tenantId);
}
