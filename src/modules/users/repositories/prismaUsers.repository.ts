// src/modules/users/repositories/prisma-users-repository.ts
import { Prisma, PrismaClient } from '@/shared/infra/database/client/client.js';
import { IUsersRepository } from './usersRepository.interface.js';

export class PrismaUsersRepository implements IUsersRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string, tenantId: string) {
    return this.prisma.user.findUnique({
      where: {
        id_tenantId: {
          id,
          tenantId,
        },
      },
    });
  }

  async create(data: Prisma.UserUncheckedCreateInput) {
    return this.prisma.user.create({ data });
  }
}
