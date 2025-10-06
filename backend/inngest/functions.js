import { db } from "../configs/db.js";
import { USER_TABLE } from "../configs/schema.js";
import { eq } from "drizzle-orm";
import { inngest } from "./client.js";

/**
 * Test Function: Hello World
 */
export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    console.log("Hello World Event Data:", event.data);

    await step.sleep("wait-a-moment", "1s");

    return { message: `Hello ${event.data.email}!` };
  }
);

/**
 * Create New User Function
 */
export const CreateNewUser = inngest.createFunction(
  { id: "create-user" },
  { event: "user.create" },
  async ({ event, step }) => {
    const { externalId, email, name } = event.data;
    console.log("Received user.create event:", event.data);

    const result = await step.run(
      "Check User and create New if Not in DB",
      async () => {
        const existing = await db
          .select()
          .from(USER_TABLE)
          .where(eq(USER_TABLE.externalId, externalId));

        if (existing?.length) {
          console.log("User already exists, returning existing:", existing);
          return existing;
        }

        const newUser = await db
          .insert(USER_TABLE)
          .values({
            externalId,
            email,
            name: name || "Unknown",
          })
          .returning();

        console.log("Inserted new user:", newUser);
        return newUser;
      }
    );

    return { status: "Success", data: result };
  }
);
