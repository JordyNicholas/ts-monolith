// src/modules/users/repositories/prisma-users-repository.ts
import { Prisma, PrismaClient } from  '../../../shared/infra/database/client/client.js';
import { IUsersRepository } from './users-repository.interface.js';

export class PrismaUsersRepository implements IUsersRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async create(data: Prisma.UserCreateInput) {
    return this.prisma.user.create({ data });
  }
}