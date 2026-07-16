#!/usr/bin/env node
/**
 * Scaffold a new bounded context module.
 * Usage: npm run scaffold:module -- billing
 */
import { mkdir, writeFile, access } from 'node:fs/promises';
import { join } from 'node:path';

const moduleName = process.argv[2];

if (!moduleName || !/^[a-z][a-z0-9-]*$/.test(moduleName)) {
  console.error('Usage: npm run scaffold:module -- <module-name>');
  console.error('Example: npm run scaffold:module -- billing');
  process.exit(1);
}

const pascal = moduleName
  .split('-')
  .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
  .join('');

const camel = pascal.charAt(0).toLowerCase() + pascal.slice(1);
const base = join('src', 'modules', moduleName);

const dirs = [
  join(base, 'domain'),
  join(base, 'http', 'dtos'),
  join(base, 'services'),
  join(base, 'repositories', 'InMemory'),
  join(base, 'factories'),
];

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

if (await exists(base)) {
  console.error(`Module already exists: ${base}`);
  process.exit(1);
}

for (const dir of dirs) {
  await mkdir(dir, { recursive: true });
}

const files = {
  [`${base}/domain/${camel}.entity.ts`]: `export interface ${pascal}Entity {
  id: string;
  tenantId: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}
`,
  [`${base}/repositories/${camel}Repository.interface.ts`]: `import { ${pascal}Entity } from '../domain/${camel}.entity.js';

export interface I${pascal}Repository {
  findById(id: string): Promise<${pascal}Entity | null>;
}
`,
  [`${base}/repositories/InMemory/inMemory${pascal}Repository.ts`]: `import { randomUUID } from 'node:crypto';
import { ${pascal}Entity } from '../../domain/${camel}.entity.js';
import { I${pascal}Repository } from '../${camel}Repository.interface.js';

export class InMemory${pascal}Repository implements I${pascal}Repository {
  public items: ${pascal}Entity[] = [];

  public async findById(id: string): Promise<${pascal}Entity | null> {
    return this.items.find((item) => item.id === id) ?? null;
  }

  public async create(data: { tenantId: string; name: string }): Promise<${pascal}Entity> {
    const entity: ${pascal}Entity = {
      id: randomUUID(),
      tenantId: data.tenantId,
      name: data.name,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.items.push(entity);
    return entity;
  }
}
`,
  [`${base}/services/get${pascal}Service.ts`]: `import { ResourceNotFoundError } from '@/shared/core/errors/ResourceNotFoundError.js';
import { ${pascal}Entity } from '../domain/${camel}.entity.js';
import { I${pascal}Repository } from '../repositories/${camel}Repository.interface.js';

export interface Get${pascal}Request {
  id: string;
}

export class Get${pascal}Service {
  constructor(private readonly repository: I${pascal}Repository) {}

  public async execute({ id }: Get${pascal}Request): Promise<${pascal}Entity> {
    const entity = await this.repository.findById(id);
    if (!entity) {
      throw new ResourceNotFoundError('${pascal} not found');
    }
    return entity;
  }
}
`,
  [`${base}/factories/makeGet${pascal}Service.ts`]: `import { getTenantPrisma } from '@/shared/infra/database/prisma.js';
import { Get${pascal}Service } from '../services/get${pascal}Service.js';

export function makeGet${pascal}Service(_tenantId: string): Get${pascal}Service {
  // TODO: wire Prisma${pascal}Repository when persistence is needed
  throw new Error('Implement Prisma${pascal}Repository and wire it here');
}
`,
  [`${base}/http/dtos/${camel}.dto.ts`]: `import { z } from 'zod';

export const ${camel}ResponseSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  tenantId: z.uuid(),
});
`,
  [`${base}/http/${moduleName}.routes.ts`]: `import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { ensureAuthenticated } from '@/shared/infra/http/middlewares/ensureAuthenticated.js';
import { ${camel}ResponseSchema } from './dtos/${camel}.dto.js';

export async function ${camel}Routes(app: FastifyInstance) {
  const typedApp = app.withTypeProvider<ZodTypeProvider>();

  typedApp.get(
    '/',
    {
      preHandler: ensureAuthenticated,
      schema: {
        tags: ['${moduleName}'],
        summary: 'List ${moduleName} (stub — implement service)',
        security: [{ bearerAuth: [] }],
        response: { 200: ${camel}ResponseSchema.array() },
      },
    },
    async () => {
      return [];
    },
  );
}
`,
};

for (const [filePath, content] of Object.entries(files)) {
  await writeFile(filePath, content, 'utf8');
}

console.log(`✅ Scaffolded module: ${moduleName}`);
console.log(`   Path: ${base}`);
console.log('');
console.log('Next steps:');
console.log(`  1. Add Prisma model + migration if persistence is needed`);
console.log(`  2. Implement Prisma${pascal}Repository`);
console.log(`  3. Register routes in src/shared/infra/http/app.ts`);
console.log(`     app.register(${camel}Routes, { prefix: '/${moduleName}' });`);
