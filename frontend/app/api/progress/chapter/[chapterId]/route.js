import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getUserByExternalId } from "@/backend/server/user-service";
import { 
  markChapterCompleted, 
  markChapterIncomplete, 
  updateChapterAccess,
  getChapterProgress 
} from "@/backend/server/progress-service";

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

    const { chapterId } = await params;
    
    if (!chapterId) {
      return NextResponse.json(
        { success: false, error: "Chapter ID is required" },
        { status: 400 }
      );
    }

    const progress = await getChapterProgress(clerkUserId, chapterId);

    return NextResponse.json(
      {
        success: true,
        data: progress,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching chapter progress:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch chapter progress" },
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

    const user = await getUserByExternalId(clerkUserId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const { chapterId } = await params;
    const { action, completed } = await request.json();
    
    if (!chapterId) {
      return NextResponse.json(
        { success: false, error: "Chapter ID is required" },
        { status: 400 }
      );
    }

    let result;

    switch (action) {
      case "complete":
        result = await markChapterCompleted(clerkUserId, chapterId);
        break;
      case "incomplete":
        result = await markChapterIncomplete(clerkUserId, chapterId);
        break;
      case "access":
        result = await updateChapterAccess(clerkUserId, chapterId);
        break;
      case "toggle":
        if (typeof completed === "boolean") {
          result = completed 
            ? await markChapterCompleted(clerkUserId, chapterId)
            : await markChapterIncomplete(clerkUserId, chapterId);
        } else {
          return NextResponse.json(
            { success: false, error: "Completed status is required for toggle action" },
            { status: 400 }
          );
        }
        break;
      default:
        return NextResponse.json(
          { success: false, error: "Invalid action. Use: complete, incomplete, access, or toggle" },
          { status: 400 }
        );
    }

    return NextResponse.json(
      {
        success: true,
        data: result,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating chapter progress:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update chapter progress" },
      { status: 500 }
    );
  }
}