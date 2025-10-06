import { randomUUID } from "crypto";
import { inngest } from "../inngest/client.js";
import telemetryService from "../services/telemetry-service.js";
import contentGenerator from "../ai/content-generator.js";
import { db } from "./db.js";
import { COURSE_TABLE } from "./schema.js";
import { eq } from "drizzle-orm";
import {
  insertChapters,
  insertCourse,
  insertFlashcards,
  insertNotes,
  insertQuizzes,
  updateCourseStatus,
  updateCourseSummary,
} from "../server/course-service.js";

const extractSummary = (payload) => {
  if (!payload) return "";
  if (typeof payload === "string") return payload.trim();
  if (typeof payload.summary === "string") return payload.summary.trim();
  return "";
};

const extractChapterNotes = (payload) => {
  if (!payload) return "";

  if (typeof payload === "string") {
    return payload.trim();
  }

  let content = "";

  if (typeof payload.notes === "string") {
    content = payload.notes;
  } else if (Array.isArray(payload.notes)) {
    content = payload.notes.join("\n");
  } else if (typeof payload.content === "string") {
    content = payload.content;
  }

  const keyPoints = Array.isArray(payload.keyPoints)
    ? payload.keyPoints
    : Array.isArray(payload.keypoints)
    ? payload.keypoints
    : [];

  if (keyPoints.length) {
    const keyPointSection = keyPoints.map((point) => `- ${point}`).join("\n");
    content = content
      ? `${content.trim()}\n\n### Key Points\n${keyPointSection}`
      : `### Key Points\n${keyPointSection}`;
  }

  return content.trim();
};

const extractFlashcards = (payload) => {
  const cards = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.cards)
    ? payload.cards
    : Array.isArray(payload?.flashcards)
    ? payload.flashcards
    : [];

  return cards
    .map((card) => ({
      front: typeof card.front === "string" ? card.front.trim() : "",
      back: typeof card.back === "string" ? card.back.trim() : "",
    }))
    .filter((card) => card.front && card.back);
};

const extractQuizQuestions = (payload) => {
  const questions = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.questions)
    ? payload.questions
    : [];

  return questions
    .map((question, index) => {
      const prompt =
        typeof question.prompt === "string"
          ? question.prompt.trim()
          : typeof question.question === "string"
          ? question.question.trim()
          : `Question ${index + 1}`;

      const options = Array.isArray(question.options)
        ? question.options.map((option) => option?.toString()?.trim() ?? "").filter(Boolean)
        : [];

      const correctAnswer =
        typeof question.correctAnswer === "string"
          ? question.correctAnswer.trim()
          : typeof question.answer === "string"
          ? question.answer.trim()
          : "";

      const explanation =
        typeof question.explanation === "string" ? question.explanation.trim() : "";

      if (!prompt || options.length < 2 || !correctAnswer) {
        return null;
      }

      return {
        prompt,
        options,
        correctAnswer,
        explanation,
      };
    })
    .filter(Boolean);
};

