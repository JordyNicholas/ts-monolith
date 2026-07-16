import { getTenantPrisma } from '@/shared/infra/database/prisma.js';
import { getHashProvider } from '@/shared/providers/cryptography/getHashProvider.js';
import { JwtTokenProvider } from '@/shared/providers/token/JwtTokenProvider.js';
import { getTokenRevocationStore } from '@/shared/providers/token/getTokenRevocationStore.js';
import { PrismaUsersRepository } from '@/modules/users/repositories/prismaUsers.repository.js';
import { AuthenticationService } from '../services/authentication.service.js';

export function makeAuthenticateService(tenantId: string): AuthenticationService {
  const tenantPrisma = getTenantPrisma(tenantId);
  const usersRepository = new PrismaUsersRepository(tenantPrisma);

  return new AuthenticationService(
    usersRepository,
    getHashProvider(),
    new JwtTokenProvider(getTokenRevocationStore()),
  );
}
