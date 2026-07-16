import { TenantPrismaClient } from '@/shared/infra/database/prisma.js';
import { CreateUserData, UserEntity } from '../domain/user.entity.js';
import { IUsersRepository } from './usersRepository.interface.js';

export class PrismaUsersRepository implements IUsersRepository {
  constructor(private readonly prisma: TenantPrismaClient) {}

  async findByEmail(email: string, _tenantId: string): Promise<UserEntity | null> {
    // Tenant scope is injected by getTenantPrisma extension.
    return this.prisma.user.findFirst({ where: { email } });
  }

  async findById(id: string, _tenantId: string): Promise<UserEntity | null> {
    return this.prisma.user.findFirst({ where: { id } });
  }

  async create(data: CreateUserData): Promise<UserEntity> {
    return this.prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: data.password,
        tenantId: data.tenantId,
      },
    });
  }
}
