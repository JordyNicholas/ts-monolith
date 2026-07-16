import { getTenantPrisma } from '@/shared/infra/database/prisma.js';
import { getHashProvider } from '@/shared/providers/cryptography/getHashProvider.js';
import { PrismaUsersRepository } from '../repositories/prismaUsers.repository.js';
import { RegisterUserService } from '../services/registerUser.service.js';

export function makeRegisterUserService(tenantId: string) {
  const tenantPrisma = getTenantPrisma(tenantId);
  const usersRepository = new PrismaUsersRepository(tenantPrisma);

  return new RegisterUserService(usersRepository, getHashProvider(), tenantId);
}
