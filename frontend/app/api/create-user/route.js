import { NextResponse } from "next/server";
import { inngest } from "@/backend/inngest/client";

export async function POST(req) {
  try {
    let body;

    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON format" },
        { status: 400 }
      );
    }

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, error: "Request body must be a JSON object" },
        { status: 400 }
      );
    }

    const { externalId, email, name } = body;

    if (!externalId || typeof externalId !== "string") {
      return NextResponse.json(
        { success: false, error: "externalId is required" },
        { status: 400 }
      );
    }

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "Valid email is required" },
        { status: 400 }
      );
    }

    if (name && typeof name !== "string") {
      return NextResponse.json(
        { success: false, error: "Name must be a string if provided" },
        { status: 400 }
      );
    }

    const result = await inngest.send({
      name: "user.create",
      data: {
        externalId,
        email,
        name: name?.trim() || "Unknown",
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "User creation event sent successfully",
        result,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error creating user:", error);

    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
