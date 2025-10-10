/**
 * Test Course Generation Flow
 * Tests the complete course generation pipeline
 */

import dotenv from 'dotenv';
import { generateCourseContent } from './backend/configs/AiContentService.js';
import { randomUUID } from 'crypto';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function testCourseGeneration() {
  console.log("🧪 Testing Course Generation Flow...\n");

  const testCourseId = randomUUID();
  const testUserId = "test_user_" + Date.now();

  const courseParams = {
    courseId: testCourseId,
    userId: testUserId,
    topic: "Introduction to JavaScript",
    studyType: "practice",
    difficultyLevel: "beginner"
  };

  console.log("📝 Course Parameters:");
  console.log(JSON.stringify(courseParams, null, 2));
  console.log("\n🔄 Starting course generation...\n");

  try {
    await generateCourseContent(courseParams);
    console.log("\n✅ Course generation completed successfully!");
    console.log(`Course ID: ${testCourseId}`);
  } catch (error) {
    console.error("\n❌ Course generation failed:");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    if (error.stack) {
      console.error("\nStack trace:");
      console.error(error.stack);
    }
    if (error.cause) {
      console.error("\nCause:", error.cause);
    }
    process.exit(1);
  }
}

testCourseGeneration();