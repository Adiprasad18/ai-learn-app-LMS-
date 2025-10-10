import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getCourseWithContent } from "@/backend/server/course-service";

export async function GET(_request, { params }) {
  try {
    const { userId: clerkUserId } = await auth();
    
    if (!clerkUserId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Next.js 15 requires awaiting params
    const resolvedParams = await params;
    const { courseId } = resolvedParams || {};

    if (!courseId) {
      return NextResponse.json(
        { success: false, error: "Missing courseId" },
        { status: 400 }
      );
    }

    const courseContent = await getCourseWithContent(courseId);

    if (!courseContent) {
      return NextResponse.json(
        { success: false, error: "Course not found" },
        { status: 404 }
      );
    }

    // Check if user owns this course
    if (courseContent.userId !== clerkUserId) {
      return NextResponse.json(
        { success: false, error: "Access denied" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: courseContent,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching course content:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch course content" },
      { status: 500 }
    );
  }
}