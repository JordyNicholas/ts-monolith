import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { buildApp } from '../src/shared/infra/http/app.js';

const outputPath = resolve(process.argv[2] ?? 'openapi/openapi.json');
const app = await buildApp();

try {
  await app.ready();
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(app.swagger(), null, 2)}\n`, 'utf8');
  console.log(`OpenAPI schema exported to ${outputPath}`);
} finally {
  await app.close();
}
