import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

// Build tooling imports route modules without runtime secrets. The real connection is
// still required for any data request, and should be supplied as a Cloudflare secret.
const databaseUrl = process.env.DATABASE_URL || "postgresql://build:build@127.0.0.1:5432/build";

const globalForDb = globalThis as typeof globalThis & {
  __ebookForgePool?: Pool;
};

export const pool =
  globalForDb.__ebookForgePool ??
  new Pool({ connectionString: databaseUrl });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__ebookForgePool = pool;
}

export const db = drizzle(pool);
