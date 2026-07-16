import { getTenantPrisma } from '@/shared/infra/database/prisma.js';
import { BcryptHashProvider } from '@/shared/providers/cryptography/BcryptHashProvider.js';
import { JwtTokenProvider } from '@/shared/providers/token/JwtTokenProvider.js';
import { PrismaUsersRepository } from '@/modules/users/repositories/prismaUsers.repository.js';
import { AuthenticationService } from '../services/authentication.service.js';

export function makeAuthenticateService(tenantId: string): AuthenticationService {
  const tenantPrisma = getTenantPrisma(tenantId);
  const usersRepository = new PrismaUsersRepository(tenantPrisma);
  const hashProvider = new BcryptHashProvider();
  const tokenProvider = new JwtTokenProvider();

  return new AuthenticationService(usersRepository, hashProvider, tokenProvider);
}
