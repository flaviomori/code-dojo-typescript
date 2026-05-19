import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from "@testcontainers/postgresql";
import * as db from "../../src/database";

let container: StartedPostgreSqlContainer | null = null;

export async function startTestDatabase(): Promise<void> {
  container = await new PostgreSqlContainer("postgres:16-alpine")
    .withDatabase("payouts")
    .withUsername("payouts")
    .withPassword("payouts")
    .start();

  process.env.DATABASE_HOST = container.getHost();
  process.env.DATABASE_PORT = String(container.getMappedPort(5432));
  process.env.DATABASE_NAME = container.getDatabase();
  process.env.DATABASE_USER = container.getUsername();
  process.env.DATABASE_PASSWORD = container.getPassword();

  await db.init();
}

export async function stopTestDatabase(): Promise<void> {
  await db.shutdown();
  if (container) {
    await container.stop();
    container = null;
  }
}
