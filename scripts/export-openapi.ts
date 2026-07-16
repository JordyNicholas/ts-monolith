import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import prettier from 'prettier';
import { buildApp } from '../src/shared/infra/http/app.js';

const outputPath = resolve(process.argv[2] ?? 'openapi/openapi.json');
const app = await buildApp();

try {
  await app.ready();
  await mkdir(dirname(outputPath), { recursive: true });
  const prettierConfig = await prettier.resolveConfig(outputPath);
  const formatted = await prettier.format(JSON.stringify(app.swagger()), {
    ...prettierConfig,
    parser: 'json',
  });
  await writeFile(outputPath, formatted, 'utf8');
  console.log(`OpenAPI schema exported to ${outputPath}`);
} finally {
  await app.close();
}
