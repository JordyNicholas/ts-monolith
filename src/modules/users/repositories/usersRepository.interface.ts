import { Prisma, User } from '@/shared/infra/database/client/client.js';

export interface IUsersRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string, tenantId: string): Promise<User | null>;
  create(data: Prisma.UserUncheckedCreateInput): Promise<User>;
}
