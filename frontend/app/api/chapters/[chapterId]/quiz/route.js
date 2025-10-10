import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/backend/configs/db";
import { CHAPTER_TABLE, QUIZ_TABLE, COURSE_TABLE } from "@/backend/configs/schema";
import { eq, and } from "drizzle-orm";
import contentGenerator from "@/backend/ai/content-generator";

export async function GET(_request, { params }) {
  try {
    const { userId: clerkUserId } = await auth();
    
    if (!clerkUserId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const { chapterId } = resolvedParams || {};

    if (!chapterId) {
      return NextResponse.json(
        { success: false, error: "Missing chapterId" },
        { status: 400 }
      );
    }

    // Get chapter with course info
    const chapter = await db.query.CHAPTER_TABLE.findFirst({
      where: eq(CHAPTER_TABLE.id, chapterId),
      with: {
        course: {
          with: {
            quizzes: true,
          },
        },
      },
    });

    if (!chapter) {
      return NextResponse.json(
        { success: false, error: "Chapter not found" },
        { status: 404 }
      );
    }

    // Check if user owns this course
    if (chapter.course.userId !== clerkUserId) {
      return NextResponse.json(
        { success: false, error: "Access denied" },
        { status: 403 }
      );
    }

    // Filter quizzes for this chapter (we'll add a chapterId field to quiz table later)
    // For now, return all course quizzes
    const quizzes = chapter.course.quizzes || [];

    return NextResponse.json(
      {
        success: true,
        data: quizzes,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching chapter quiz:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch quiz" },
      { status: 500 }
    );
  }
}

export async function POST(_request, { params }) {
  try {
    const { userId: clerkUserId } = await auth();
    
    if (!clerkUserId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const { chapterId } = resolvedParams || {};

    if (!chapterId) {
      return NextResponse.json(
        { success: false, error: "Missing chapterId" },
        { status: 400 }
      );
    }

    // Get chapter with course info
    const chapter = await db.query.CHAPTER_TABLE.findFirst({
      where: eq(CHAPTER_TABLE.id, chapterId),
      with: {
        course: true,
        notes: true,
      },
    });

    if (!chapter) {
      return NextResponse.json(
        { success: false, error: "Chapter not found" },
        { status: 404 }
      );
    }

    // Check if user owns this course
    if (chapter.course.userId !== clerkUserId) {
      return NextResponse.json(
        { success: false, error: "Access denied" },
        { status: 403 }
      );
    }

    // Generate quiz questions
    const quizData = await contentGenerator.generateQuiz({
      topic: chapter.course.topic,
      chapter: {
        title: chapter.title,
        summary: chapter.summary,
        content: chapter.notes?.[0]?.content || "",
      },
      difficultyLevel: chapter.course.difficultyLevel,
      count: 5,
    });

    // Save quiz questions to database
    const savedQuizzes = [];
    for (const question of quizData.questions) {
      const [quiz] = await db.insert(QUIZ_TABLE).values({
        courseId: chapter.course.id,
        question: question.prompt,
        options: question.options,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
      }).returning();
      
      savedQuizzes.push(quiz);
    }

    return NextResponse.json(
      {
        success: true,
        data: savedQuizzes,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error generating chapter quiz:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate quiz" },
      { status: 500 }
    );
  }
}