import { prisma } from '@/shared/infra/database/prisma.js';
import { PrismaUsersRepository } from '../repositories/prismaUsers.repository.js';
import { GetUserProfileService } from '../services/getUserProfile.service.js';

export function makeGetUserProfileService() {
  const usersRepository = new PrismaUsersRepository(prisma);

  return new GetUserProfileService(usersRepository);
}
