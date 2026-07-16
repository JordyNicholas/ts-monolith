import { CreateUserData, UserEntity } from '../domain/user.entity.js';

export interface IUsersRepository {
  findByEmail(email: string, tenantId: string): Promise<UserEntity | null>;
  findById(id: string, tenantId: string): Promise<UserEntity | null>;
  create(data: CreateUserData): Promise<UserEntity>;
}
