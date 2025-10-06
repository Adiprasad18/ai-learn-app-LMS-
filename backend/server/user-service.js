import { db } from "../configs/db.js";
import { USER_TABLE } from "../configs/schema.js";
import { eq, sql } from "drizzle-orm";

let ensureUserTableSchemaPromise;

async function ensureUserTableSchema() {
  if (!ensureUserTableSchemaPromise) {
    ensureUserTableSchemaPromise = (async () => {
      const statements = [
        // Base table structure (no Stripe or membership fields)
        sql`CREATE TABLE IF NOT EXISTS "users" (
          "id" serial PRIMARY KEY,
          "name" varchar(255) NOT NULL,
          "email" varchar(255) NOT NULL
        );`,

        // Core user fields
        sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "external_id" varchar(255);`,
        sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "created_at" timestamp DEFAULT now();`,
        sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "updated_at" timestamp DEFAULT now();`,

        // Constraints & defaults
        sql`ALTER TABLE "users" ALTER COLUMN "external_id" SET NOT NULL;`,
        sql`ALTER TABLE "users" ALTER COLUMN "name" SET NOT NULL;`,
        sql`ALTER TABLE "users" ALTER COLUMN "email" SET NOT NULL;`,

        // Indexes
        sql`CREATE UNIQUE INDEX IF NOT EXISTS "users_external_id_idx" ON "users" ("external_id");`,
        sql`CREATE UNIQUE INDEX IF NOT EXISTS "users_email_idx" ON "users" ("email");`,
      ];

      for (const statement of statements) {
        try {
          await db.execute(statement);
        } catch (error) {
          if (process.env.NODE_ENV !== "production") {
            console.warn("[user-service] Schema sync warning:", error?.message ?? error);
          }
        }
      }
    })();
  }

  return ensureUserTableSchemaPromise;
}

// Get user by external ID
export async function getUserByExternalId(externalId) {
  await ensureUserTableSchema();

  const user = await db
    .select()
    .from(USER_TABLE)
    .where(eq(USER_TABLE.externalId, externalId));

  return user?.[0] ?? null;
}

// Create a new user
export async function createUser({ externalId, email, name }) {
  await ensureUserTableSchema();

  const result = await db
    .insert(USER_TABLE)
    .values({
      externalId,
      email,
      name,
    })
    .returning();

  return result?.[0] ?? null;
}

// Upsert (create if not exists)
export async function upsertUser({ externalId, email, name }) {
  await ensureUserTableSchema();

  const existingUser = await getUserByExternalId(externalId);

  if (existingUser) {
    return existingUser;
  }

  return createUser({ externalId, email, name });
}
