/**
 * Streaming Course Generation API
 * Provides real-time updates during course content generation
 */

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import contentGenerator from "@/backend/ai/content-generator";
import { getCourseById, updateCourseStatus } from "@/backend/server/course-service";
import telemetryService from "@/backend/services/telemetry-service";

export async function GET(request, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Next.js 15 requires awaiting params
    const resolvedParams = await params;
    const { courseId } = resolvedParams;
    if (!courseId) {
      return NextResponse.json({ error: "Course ID is required" }, { status: 400 });
    }

    // Get course details
    const course = await getCourseById(courseId);
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Verify ownership
    if (course.userId !== userId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Check if course is already ready
    if (course.status === 'ready') {
      return NextResponse.json({ 
        error: "Course is already generated",
        status: course.status 
      }, { status: 400 });
    }

    // Set up Server-Sent Events stream
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const sendEvent = (data) => {
          const message = `data: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(encoder.encode(message));
        };

        const sendError = (error) => {
          sendEvent({
            type: 'error',
            error: error.message,
            timestamp: new Date().toISOString()
          });
          controller.close();
        };

        const sendComplete = () => {
          sendEvent({
            type: 'complete',
            timestamp: new Date().toISOString()
          });
          controller.close();
        };

        try {
          // Update course status to generating
          await updateCourseStatus(courseId, 'generating');

          sendEvent({
            type: 'status',
            message: 'Starting course generation...',
            progress: 0,
            timestamp: new Date().toISOString()
          });

          // Generate course content with progress updates
          const result = await contentGenerator.generateFullCourse({
            courseId,
            userId,
            topic: course.topic,
            studyType: course.studyType,
            difficultyLevel: course.difficultyLevel,
            onProgress: (progress) => {
              sendEvent({
                type: 'progress',
                ...progress,
                timestamp: new Date().toISOString()
              });
            }
          });

          // Update course status to ready
          await updateCourseStatus(courseId, 'ready');

          sendEvent({
            type: 'success',
            message: 'Course generation completed successfully!',
            progress: 100,
            result: {
              chaptersCount: result.chapters?.length || 0,
              totalFlashcards: result.chapters?.reduce((sum, ch) => sum + (ch.flashcards?.length || 0), 0) || 0,
              totalQuizQuestions: result.chapters?.reduce((sum, ch) => sum + (ch.quiz?.questions?.length || 0), 0) || 0
            },
            timestamp: new Date().toISOString()
          });

          sendComplete();

        } catch (error) {
          console.error('Streaming course generation error:', error);
          
          // Update course status to failed
          await updateCourseStatus(courseId, 'failed');
          
          telemetryService.recordEvent('streaming_course_generation_failed', {
            courseId,
            userId,
            error: error.message
          });

          sendError(error);
        }
      },

      cancel() {
        console.log('Stream cancelled by client');
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });

  } catch (error) {
    console.error('Stream setup error:', error);
    return NextResponse.json(
      { error: "Failed to start streaming generation" },
      { status: 500 }
    );
  }
}

export async function POST(request, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Next.js 15 requires awaiting params
    const resolvedParams = await params;
    const { courseId } = resolvedParams;
    if (!courseId) {
      return NextResponse.json({ error: "Course ID is required" }, { status: 400 });
    }

    // Get course details
    const course = await getCourseById(courseId);
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Verify ownership
    if (course.userId !== userId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Parse request body for any additional options
    const body = await request.json().catch(() => ({}));
    const { regenerate = false } = body;

    // Check if course is already ready and not regenerating
    if (course.status === 'ready' && !regenerate) {
      return NextResponse.json({ 
        error: "Course is already generated. Use regenerate=true to regenerate.",
        status: course.status 
      }, { status: 400 });
    }

    // Start background generation (non-streaming)
    try {
      await updateCourseStatus(courseId, 'generating');

      // Generate course content
      const result = await contentGenerator.generateFullCourse({
        courseId,
        userId,
        topic: course.topic,
        studyType: course.studyType,
        difficultyLevel: course.difficultyLevel
      });

      await updateCourseStatus(courseId, 'ready');

      return NextResponse.json({
        success: true,
        message: "Course generation completed",
        result: {
          chaptersCount: result.chapters?.length || 0,
          totalFlashcards: result.chapters?.reduce((sum, ch) => sum + (ch.flashcards?.length || 0), 0) || 0,
          totalQuizQuestions: result.chapters?.reduce((sum, ch) => sum + (ch.quiz?.questions?.length || 0), 0) || 0
        }
      });

    } catch (error) {
      await updateCourseStatus(courseId, 'failed');
      throw error;
    }

  } catch (error) {
    console.error('Course generation error:', error);
    
    telemetryService.recordEvent('course_generation_api_failed', {
      courseId: params.courseId,
      userId: (await auth()).userId,
      error: error.message
    });

    return NextResponse.json(
      { error: error.message || "Failed to generate course" },
      { status: 500 }
    );
  }
}