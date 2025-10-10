import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getCourseDetail, updateCourseProgress, deleteCourse } from "@/backend/server/course-service";
import { getCourseProgress } from "@/backend/server/progress-service";
import { z } from "zod";

const updateProgressSchema = z.object({
  progress: z.number().min(0).max(100),
  progressMetadata: z.object({
    completedChapters: z.array(z.string()).optional(),
    completedQuizzes: z.array(z.string()).optional(),
    lastAccessedChapter: z.string().optional(),
  }).optional(),
});

export async function GET(_request, { params }) {
  try {
    console.log("[GET /api/courses/[courseId]] Starting request");
    
    const { userId: clerkUserId } = await auth();
    console.log("[GET /api/courses/[courseId]] Clerk user ID:", clerkUserId);
    
    if (!clerkUserId) {
      console.log("[GET /api/courses/[courseId]] No user ID - unauthorized");
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Next.js 15 requires awaiting params
    const resolvedParams = await params;
    const { courseId } = resolvedParams || {};
    console.log("[GET /api/courses/[courseId]] Course ID:", courseId);

    if (!courseId) {
      console.log("[GET /api/courses/[courseId]] Missing courseId");
      return NextResponse.json(
        { success: false, error: "Missing courseId" },
        { status: 400 }
      );
    }

    console.log("[GET /api/courses/[courseId]] Fetching course detail from database");
    const course = await getCourseDetail(courseId);
    console.log("[GET /api/courses/[courseId]] Course found:", course ? "Yes" : "No");

    if (!course) {
      console.log("[GET /api/courses/[courseId]] Course not found in database");
      return NextResponse.json(
        { success: false, error: "Course not found" },
        { status: 404 }
      );
    }

    if (!course.userId) {
      console.warn(
        "[GET /api/courses/[courseId]] Course record missing userId. Falling back to access check via progress table."
      );

      const courseProgress = await getCourseProgress(clerkUserId, courseId);
      if (!courseProgress) {
        console.log("[GET /api/courses/[courseId]] No progress found for user - access denied");
        return NextResponse.json(
          { success: false, error: "Access denied" },
          { status: 403 }
        );
      }

      console.log("[GET /api/courses/[courseId]] Using progress record as ownership proof");
      return NextResponse.json(
        {
          success: true,
          data: course,
        },
        { status: 200 }
      );
    }

    console.log("[GET /api/courses/[courseId]] Course userId:", course.userId, "Clerk userId:", clerkUserId);
    
    // Check if user owns this course
    if (course.userId !== clerkUserId) {
      console.log("[GET /api/courses/[courseId]] Access denied - user mismatch");
      return NextResponse.json(
        { success: false, error: "Access denied" },
        { status: 403 }
      );
    }

    console.log("[GET /api/courses/[courseId]] Returning course data");
    return NextResponse.json(
      {
        success: true,
        data: course,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[GET /api/courses/[courseId]] Error fetching course detail:", error);
    console.error("[GET /api/courses/[courseId]] Error message:", error?.message);
    console.error("[GET /api/courses/[courseId]] Error stack:", error?.stack);
    console.error("[GET /api/courses/[courseId]] Error details:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch course detail" },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
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

    const body = await request.json();
    const validatedData = updateProgressSchema.parse(body);

    // Verify course ownership
    const course = await getCourseDetail(courseId);
    if (!course) {
      return NextResponse.json(
        { success: false, error: "Course not found" },
        { status: 404 }
      );
    }

    if (course.userId !== clerkUserId) {
      return NextResponse.json(
        { success: false, error: "Access denied" },
        { status: 403 }
      );
    }

    await updateCourseProgress(courseId, validatedData.progress, validatedData.progressMetadata);

    return NextResponse.json(
      {
        success: true,
        message: "Progress updated successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Invalid input data",
          details: error.errors
        },
        { status: 400 }
      );
    }

    console.error("Error updating course progress:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update progress" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
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

    // Verify course ownership before deletion
    const course = await getCourseDetail(courseId);
    if (!course) {
      return NextResponse.json(
        { success: false, error: "Course not found" },
        { status: 404 }
      );
    }

    if (course.userId !== clerkUserId) {
      return NextResponse.json(
        { success: false, error: "Access denied" },
        { status: 403 }
      );
    }

    await deleteCourse(courseId);

    return NextResponse.json(
      {
        success: true,
        message: "Course deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting course:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete course" },
      { status: 500 }
    );
  }
}