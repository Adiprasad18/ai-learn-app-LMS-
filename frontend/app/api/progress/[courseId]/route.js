import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getUserByExternalId } from "@/backend/server/user-service";
import { getCourseProgress } from "@/backend/server/progress-service";

export async function GET(request, { params }) {
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

    const { courseId } = await params;
    
    if (!courseId) {
      return NextResponse.json(
        { success: false, error: "Course ID is required" },
        { status: 400 }
      );
    }

    const progress = await getCourseProgress(clerkUserId, courseId);
    
    if (!progress) {
      return NextResponse.json(
        { success: false, error: "Course not found or no access" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: progress,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching course progress:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch course progress" },
      { status: 500 }
    );
  }
}