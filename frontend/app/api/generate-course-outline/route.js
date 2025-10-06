import { NextResponse } from "next/server";
import { generateCourseContent } from "@/backend/configs/AiContentService";
import { getCourseById } from "@/backend/server/course-service";

export async function POST(req) {
  const startTime = Date.now();
  
  try {
    const body = await req.json();

    const { courseId, topic, studyType, difficultyLevel, userId } = body;

    // Enhanced validation
    if (!courseId || !topic || !studyType || !difficultyLevel || !userId) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Missing required fields",
          required: ["courseId", "topic", "studyType", "difficultyLevel", "userId"]
        },
        { status: 400 }
      );
    }

    // Validate course exists and belongs to user
    const existingCourse = await getCourseById(courseId);
    if (!existingCourse) {
      return NextResponse.json(
        { success: false, error: "Course not found" },
        { status: 404 }
      );
    }

    if (existingCourse.userId !== userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access to course" },
        { status: 403 }
      );
    }

    // Check if course is already being generated
    if (existingCourse.status === 'generating') {
      return NextResponse.json(
        { 
          success: false, 
          error: "Course generation already in progress",
          status: existingCourse.status
        },
        { status: 409 }
      );
    }

    console.log(`Starting course generation for courseId: ${courseId}, topic: ${topic}`);

    // Generate course content with enhanced error handling
    const result = await generateCourseContent({
      courseId,
      userId,
      topic,
      studyType,
      difficultyLevel,
    });

    const duration = Date.now() - startTime;
    console.log(`Course generation completed in ${duration}ms for courseId: ${courseId}`);

    return NextResponse.json({ 
      success: true, 
      courseId,
      generationTime: duration,
      message: "Course content generated successfully"
    }, { status: 200 });

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`Error in generate-course-outline API (${duration}ms):`, {
      error: error.message,
      stack: error.stack,
      courseId: body?.courseId,
      userId: body?.userId
    });

    // Determine appropriate error response based on error type
    let statusCode = 500;
    let errorMessage = "Failed to generate course";

    if (error.message?.includes('AI service')) {
      statusCode = 503;
      errorMessage = "AI service temporarily unavailable";
    } else if (error.message?.includes('database')) {
      statusCode = 503;
      errorMessage = "Database service temporarily unavailable";
    } else if (error.message?.includes('validation')) {
      statusCode = 400;
      errorMessage = error.message;
    }

    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        generationTime: duration
      },
      { status: statusCode }
    );
  }
}
