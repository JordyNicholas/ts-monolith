import { randomUUID } from 'node:crypto';
import { Prisma, User } from '@/shared/infra/database/client/browser.js';
import { IUsersRepository } from '../usersRepository.interface.js';

export class InMemoryUsersRepository implements IUsersRepository {
  public items: User[] = [];

  public async findByEmail(email: string): Promise<User | null> {
    const user: User | undefined = this.items.find((item) => item.email === email);
    return user || null;
  }

  public async findById(id: string, tenantId: string): Promise<User | null> {
    const user: User | undefined = this.items.find(
      (item) => item.id === id && item.tenantId === tenantId,
    );
    return user || null;
  }

  // We explicitly type the input to match the interface contract
  public async create(data: Prisma.UserUncheckedCreateInput): Promise<User> {
    const user: User = {
      id: randomUUID(),
      tenantId: data.tenantId,
      email: data.email,
      name: data.name,
      password: data.password,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.items.push(user);

    return user;
  }
}
