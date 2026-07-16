import { describe, test, expect, beforeEach } from 'vitest';
import { InMemoryUsersRepository } from '../repositories/InMemory/inMemoryUsers.repository.js';
import { FakeHashProvider } from '@/shared/providers/cryptography/fakes/FakeHashProvider.js';
import { RegisterUserService } from './registerUser.service.js';
import { UserEntity } from '../domain/user.entity.js';
import { AppError } from '@/shared/core/errors/AppError.js';
import { DEFAULT_TENANT_ID } from '@/shared/infra/env/constants.js';

let usersRepository: InMemoryUsersRepository;
let hashProvider: FakeHashProvider;
let sut: RegisterUserService;

describe('Register User Service', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    hashProvider = new FakeHashProvider();
    sut = new RegisterUserService(usersRepository, hashProvider, DEFAULT_TENANT_ID);
  });

  test('Should be able to register a new user', async () => {
    const user: UserEntity = await sut.execute({
      name: 'John Doe',
      email: 'john@flux.com',
      password: 'NoNeedToAskIsASmoothOperator',
    });

    expect(user.id).toEqual(expect.any(String));
    expect(user.tenantId).toBe(DEFAULT_TENANT_ID);
    expect(usersRepository.items).toHaveLength(1);
  });

  test('Should hash the user password upon registration', async () => {
    const user: UserEntity = await sut.execute({
      name: 'John Doe',
      email: 'john@flux.com',
      password: 'ThereMustHaveBeenAnAngelByMySide',
    });

    expect(user.password).toEqual('ThereMustHaveBeenAnAngelByMySide-hashed');
    expect(usersRepository.items[0]?.password).toEqual('ThereMustHaveBeenAnAngelByMySide-hashed');
  });

  test('Should not be able to register with an email already in use', async () => {
    await sut.execute({
      name: 'John Doe',
      email: 'john@flux.com',
      password: 'CantForgetWeOnlyGetWhatWeGive',
    });

    await expect(() =>
      sut.execute({
        name: 'John Doe',
        email: 'john@flux.com',
        password: 'CantForgetWeOnlyGetWhatWeGive',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  test('Should allow the same email on a different tenant', async () => {
    await sut.execute({
      name: 'John Doe',
      email: 'john@flux.com',
      password: 'shared-email-password',
    });

    const otherTenantService = new RegisterUserService(
      usersRepository,
      hashProvider,
      '00000000-0000-4000-8000-000000000099',
    );

    const user = await otherTenantService.execute({
      name: 'Jane Doe',
      email: 'john@flux.com',
      password: 'shared-email-password',
    });

    expect(user.tenantId).toBe('00000000-0000-4000-8000-000000000099');
    expect(usersRepository.items).toHaveLength(2);
  });
});
