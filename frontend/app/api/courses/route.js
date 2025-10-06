import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { getCoursesForUser, insertCourse } from "@/backend/server/course-service";
import { getUserByExternalId, upsertUser } from "@/backend/server/user-service";
import { generateCourseContent } from "@/backend/configs/AiContentService";
import { randomUUID } from "crypto";
import { z } from "zod";

const createCourseSchema = z.object({
  topic: z.string().min(1, "Topic is required").max(500, "Topic too long"),
  studyType: z.enum(["exam", "job_interview", "practice", "coding", "other"]),
  difficultyLevel: z.enum(["beginner", "intermediate", "advanced"]),
});

const getDurationMs = (startTime) => Number(process.hrtime.bigint() - startTime) / 1e6;

const logDuration = (label, startTime, extra = "") => {
  const duration = getDurationMs(startTime);
  const suffix = extra ? ` ${extra}` : "";
  console.log(`[Perf] ${label} completed in ${duration.toFixed(2)}ms${suffix}`);
};

const withTiming = async (label, fn) => {
  const startTime = process.hrtime.bigint();
  try {
    return await fn();
  } finally {
    logDuration(label, startTime);
  }
};

export async function GET(request) {
  try {
    const authStart = process.hrtime.bigint();
    const { userId: clerkUserId } = await auth();
    logDuration("GET /api/courses – auth", authStart);
    
    if (!clerkUserId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userFetchStart = process.hrtime.bigint();
    let user = await getUserByExternalId(clerkUserId);
    logDuration("GET /api/courses – getUserByExternalId", userFetchStart);

    if (!user) {
      const clerkStart = process.hrtime.bigint();
      const clerkUser = await clerkClient.users.getUser(clerkUserId);
      logDuration("GET /api/courses – clerk users.getUser", clerkStart);

      const upsertStart = process.hrtime.bigint();
      user = await upsertUser({
        externalId: clerkUserId,
        email: clerkUser?.primaryEmailAddress?.emailAddress || "",
        name: clerkUser?.fullName
          || [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(" ")
          || clerkUser?.username
          || "User",
      });
      logDuration("GET /api/courses – upsertUser", upsertStart);
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found. Please sign in again." },
        { status: 404 }
      );
    }

    const coursesStart = process.hrtime.bigint();
    const courses = await getCoursesForUser(clerkUserId);
    logDuration("GET /api/courses – getCoursesForUser", coursesStart, `(count: ${courses.length})`);

    return NextResponse.json(
      {
        success: true,
        data: courses,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch courses" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    console.log("[POST /api/courses] Starting course creation request");
    const authStart = process.hrtime.bigint();
    
    const { userId: clerkUserId } = await auth();
    logDuration("POST /api/courses – auth", authStart);
    console.log("[POST /api/courses] Clerk user ID:", clerkUserId);
    
    if (!clerkUserId) {
      console.log("[POST /api/courses] No user ID - unauthorized");
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log("[POST /api/courses] Request body:", body);
    
    const validationStart = process.hrtime.bigint();
    const validatedData = createCourseSchema.parse(body);
    logDuration("POST /api/courses – validate body", validationStart);
    console.log("[POST /api/courses] Validated data:", validatedData);

    // Check if user exists, create if not
    const userFetchStart = process.hrtime.bigint();
    let user = await getUserByExternalId(clerkUserId);
    logDuration("POST /api/courses – getUserByExternalId", userFetchStart);
    console.log("[POST /api/courses] User from DB:", user ? "Found" : "Not found");

    if (!user) {
      console.log("[POST /api/courses] Creating new user from Clerk");
      const clerkStart = process.hrtime.bigint();
      const clerkUser = await clerkClient.users.getUser(clerkUserId);
      logDuration("POST /api/courses – clerk users.getUser", clerkStart);
      console.log("[POST /api/courses] Clerk user data:", {
        id: clerkUser?.id,
        email: clerkUser?.primaryEmailAddress?.emailAddress,
        name: clerkUser?.fullName
      });

      const upsertStart = process.hrtime.bigint();
      user = await upsertUser({
        externalId: clerkUserId,
        email: clerkUser?.primaryEmailAddress?.emailAddress || "",
        name: clerkUser?.fullName
          || [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(" ")
          || clerkUser?.username
          || "User",
      });
      logDuration("POST /api/courses – upsertUser", upsertStart);
      console.log("[POST /api/courses] User created:", user ? "Success" : "Failed");
    }

    if (!user) {
      console.log("[POST /api/courses] User still not found after upsert");
      return NextResponse.json(
        { success: false, error: "User not found. Please sign in again." },
        { status: 404 }
      );
    }

    // Check subscription limits for free users
    if (!user.isMember) {
      const limitCheckStart = process.hrtime.bigint();
      const existingCourses = await getCoursesForUser(clerkUserId);
      logDuration("POST /api/courses – getCoursesForUser (limit check)", limitCheckStart, `(count: ${existingCourses.length})`);
      console.log("[POST /api/courses] Existing courses count:", existingCourses.length);
      const FREE_COURSE_LIMIT = 10;
      if (existingCourses.length >= FREE_COURSE_LIMIT) {
        console.log("[POST /api/courses] Course limit reached");
        return NextResponse.json(
          {
            success: true,
            data: {
              limitReached: true,
              message: `You've reached the free course creation limit of ${FREE_COURSE_LIMIT}. Please upgrade to create more courses.`,
              code: "SUBSCRIPTION_LIMIT",
            },
          },
          { status: 200 }
        );
      }
    }

    const courseId = randomUUID();
    console.log("[POST /api/courses] Generated course ID:", courseId);

    // Insert placeholder course record immediately so polling can find it
    console.log("[POST /api/courses] Inserting placeholder course record");
    const insertStart = process.hrtime.bigint();
    try {
      await insertCourse({
        id: courseId,
        userId: clerkUserId,
        title: `${validatedData.topic} - ${validatedData.studyType}`,
        topic: validatedData.topic,
        studyType: validatedData.studyType,
        difficultyLevel: validatedData.difficultyLevel,
        status: "generating",
        progress: 0,
        summary: null,
      });
      logDuration("POST /api/courses – insertCourse", insertStart);
      console.log("[POST /api/courses] Placeholder course record inserted");
    } catch (insertError) {
      logDuration("POST /api/courses – insertCourse (failed)", insertStart);
      console.error("[POST /api/courses] Failed to insert placeholder course:", insertError);
      return NextResponse.json(
        { success: false, error: "Failed to create course record" },
        { status: 500 }
      );
    }

    // Start course generation in background
    console.log("[POST /api/courses] Starting background course generation");
    const generationStart = process.hrtime.bigint();
    generateCourseContent({
      courseId,
      userId: clerkUserId,
      topic: validatedData.topic,
      studyType: validatedData.studyType,
      difficultyLevel: validatedData.difficultyLevel,
    }).then(() => {
      logDuration("POST /api/courses – generateCourseContent (async)", generationStart);
    }).catch(error => {
      logDuration("POST /api/courses – generateCourseContent (async error)", generationStart);
      console.error("[POST /api/courses] Background course generation failed:", error);
    });

    console.log("[POST /api/courses] Returning success response");
    return NextResponse.json(
      {
        success: true,
        data: { courseId },
        message: "Course creation started. You'll be notified when it's ready."
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.log("[POST /api/courses] Validation error:", error.errors);
      return NextResponse.json(
        { 
          success: false, 
          error: "Invalid input data",
          details: error.errors
        },
        { status: 400 }
      );
    }

    console.error("[POST /api/courses] Error creating course:", error);
    console.error("[POST /api/courses] Error stack:", error.stack);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create course" },
      { status: 500 }
    );
  }
}
