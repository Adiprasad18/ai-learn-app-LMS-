import React from 'react';
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserByExternalId, upsertUser } from "@/backend/server/user-service";
import WelcomeBanner from './_components/WelcomeBanner';
import DashboardContent from './_components/DashboardContent';

export const metadata = {
  title: "Dashboard - AI Learn",
  description: "Your learning dashboard with courses and progress",
};

async function Dashboard({ searchParams }) {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }

  let user = await getUserByExternalId(userId);

  if (!user) {
    const clerkUser = await currentUser();

    user = await upsertUser({
      externalId: userId,
      email: clerkUser?.primaryEmailAddress?.emailAddress || "",
      name: clerkUser?.fullName
        || [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(" ")
        || clerkUser?.username
        || "User",
    });
  }

  if (!user) {
    redirect("/sign-in");
  }

  const resolvedSearchParams = await searchParams;
  const success = resolvedSearchParams?.success === "true";

  return (
    <div className="space-y-8 animate-fade-in">
      <WelcomeBanner user={user} success={success} />
      <DashboardContent user={user} />
    </div>
  );
}

export default Dashboard;
