#!/usr/bin/env node
import { randomBytes } from 'node:crypto';
import { access, readFile, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';

const envPath = '.env';
const envExists = await exists(envPath);
let envContents = envExists
  ? await readFile(envPath, 'utf8')
  : await readFile('.env.example', 'utf8');
let envChanged = !envExists;

if (!envExists) {
  console.log('Creating .env from .env.example.');
} else {
  console.log('Checking existing .env.');
}

({ contents: envContents, changed: envChanged } = ensureSetting(
  envContents,
  envChanged,
  'JWT_SECRET',
  randomBytes(48).toString('base64url'),
  'change-me-to-a-long-random-secret-at-least-32-chars',
));
({ contents: envContents, changed: envChanged } = ensureSetting(
  envContents,
  envChanged,
  'JWT_REFRESH_SECRET',
  randomBytes(48).toString('base64url'),
  'change-me-to-another-long-random-secret-at-least-32-chars',
));
({ contents: envContents, changed: envChanged } = ensureSetting(
  envContents,
  envChanged,
  'CORS_ORIGIN',
  'http://localhost:3000',
));

if (envChanged) {
  await writeFile(envPath, envContents.endsWith('\n') ? envContents : `${envContents}\n`, 'utf8');
  console.log('Updated .env with safe local defaults.');
} else {
  console.log('Existing .env is ready.');
}

run('docker', ['compose', 'up', '-d', 'postgres']);
run(npmCommand(), ['run', 'db:generate']);
run(npmCommand(), ['run', 'db:migrate']);
run(npmCommand(), ['run', 'db:seed']);

console.log('');
console.log('Setup complete. Start the API with: npm run dev');
console.log('Then verify: http://localhost:3333/ready');

function run(command, args) {
  console.log(`> ${command} ${args.join(' ')}`);
  const windowsNpm = process.platform === 'win32' && command === 'npm';
  const executable = windowsNpm ? (process.env.ComSpec ?? 'cmd.exe') : command;
  const executableArgs = windowsNpm ? ['/d', '/s', '/c', `npm ${args.join(' ')}`] : args;
  const result = spawnSync(executable, executableArgs, { stdio: 'inherit' });
  if (result.error) {
    console.error(`Unable to run ${command}: ${result.error.message}`);
    process.exit(1);
  }
  if (result.status !== 0) process.exit(result.status ?? 1);
}

function npmCommand() {
  return 'npm';
}

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

function ensureSetting(contents, changed, name, value, replaceValue) {
  const pattern = new RegExp(`^${name}=(.*)$`, 'm');
  const match = contents.match(pattern);

  if (!match) {
    return {
      contents: `${contents.trimEnd()}\n${name}=${value}\n`,
      changed: true,
    };
  }

  if (replaceValue && match[1] === replaceValue) {
    return {
      contents: contents.replace(pattern, `${name}=${value}`),
      changed: true,
    };
  }

  return { contents, changed };
}
