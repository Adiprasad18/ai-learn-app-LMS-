import { db } from "../configs/db.js";
import { USER_TABLE } from "../configs/schema.js";
import { eq, sql } from "drizzle-orm";

let ensureUserTableSchemaPromise;

async function ensureUserTableSchema() {
  if (!ensureUserTableSchemaPromise) {
    ensureUserTableSchemaPromise = (async () => {
      const statements = [
        sql`CREATE TABLE IF NOT EXISTS "users" (
          "id" serial PRIMARY KEY,
          "name" varchar(255) NOT NULL,
          "email" varchar(255) NOT NULL,
          "is_member" boolean DEFAULT false
        );`,
        sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "external_id" varchar(255);`,
        sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "stripe_customer_id" varchar(255);`,
        sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "subscription_status" varchar(50) DEFAULT 'inactive';`,
        sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "created_at" timestamp DEFAULT now();`,
        sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "updated_at" timestamp DEFAULT now();`,
        sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "is_member" boolean DEFAULT false;`,
        sql`ALTER TABLE "users" ALTER COLUMN "subscription_status" SET DEFAULT 'inactive';`,
        sql`ALTER TABLE "users" ALTER COLUMN "created_at" SET DEFAULT now();`,
        sql`ALTER TABLE "users" ALTER COLUMN "updated_at" SET DEFAULT now();`,
        sql`ALTER TABLE "users" ALTER COLUMN "is_member" SET DEFAULT false;`,
        sql`UPDATE "users" SET "external_id" = CONCAT('legacy_', "id") WHERE "external_id" IS NULL OR "external_id" = '';`,
        sql`ALTER TABLE "users" ALTER COLUMN "external_id" SET NOT NULL;`,
        sql`ALTER TABLE "users" ALTER COLUMN "name" SET NOT NULL;`,
        sql`ALTER TABLE "users" ALTER COLUMN "email" SET NOT NULL;`,
        sql`CREATE UNIQUE INDEX IF NOT EXISTS "users_external_id_idx" ON "users" ("external_id");`,
        sql`CREATE UNIQUE INDEX IF NOT EXISTS "users_email_idx" ON "users" ("email");`,
      ];

      for (const statement of statements) {
        try {
          await db.execute(statement);
        } catch (error) {
          // Ignore errors caused by conflicting existing constraints or data;
          // we only need the operations that succeed to align the schema.
          if (process.env.NODE_ENV !== "production") {
            console.warn("[user-service] Schema sync warning:", error?.message ?? error);
          }
        }
      }
    })();
  }

  return ensureUserTableSchemaPromise;
}

export async function getUserByExternalId(externalId) {
  await ensureUserTableSchema();

  const user = await db
    .select()
    .from(USER_TABLE)
    .where(eq(USER_TABLE.externalId, externalId));

  return user?.[0] ?? null;
}

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

export async function upsertUser({ externalId, email, name }) {
  await ensureUserTableSchema();

  const existingUser = await getUserByExternalId(externalId);

  if (existingUser) {
    return existingUser;
  }

  return createUser({ externalId, email, name });
}

export async function updateUserSubscription(externalId, { isMember, subscriptionStatus, stripeCustomerId }) {
  await ensureUserTableSchema();

  return db
    .update(USER_TABLE)
    .set({
      isMember,
      subscriptionStatus,
      stripeCustomerId,
      updatedAt: new Date(),
    })
    .where(eq(USER_TABLE.externalId, externalId));
}