import { randomUUID } from 'node:crypto';
import { CreateUserData, UserEntity } from '../../domain/user.entity.js';
import { IUsersRepository } from '../usersRepository.interface.js';

export class InMemoryUsersRepository implements IUsersRepository {
  public items: UserEntity[] = [];

  public async findByEmail(email: string, tenantId: string): Promise<UserEntity | null> {
    const user = this.items.find((item) => item.email === email && item.tenantId === tenantId);
    return user ?? null;
  }

  public async findById(id: string, tenantId: string): Promise<UserEntity | null> {
    const user = this.items.find((item) => item.id === id && item.tenantId === tenantId);
    return user ?? null;
  }

  public async create(data: CreateUserData): Promise<UserEntity> {
    const user: UserEntity = {
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
