#!/usr/bin/env node
/**
 * Fail fast when local Compose bootstrap credentials diverge from DATABASE_URL.
 * Prevents the common P1000 auth failure after changing only one side of .env.
 *
 * In CI/production, only DATABASE_URL is required — POSTGRES_* are local Compose
 * bootstrap vars and are skipped when absent.
 */
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const fileEnv = await loadEnvFileOptional(resolve(process.cwd(), '.env'));
const env = { ...fileEnv, ...process.env };

const databaseUrl = env.DATABASE_URL;
if (!databaseUrl) {
  fail('DATABASE_URL is missing. Set it in .env (local) or the deployment secret store.');
}

let parsed;
try {
  parsed = new URL(databaseUrl);
} catch {
  fail(`DATABASE_URL is not a valid URL: ${databaseUrl}`);
}

const hasComposeBootstrap =
  Boolean(env.POSTGRES_USER) || Boolean(env.POSTGRES_PASSWORD) || Boolean(env.POSTGRES_DB);

if (!hasComposeBootstrap) {
  console.log('Database env OK: DATABASE_URL is set (Compose POSTGRES_* not in use).');
  process.exit(0);
}

const user = env.POSTGRES_USER;
const password = env.POSTGRES_PASSWORD;
const database = env.POSTGRES_DB;
const hostPort = env.POSTGRES_HOST_PORT || '5432';

if (!user || !password || !database) {
  fail(
    'POSTGRES_USER, POSTGRES_PASSWORD and POSTGRES_DB must all be set together (see .env.example).',
  );
}

const urlUser = decodeURIComponent(parsed.username);
const urlPassword = decodeURIComponent(parsed.password);
const urlDatabase = parsed.pathname.replace(/^\//, '');
const urlPort = parsed.port || '5432';

const mismatches = [];

if (urlUser !== user) {
  mismatches.push(`user: DATABASE_URL has "${urlUser}", POSTGRES_USER is "${user}"`);
}
if (urlPassword !== password) {
  mismatches.push('password: DATABASE_URL and POSTGRES_PASSWORD differ');
}
if (urlDatabase !== database) {
  mismatches.push(`database: DATABASE_URL has "${urlDatabase}", POSTGRES_DB is "${database}"`);
}
if (urlPort !== String(hostPort)) {
  mismatches.push(`port: DATABASE_URL has "${urlPort}", POSTGRES_HOST_PORT is "${hostPort}"`);
}

if (mismatches.length > 0) {
  console.error('Database env mismatch — Compose bootstrap and Prisma URL disagree:');
  for (const line of mismatches) console.error(`  - ${line}`);
  console.error('');
  console.error('Align POSTGRES_* with DATABASE_URL in .env, then if the volume was');
  console.error('created with old credentials: docker compose down -v && docker compose up -d');
  console.error('See docs/ENVIRONMENTS.md.');
  process.exit(1);
}

console.log(
  `Database env OK: ${user}@localhost:${hostPort}/${database} matches DATABASE_URL and Compose.`,
);

function fail(message) {
  console.error(message);
  process.exit(1);
}

async function loadEnvFileOptional(path) {
  try {
    const raw = await readFile(path, 'utf8');
    /** @type {Record<string, string>} */
    const values = {};
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq <= 0) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      values[key] = value;
    }
    return values;
  } catch {
    return {};
  }
}
