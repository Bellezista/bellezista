import { config as loadEnv } from "dotenv";
import path from "node:path";
import { defineConfig, env } from "prisma/config";

// Next.js loads .env.local itself at app runtime, but the Prisma CLI (this
// config file) doesn't go through Next.js -- load it explicitly, same
// precedence Next.js uses (.env.local overrides .env).
loadEnv({ path: ".env" });
loadEnv({ path: ".env.local", override: true });

// Prisma 7: this config is consulted by the CLI (migrate/db push/introspect/studio),
// NOT by the app's runtime PrismaClient. Use the direct/session connection here --
// migrations need session-level features (advisory locks) that don't work over
// Supabase's transaction-mode pooler. The app's runtime client (src/lib/prisma/client.ts)
// reads DATABASE_URL (the pooled connection) separately via its own driver adapter.
export default defineConfig({
  schema: path.join("prisma", "schema"),
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: env("DIRECT_URL"),
  },
});
