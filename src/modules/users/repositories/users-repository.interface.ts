import { Prisma, User } from '../../../shared/infra/database/client/client.js';

export interface IUsersRepository {
  findByEmail(email: string): Promise<User | null>;
  create(data: Prisma.UserCreateInput): Promise<User>;
}