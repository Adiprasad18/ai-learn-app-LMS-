import { serve } from "inngest/next";
import { helloWorld, CreateNewUser } from "@/backend/inngest/functions";
import { inngest } from "@/backend/inngest/client";

export const GET = serve({
  client: inngest,
  functions: [helloWorld, CreateNewUser],
});
export const POST = GET;
export const PUT = GET;
 
