import * as db from "../../src/database";

// Sem Testcontainers: a conexão vem das envs DATABASE_* (apontadas ao serviço
// `postgres-test` pelo docker-compose). Mesmo Postgres real, provisionado pelo compose.
export async function startTestDatabase(): Promise<void> {
  await db.init();
}

export async function stopTestDatabase(): Promise<void> {
  await db.shutdown();
}
