import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/backend/configs/db";
import { NOTE_TABLE, CHAPTER_TABLE } from "@/backend/configs/schema";
import { like, or, eq, inArray } from "drizzle-orm";

export async function POST() {
  try {
    console.log('[cleanup-bad-notes] Starting cleanup...');
    
    const { userId: clerkUserId } = await auth();
    
    if (!clerkUserId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Find notes that contain error messages
    const badNotes = await db
      .select()
      .from(NOTE_TABLE)
      .where(
        or(
          like(NOTE_TABLE.content, '%JSON parsing failed%'),
          like(NOTE_TABLE.content, '%Failed to parse AI JSON response%'),
          like(NOTE_TABLE.content, '%AiResponseParseError%')
        )
      );

    console.log(`[cleanup-bad-notes] Found ${badNotes.length} bad notes`);

    if (badNotes.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No bad notes found",
        deletedCount: 0
      });
    }

    // Get chapter IDs to verify ownership
    const chapterIds = [...new Set(badNotes.map(note => note.chapterId))];
    const chapters = await db
      .select()
      .from(CHAPTER_TABLE)
      .where(inArray(CHAPTER_TABLE.id, chapterIds));

    console.log(`[cleanup-bad-notes] Found ${chapters.length} chapters`);

    // Delete the bad notes
    const noteIds = badNotes.map(note => note.id);
    
    for (const noteId of noteIds) {
      await db
        .delete(NOTE_TABLE)
        .where(eq(NOTE_TABLE.id, noteId));
      console.log(`[cleanup-bad-notes] Deleted note ${noteId}`);
    }

    console.log(`[cleanup-bad-notes] Successfully deleted ${badNotes.length} bad notes`);

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${badNotes.length} bad note(s)`,
      deletedCount: badNotes.length,
      affectedChapters: chapterIds
    });

  } catch (error) {
    console.error('[cleanup-bad-notes] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to cleanup notes" },
      { status: 500 }
    );
  }
}