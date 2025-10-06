import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/backend/configs/db";
import { CHAPTER_TABLE, NOTE_TABLE, COURSE_TABLE } from "@/backend/configs/schema";
import { eq } from "drizzle-orm";
import contentGenerator from "@/backend/ai/content-generator";

export async function POST(_request, { params }) {
  try {
    const { userId: clerkUserId } = await auth();
    
    if (!clerkUserId) {
      console.error("[generate-content] Unauthorized access attempt");
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const { chapterId } = resolvedParams || {};

    if (!chapterId) {
      console.error("[generate-content] Missing chapterId");
      return NextResponse.json(
        { success: false, error: "Missing chapterId" },
        { status: 400 }
      );
    }

    console.log(`[generate-content] Starting generation for chapter: ${chapterId}`);

    // Get chapter with course info
    const chapter = await db.query.CHAPTER_TABLE.findFirst({
      where: eq(CHAPTER_TABLE.id, chapterId),
      with: {
        course: true,
      },
    });

    if (!chapter) {
      console.error(`[generate-content] Chapter not found: ${chapterId}`);
      return NextResponse.json(
        { success: false, error: "Chapter not found" },
        { status: 404 }
      );
    }

    // Check if user owns this course
    if (chapter.course.userId !== clerkUserId) {
      console.error(`[generate-content] Access denied for user ${clerkUserId} to chapter ${chapterId}`);
      return NextResponse.json(
        { success: false, error: "Access denied" },
        { status: 403 }
      );
    }

    console.log(`[generate-content] Generating content for: "${chapter.title}" in course "${chapter.course.title}"`);

    // Check if API key is available
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error(`[generate-content] GEMINI_API_KEY is not set in environment`);
      return NextResponse.json(
        { 
          success: false, 
          error: "AI service not configured. Please set GEMINI_API_KEY environment variable.",
          details: "Missing GEMINI_API_KEY"
        },
        { status: 500 }
      );
    }
    console.log(`[generate-content] API key found: ${apiKey.substring(0, 10)}...`);

    // Generate chapter content
    let chapterContent = null;
    let lastError = null;
    let fullRawContent = "";
    
    try {
      console.log(`[generate-content] Generating content...`);

      const result = await contentGenerator.generateNotes({
        title: chapter.course.title
      }, {
        title: chapter.title,
        summary: chapter.summary || "Chapter content",
      }, {
        maxRetries: 3,
        backoffMs: 1000
      });
      console.log(`[generate-content] Content generated successfully`);

      chapterContent = result.parsed;
      fullRawContent = result.raw;
      console.log(`[generate-content] Successfully parsed content:`, {
        notesType: typeof chapterContent.notes,
        keyPointsCount: chapterContent.notes.keyPoints?.length || 0,
        summaryLength: chapterContent.notes.summary?.length || 0
      });
      
    } catch (generationError) {
      console.error(`[generate-content] Generation error:`, generationError);
      console.error(`[generate-content] Generation error stack:`, generationError.stack);
      lastError = generationError.message || "Unknown generation error";
      fullRawContent = generationError.message?.includes('Raw response:') ?
        generationError.message.split('Raw response:')[1]?.trim() : '';
    }

    // Validate we got content
    if (!chapterContent || !chapterContent.notes) {
      const errorMsg = lastError || "Failed to generate chapter content - no valid content received";
      console.error(`[generate-content] Generation failed:`, {
        error: errorMsg,
        hadContent: !!chapterContent,
        rawPreview: fullRawContent ? fullRawContent.substring(0, 500) : undefined
      });

      const responseBody = {
        success: false,
        error: errorMsg,
        details: {
          lastError
        }
      };

      // Always include raw content for debugging when generation fails
      if (fullRawContent) {
        responseBody.raw = fullRawContent;
        console.error(`[generate-content] Including raw content in error response, length:`, fullRawContent.length);
      }

      return NextResponse.json(responseBody, { status: 500 });
    }

    console.log(`[generate-content] Saving content to database for chapter ${chapterId}`);

    // Convert notes object to markdown string
    const notesToMarkdown = (notes) => {
      let markdown = '';

      if (notes.summary) {
        markdown += `## Summary\n\n${notes.summary}\n\n`;
      }

      if (notes.keyPoints && notes.keyPoints.length > 0) {
        markdown += `## Key Points\n\n`;
        notes.keyPoints.forEach((point, index) => {
          markdown += `${index + 1}. **${point.point}**\n   ${point.explanation}\n\n`;
        });
      }

      if (notes.examples && notes.examples.length > 0) {
        markdown += `## Examples\n\n`;
        notes.examples.forEach((example, index) => {
          markdown += `### ${example.concept}\n${example.example}\n\n`;
        });
      }

      if (notes.quiz && notes.quiz.length > 0) {
        markdown += `## Practice Quiz\n\n`;
        notes.quiz.forEach((question, index) => {
          markdown += `${index + 1}. ${question.question}\n   **Answer:** ${question.answer}\n\n`;
        });
      }

      if (notes.difficultyGuidance) {
        markdown += `## Study Guidance\n\n`;
        if (notes.difficultyGuidance.general) {
          markdown += `**General Tips:** ${notes.difficultyGuidance.general}\n\n`;
        }
        if (notes.difficultyGuidance.challengingTopics && notes.difficultyGuidance.challengingTopics.length > 0) {
          markdown += `**Challenging Topics:** ${notes.difficultyGuidance.challengingTopics.join(', ')}\n\n`;
        }
      }

      return markdown.trim();
    };

    const markdownContent = notesToMarkdown(chapterContent.notes);

    // Save the generated content to the database
    await db.insert(NOTE_TABLE).values({
      chapterId: chapterId,
      content: markdownContent,
    });

    console.log(`[generate-content] Successfully saved content for chapter ${chapterId}`);

    return NextResponse.json(
      {
        success: true,
        data: {
          content: markdownContent,
          keyPoints: chapterContent.notes.keyPoints || [],
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[generate-content] Unexpected error:", error);
    console.error("[generate-content] Error stack:", error.stack);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || "Failed to generate content",
        details: error.stack
      },
      { status: 500 }
    );
  }
}
