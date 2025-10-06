/**
 * Billing Page - Subscription Management
 * Shows current subscription status and provides upgrade/manage options
 */

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserByExternalId } from "@/backend/server/user-service";
import BillingContent from "./_components/BillingContent";

export const metadata = {
  title: "Billing - AI Learn",
  description: "Manage your subscription and billing information",
};

export default async function BillingPage({ searchParams }) {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }

  const user = await getUserByExternalId(userId);
  if (!user) {
    redirect("/sign-in");
  }

  const success = searchParams?.success === "true";
  const canceled = searchParams?.canceled === "true";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 animate-fade-in">
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        <div className="mb-12 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-primary-700 border border-primary/20 mb-6">
            <span className="w-2 h-2 bg-accent-500 rounded-full"></span>
            Billing & Subscription
          </div>
          <h1 className="text-5xl font-bold gradient-text mb-4">
            Billing & Subscription
          </h1>
          <p className="text-xl text-neutral-600">
            Manage your subscription and billing information
          </p>
        </div>

        <BillingContent
          user={user}
          success={success}
          canceled={canceled}
        />
      </div>
    </div>
  );
}
