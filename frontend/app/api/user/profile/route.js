import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getUserByExternalId } from "@/backend/server/user-service";

export async function GET() {
  try {
    const { userId: clerkUserId } = await auth();
    
    if (!clerkUserId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await getUserByExternalId(clerkUserId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Return user profile data
    const profileData = {
      id: user.id,
      email: user.email,
      name: user.name,
      isMember: user.isMember || false,
      subscriptionStatus: user.subscriptionStatus || "inactive",
      stripeCustomerId: user.stripeCustomerId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    return NextResponse.json(
      {
        success: true,
        data: profileData,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch user profile" },
      { status: 500 }
    );
  }
}