export async function generateCourseContent({
  courseId,
  userId,
  topic,
  studyType,
  difficultyLevel,
}) {
  const generationTimer = telemetryService.startTimer('course_generation', {
    courseId,
    userId,
    topic,
    studyType,
    difficultyLevel
  });

  const stats = {
    chaptersGenerated: 0,
    notesGenerated: 0,
    flashcardsGenerated: 0,
    quizzesGenerated: 0,
    errors: 0,
    warnings: 0
  };

  try {
    console.log(`Starting course generation for courseId: ${courseId}, topic: ${topic}`);
    telemetryService.recordEvent('course_generation_started', {
      courseId,
      userId,
      topic,
      studyType,
      difficultyLevel
    });

    const outline = await contentGenerator.generateCourseOutline({
      topic,
      studyType,
      difficultyLevel,
      options: { maxRetries: 3, backoffMs: 800 }
    });

    if (!outline) {
      throw new Error("AI did not return a course outline payload.");
    }

    const courseTitle = outline?.title?.trim() || topic;
    const initialSummary = extractSummary(outline);

    await insertCourse({
      id: courseId,
      userId,
      title: courseTitle,
      topic,
      studyType,
      difficultyLevel,
      summary: initialSummary,
      status: "generating",
    });

    const chapters = Array.isArray(outline?.chapters) ? outline.chapters : [];

    telemetryService.recordMetric("course_outline_chapter_count", chapters.length, {
      courseId,
      userId
    });

    const chapterEntries = chapters.map((chapter, index) => {
      const chapterId = randomUUID();
      return {
        chapter,
        record: {
          id: chapterId,
          courseId,
          title: chapter?.title?.trim() || `Chapter ${index + 1}`,
          summary: chapter?.summary?.trim() || "",
          order: index + 1,
        },
      };
    });

    if (chapterEntries.length) {
      await insertChapters(chapterEntries.map(({ record }) => record));
    }

    const notesData = [];
    const flashcardsData = [];
    const quizzesData = [];

    // Generate content for each chapter using enhanced AI services
    for (const { chapter, record } of chapterEntries) {
      try {
        // Generate chapter notes
        const notesTimer = telemetryService.startTimer('chapter_notes_generation', {
          courseId,
          chapterId: record.id,
          chapterOrder: record.order
        });

        const chapterContentStream = contentGenerator.generateChapterContentStream({
          courseTitle,
          chapter,
          options: { maxRetries: 3, backoffMs: 500 }
        });

        let chapterContent = null;
        for await (const chunk of chapterContentStream) {
          telemetryService.recordMetric('chapter_notes_stream_chunk', 1, {
            courseId,
            chapterId: record.id,
            chunkType: chunk.type
          });

          if (chunk.type === 'complete' && chunk.parsedContent) {
            chapterContent = chunk.parsedContent;
            break;
          }
        }

        if (chapterContent && chapterContent.notes) {
          const formattedNotes = extractChapterNotes(chapterContent);
          if (formattedNotes) {
            notesData.push({
              chapterId: record.id,
              content: formattedNotes,
            });
            stats.notesGenerated++;
            const notesDuration = notesTimer.end({ success: true });
            telemetryService.recordEvent('chapter_notes_generated', {
              courseId,
              chapterId: record.id,
              duration: notesDuration,
              contentLength: formattedNotes.length
            });
          } else {
            const notesDuration = notesTimer.end({ success: false, error: 'empty_notes' });
            telemetryService.recordEvent('chapter_notes_missing', {
              courseId,
              chapterId: record.id,
              duration: notesDuration
            });
          }
        } else {
          const notesDuration = notesTimer.end({ success: false, error: 'missing_notes_field' });
          telemetryService.recordEvent('chapter_notes_missing', {
            courseId,
            chapterId: record.id,
            duration: notesDuration
          });
        }

        const flashcardsTask = (async () => {
          const flashcardsTimer = telemetryService.startTimer("chapter_flashcards_generation", {
            courseId,
            chapterId: record.id,
            chapterOrder: record.order
          });

          try {
            const flashcards = await contentGenerator.generateFlashcards({
              topic,
              chapter,
              count: 8,
              options: { maxRetries: 2, backoffMs: 400 }
            });

            if (flashcards && flashcards.length) {
              flashcardsData.push(
                ...flashcards.map((card) => ({
                  courseId,
                  front: card.front,
                  back: card.back,
                }))
              );
              stats.flashcardsGenerated += flashcards.length;

              telemetryService.recordMetric("chapter_flashcards_count", flashcards.length, {
                courseId,
                chapterId: record.id
              });

              const flashcardsDuration = flashcardsTimer.end({ success: true });
              telemetryService.recordEvent("chapter_flashcards_generated", {
                courseId,
                chapterId: record.id,
                duration: flashcardsDuration,
                flashcardsCount: flashcards.length
              });
            } else {
              stats.warnings++;
              const flashcardsDuration = flashcardsTimer.end({ success: false, error: "empty_flashcards" });
              telemetryService.recordEvent("chapter_flashcards_missing", {
                courseId,
                chapterId: record.id,
                duration: flashcardsDuration
              });
            }
          } catch (flashcardError) {
            const flashcardsDuration = flashcardsTimer.end({ success: false, error: flashcardError.message });
            telemetryService.recordEvent("chapter_flashcards_failed", {
              courseId,
              chapterId: record.id,
              duration: flashcardsDuration,
              error: flashcardError.message
            });
            console.warn(`Failed to generate flashcards for "${record.title}":`, flashcardError);
            stats.warnings++;
          }
        })();

        const quizTask = (async () => {
          const quizTimer = telemetryService.startTimer("chapter_quiz_generation", {
            courseId,
            chapterId: record.id,
            chapterOrder: record.order,
            difficultyLevel
          });

          try {
            const quiz = await contentGenerator.generateQuiz({
              topic,
              chapter,
              difficultyLevel,
              count: 5,
              options: { maxRetries: 2, backoffMs: 600 }
            });

            if (quiz && quiz.questions && quiz.questions.length) {
              quizzesData.push(
                ...quiz.questions.map((question) => ({
                  courseId,
                  question: question.prompt,
                  options: question.options,
                  correctAnswer: question.correctAnswer,
                  explanation: question.explanation,
                }))
              );
              stats.quizzesGenerated += quiz.questions.length;

              telemetryService.recordMetric("chapter_quiz_question_count", quiz.questions.length, {
                courseId,
                chapterId: record.id
              });

              const quizDuration = quizTimer.end({ success: true });
              telemetryService.recordEvent("chapter_quiz_generated", {
                courseId,
                chapterId: record.id,
                duration: quizDuration,
                questionsCount: quiz.questions.length
              });
            } else {
              stats.warnings++;
              const quizDuration = quizTimer.end({ success: false, error: "empty_quiz" });
              telemetryService.recordEvent("chapter_quiz_missing", {
                courseId,
                chapterId: record.id,
                duration: quizDuration
              });
            }
          } catch (quizError) {
            const quizDuration = quizTimer.end({ success: false, error: quizError.message });
            telemetryService.recordEvent("chapter_quiz_failed", {
              courseId,
              chapterId: record.id,
              duration: quizDuration,
              error: quizError.message
            });
            console.warn(`Failed to generate quiz for "${record.title}":`, quizError);
            stats.warnings++;
          }
        })();

        await Promise.all([flashcardsTask, quizTask]);

        stats.chaptersGenerated++;

      } catch (chapterError) {
        console.error(`Failed to generate content for chapter "${record.title}":`, chapterError);
        stats.errors++;
        // Continue with other chapters
      }
    }

    if (notesData.length) {
      await insertNotes(notesData);
    }

    if (flashcardsData.length) {
      await insertFlashcards(flashcardsData);
    }

    if (quizzesData.length) {
      await insertQuizzes(quizzesData);
    }

    let finalSummaryText = initialSummary;

    if (chapterEntries.length) {
      try {
        finalSummaryText = await contentGenerator.generateCourseSummary({
          topic,
          chapters: chapterEntries.map(({ chapter }) => chapter),
          options: { maxRetries: 2, backoffMs: 700 }
        });
      } catch (summaryError) {
        console.warn('Failed to generate course summary, using initial summary:', summaryError);
        stats.warnings++;
      }
    }

    await updateCourseSummary(courseId, finalSummaryText ?? "");
    await updateCourseStatus(courseId, "ready");

    const duration = generationTimer.end({ success: true });
    
    console.log(`Course generation completed in ${duration}ms for courseId: ${courseId}`);
    console.log(`Generated: ${stats.chaptersGenerated} chapters, ${stats.notesGenerated} notes, ${stats.flashcardsGenerated} flashcards, ${stats.quizzesGenerated} quizzes`);
    
    telemetryService.recordCourseGeneration(courseId, userId, topic, duration, true, stats);
    telemetryService.recordEvent('course_generation_completed', {
      courseId,
      userId,
      topic,
      duration,
      ...stats
    });

    await inngest.send({
      name: "course.generated",
      data: {
        courseId,
        userId,
      },
    });
  } catch (error) {
    const duration = generationTimer.end({ success: false, error: error.message });
    
    // Enhanced error logging for Gemini API issues
    const structuredErrorPayload = {
      error: error.message || "Unknown error",
      errorName: error.name,
      stack: error.stack,
    };

    if (error.rawResponse) {
      structuredErrorPayload.rawResponsePreview = error.rawResponse.slice(0, 400);
    }

    if (error.extractedJson) {
      structuredErrorPayload.extractedJsonPreview =
        typeof error.extractedJson === "string"
          ? error.extractedJson.slice(0, 400)
          : JSON.stringify(error.extractedJson).slice(0, 400);
    }

    const isParsingError = error.name === "AiResponseParseError";

    let errorMessage = error.message || "Unknown error";
    let errorType = isParsingError ? "PARSING_ERROR" : "UNKNOWN_ERROR";
    let userFriendlyMessage = isParsingError
      ? "AI response could not be parsed. Please adjust your topic and try again."
      : "Course generation failed. Please try again.";
    
    if (errorMessage.includes("403") || errorMessage.includes("SERVICE_DISABLED")) {
      errorType = "API_DISABLED";
      userFriendlyMessage = "AI service is currently unavailable. Please contact support.";
      console.error(`❌ Gemini API is disabled or not enabled for this project.`);
      console.error(`   Please enable it at: https://console.developers.google.com/apis/api/generativelanguage.googleapis.com/overview`);
    } else if (errorMessage.includes("401") || errorMessage.includes("API key not valid")) {
      errorType = "INVALID_API_KEY";
      userFriendlyMessage = "AI service configuration error. Please contact support.";
      console.error(`❌ Invalid Gemini API key. Please check your GEMINI_API_KEY in .env.local`);
    } else if (errorMessage.includes("429") || errorMessage.includes("quota")) {
      errorType = "QUOTA_EXCEEDED";
      userFriendlyMessage = "AI service is temporarily busy. Please try again in a few minutes.";
      console.error(`❌ Gemini API quota exceeded. Please wait or upgrade your plan.`);
    } else if (errorMessage.includes("timeout") || errorMessage.includes("ETIMEDOUT")) {
      errorType = "TIMEOUT";
      userFriendlyMessage = "Course generation timed out. Please try again.";
    } else if (errorMessage.includes("network") || errorMessage.includes("ECONNREFUSED")) {
      errorType = "NETWORK_ERROR";
      userFriendlyMessage = "Network error occurred. Please check your connection and try again.";
    }
    
    console.error(`Error while generating course content (${duration}ms):`, error);
    console.error(`[AiContentService] Structured error details:`, structuredErrorPayload);
    
    // Update course status to failed with error metadata
    await updateCourseStatus(courseId, "failed");
    await db
      .update(COURSE_TABLE)
      .set({ 
        progressMetadata: { 
          error: userFriendlyMessage,
          errorType,
          details: structuredErrorPayload,
          rawError: structuredErrorPayload.error,
          rawErrorName: structuredErrorPayload.errorName,
          timestamp: new Date().toISOString()
        } 
      })
      .where(eq(COURSE_TABLE.id, courseId));
    
    stats.errors++;
    telemetryService.recordCourseGeneration(courseId, userId, topic, duration, false, stats);
    telemetryService.recordEvent('course_generation_failed', {
      courseId,
      userId,
      topic,
      duration,
      error: errorMessage,
      errorType,
      ...stats
    });
    
    throw error;
  }
}