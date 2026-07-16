import { getTenantPrisma } from '@/shared/infra/database/prisma.js';
import { PrismaUsersRepository } from '../repositories/prismaUsers.repository.js';
import { GetUserProfileService } from '../services/getUserProfile.service.js';

export function makeGetUserProfileService(tenantId: string) {
  const tenantPrisma = getTenantPrisma(tenantId);
  const usersRepository = new PrismaUsersRepository(tenantPrisma);

  return new GetUserProfileService(usersRepository);
}
