import { randomUUID } from 'node:crypto';
import { IUsersRepository } from '../usersRepository.interface.js';
import { User } from '@/shared/infra/database/client/browser.js';

export class InMemoryUsersRepository implements IUsersRepository {
  public items: User[] = [];

  public async findByEmail(email: string): Promise<User | null> {
    const user: User | undefined = this.items.find((item) => item.email === email);
    return user || null;
  }

  // We explicitly type the input to match the interface contract
  public async create(data: { email: string; name: string; password: string }): Promise<User> {
    const user: User = {
      id: randomUUID(),
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