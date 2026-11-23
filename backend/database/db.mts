import { rm } from 'node:fs/promises';
import { join } from 'node:path';
import { DataSource } from 'typeorm';
import { InitialSchema1794700000000 } from './migrations/1794700000000-InitialSchema.mts';
import { seed } from './seed.mts';

const COMMANDS = ['create', 'migrate', 'revert', 'seed', 'reset', 'setup'];
const TABLES = ['attendances', 'employees', 'departments', 'migrations'];

function loadEnv(): void {
  try {
    process.loadEnvFile('.env');
  } catch {
    throw new Error('backend/.env not found. Copy .env.example to .env first.');
  }
}

function env(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (value === undefined) throw new Error(`${key} is missing in backend/.env`);
  return value;
}

function databaseName(): string {
  const name = env('DB_NAME');
  if (!/^[A-Za-z0-9_]+$/.test(name)) throw new Error('DB_NAME may only contain letters, numbers and underscores');
  return name;
}

function connect(withDatabase: boolean): Promise<DataSource> {
  return new DataSource({
    type: 'mysql',
    host: env('DB_HOST', 'localhost'),
    port: Number(env('DB_PORT', '3306')),
    username: env('DB_USER'),
    password: env('DB_PASS', ''),
    database: withDatabase ? databaseName() : undefined,
    timezone: env('DB_TIMEZONE', '+07:00'),
    migrations: [InitialSchema1794700000000],
    logging: ['error'],
  }).initialize();
}

async function withConnection(withDatabase: boolean, work: (ds: DataSource) => Promise<void>): Promise<void> {
  const ds = await connect(withDatabase);
  try {
    await work(ds);
  } finally {
    await ds.destroy();
  }
}

async function createDatabase(): Promise<void> {
  const name = databaseName();
  await withConnection(false, async (ds) => {
    await ds.query(`CREATE DATABASE IF NOT EXISTS \`${name}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  });
  console.log(`Database "${name}" is ready.`);
}

async function migrate(): Promise<void> {
  await withConnection(true, async (ds) => {
    const applied = await ds.runMigrations({ transaction: 'each' });
    if (applied.length === 0) console.log('No pending migrations.');
    for (const m of applied) console.log(`Migrated: ${m.name}`);
  });
}

async function revert(): Promise<void> {
  await withConnection(true, async (ds) => {
    await ds.undoLastMigration({ transaction: 'each' });
  });
  console.log('Reverted the last migration.');
}

async function runSeed(): Promise<void> {
  await withConnection(true, seed);
}

async function dropTables(): Promise<void> {
  await withConnection(true, async (ds) => {
    await ds.query('SET FOREIGN_KEY_CHECKS = 0');
    for (const table of TABLES) await ds.query(`DROP TABLE IF EXISTS \`${table}\``);
    await ds.query('SET FOREIGN_KEY_CHECKS = 1');
  });
  await rm(join(env('UPLOAD_DIR', 'uploads'), 'attendance'), { recursive: true, force: true });
  console.log('Dropped all tables and removed uploaded attendance photos.');
}

async function main(): Promise<void> {
  const command = process.argv[2];
  if (!command || !COMMANDS.includes(command)) {
    throw new Error(`Usage: node database/db.mts <${COMMANDS.join('|')}>`);
  }

  loadEnv();

  if (command === 'create') await createDatabase();
  if (command === 'migrate') await migrate();
  if (command === 'revert') await revert();
  if (command === 'seed') await runSeed();
  if (command === 'reset') {
    await dropTables();
    await migrate();
    await runSeed();
  }
  if (command === 'setup') {
    await createDatabase();
    await migrate();
    await runSeed();
  }
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err);
  process.exitCode = 1;
});
