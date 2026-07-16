export interface UserEntity {
  id: string;
  tenantId: string;
  email: string;
  name: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserData {
  tenantId: string;
  email: string;
  name: string;
  password: string;
}
