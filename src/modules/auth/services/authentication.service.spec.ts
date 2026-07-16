import { describe, test, expect, beforeEach } from 'vitest';
import { InMemoryUsersRepository } from '@/modules/users/repositories/InMemory/inMemoryUsers.repository.js';
import { FakeHashProvider } from '@/shared/providers/cryptography/fakes/FakeHashProvider.js';
import { FakeTokenProvider } from '@/shared/providers/token/fakes/FakeTokenProvider.js';
import { UnauthorizedError } from '@/shared/core/errors/UnauthorizedError.js';
import { DEFAULT_TENANT_ID } from '@/shared/infra/env/constants.js';
import { AuthenticationService } from './authentication.service.js';

let usersRepository: InMemoryUsersRepository;
let hashProvider: FakeHashProvider;
let tokenProvider: FakeTokenProvider;
let sut: AuthenticationService;

describe('Authentication Service', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    hashProvider = new FakeHashProvider();
    tokenProvider = new FakeTokenProvider();
    sut = new AuthenticationService(usersRepository, hashProvider, tokenProvider);
  });

  test('Should authenticate with valid credentials', async () => {
    await usersRepository.create({
      email: 'john@flux.com',
      name: 'John Doe',
      password: await hashProvider.hash('valid-password'),
      tenantId: DEFAULT_TENANT_ID,
    });

    const result = await sut.execute({
      email: 'john@flux.com',
      password: 'valid-password',
      tenantId: DEFAULT_TENANT_ID,
    });

    expect(result.token).toEqual(expect.any(String));
    expect(result.user.email).toBe('john@flux.com');
  });

  test('Should not authenticate with wrong password', async () => {
    await usersRepository.create({
      email: 'john@flux.com',
      name: 'John Doe',
      password: await hashProvider.hash('valid-password'),
      tenantId: DEFAULT_TENANT_ID,
    });

    await expect(
      sut.execute({
        email: 'john@flux.com',
        password: 'wrong-password',
        tenantId: DEFAULT_TENANT_ID,
      }),
    ).rejects.toBeInstanceOf(UnauthorizedError);
  });

  test('Should not authenticate unknown email', async () => {
    await expect(
      sut.execute({
        email: 'missing@flux.com',
        password: 'whatever',
        tenantId: DEFAULT_TENANT_ID,
      }),
    ).rejects.toBeInstanceOf(UnauthorizedError);
  });
});
