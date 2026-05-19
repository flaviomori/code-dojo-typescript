import { promises as fs } from "node:fs";
import * as path from "node:path";
import { Client, Pool } from "pg";

let pool: Pool | null = null;

function dbConfig() {
  return {
    host: process.env.DATABASE_HOST ?? "localhost",
    port: Number(process.env.DATABASE_PORT ?? 5432),
    database: process.env.DATABASE_NAME ?? "payouts",
    user: process.env.DATABASE_USER ?? "payouts",
    password: process.env.DATABASE_PASSWORD ?? "payouts",
  };
}

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({ ...dbConfig(), max: 10 });
  }
  return pool;
}

export async function init(): Promise<void> {
  await runMigrations();
  getPool();
}

export async function shutdown(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

async function runMigrations(): Promise<void> {
  const migrationsDir = path.join(__dirname, "..", "migrations");
  const files = (await fs.readdir(migrationsDir))
    .filter((f) => /^V\d+__.+\.sql$/.test(f))
    .sort();

  const client = new Client(dbConfig());
  await client.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        filename TEXT PRIMARY KEY,
        applied_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    const { rows } = await client.query<{ filename: string }>(
      `SELECT filename FROM schema_migrations`
    );
    const applied = new Set(rows.map((r) => r.filename));

    for (const file of files) {
      if (applied.has(file)) continue;
      const sql = await fs.readFile(path.join(migrationsDir, file), "utf8");
      await client.query("BEGIN");
      try {
        await client.query(sql);
        await client.query(
          `INSERT INTO schema_migrations (filename) VALUES ($1)`,
          [file]
        );
        await client.query("COMMIT");
      } catch (err) {
        await client.query("ROLLBACK");
        throw err;
      }
    }
  } finally {
    await client.end();
  }
}
