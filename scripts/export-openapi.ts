process.env.NODE_ENV = 'test';

const { mkdir, writeFile } = await import('node:fs/promises');
const { dirname, resolve } = await import('node:path');
const { default: prettier } = await import('prettier');
const { buildApp } = await import('../src/shared/infra/http/app.js');

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
