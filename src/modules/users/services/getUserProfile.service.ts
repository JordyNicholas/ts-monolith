import { ResourceNotFoundError } from '@/shared/core/errors/ResourceNotFoundError.js';
import { IUsersRepository } from '../repositories/usersRepository.interface.js';

export interface GetUserProfileRequest {
  userId: string;
  tenantId: string;
}

export class GetUserProfileService {
  constructor(private readonly usersRepository: IUsersRepository) {}

  async execute({ userId, tenantId }: GetUserProfileRequest) {
    const user = await this.usersRepository.findById(userId, tenantId);

    if (!user) {
      throw new ResourceNotFoundError('User not found');
    }

    return user;
  }
}
