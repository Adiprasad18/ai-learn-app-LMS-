import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { getUserByExternalId, upsertUser } from "@/backend/server/user-service";
import { getUserStats, getAllCoursesProgress } from "@/backend/server/progress-service";

export async function GET() {
  try {
    const { userId: clerkUserId } = await auth();
    
    if (!clerkUserId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    let user = await getUserByExternalId(clerkUserId);

    if (!user) {
      const clerkUser = await clerkClient.users.getUser(clerkUserId);

      user = await upsertUser({
        externalId: clerkUserId,
        email: clerkUser?.primaryEmailAddress?.emailAddress || "",
        name: clerkUser?.fullName
          || [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(" ")
          || clerkUser?.username
          || "User",
      });
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const [stats, coursesProgress] = await Promise.all([
      getUserStats(clerkUserId),
      getAllCoursesProgress(clerkUserId)
    ]);

    return NextResponse.json(
      {
        success: true,
        data: {
          stats,
          courses: coursesProgress
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch user stats" },
      { status: 500 }
    );
  }
}
