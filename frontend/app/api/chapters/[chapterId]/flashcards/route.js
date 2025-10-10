import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/backend/configs/db";
import { CHAPTER_TABLE, FLASHCARD_TABLE, COURSE_TABLE } from "@/backend/configs/schema";
import { eq } from "drizzle-orm";
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
            flashcards: true,
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

    // Return all course flashcards
    const flashcards = chapter.course.flashcards || [];

    return NextResponse.json(
      {
        success: true,
        data: flashcards,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching chapter flashcards:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch flashcards" },
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

    // Generate flashcards
    const flashcardsData = await contentGenerator.generateFlashcards({
      topic: chapter.course.topic,
      chapter: {
        title: chapter.title,
        summary: chapter.summary,
        content: chapter.notes?.[0]?.content || "",
      },
      count: 8,
    });

    // Save flashcards to database
    const savedFlashcards = [];
    for (const card of flashcardsData) {
      const [flashcard] = await db.insert(FLASHCARD_TABLE).values({
        courseId: chapter.course.id,
        front: card.front,
        back: card.back,
      }).returning();
      
      savedFlashcards.push(flashcard);
    }

    return NextResponse.json(
      {
        success: true,
        data: savedFlashcards,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error generating chapter flashcards:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate flashcards" },
      { status: 500 }
    );
  }
}