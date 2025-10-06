/**
 * Content Generator Service
 * Uses streaming AI service for structured note generation
 */

import streamingAiService from "./streaming-service.js";
import telemetryService from "../services/telemetry-service.js";
import { parseStructuredJson } from "../utils/json-utils.js";

class ContentGenerator {
  /**
   * Generate chapter content with streaming (alias for generateNotes)
   */
  async *generateChapterContentStream({ courseTitle, chapter, options = {} }) {
    // Map the parameters to match generateNotes
    const course = { title: courseTitle };
    return this.generateNotes(course, chapter, options);
  }

  /**
   * Generate structured notes
   */
  async generateNotes(course, chapter, options = {}) {
    const { onProgress, onError } = options;

    const prompt = `
You are an AI assistant generating structured study notes.

Course: ${course?.title || "Untitled"}
Chapter: ${chapter?.title || "Untitled"}

Generate structured notes in JSON format with the following schema:

{
  "notes": {
    "summary": "Short 2-3 sentence overview of the chapter",
    "keyPoints": [
      { "point": "Main concept or fact", "explanation": "Detailed explanation" }
    ],
    "examples": [
      { "concept": "Concept name", "example": "Illustrative example" }
    ],
    "quiz": [
      { "question": "MCQ or short question", "answer": "Correct answer" }
    ],
    "difficultyGuidance": {
      "general": "Overall guidance for students",
      "challengingTopics": ["topic1", "topic2"]
    }
  }
}

CRITICAL REQUIREMENTS:
- Your response must be valid JSON only.
- Do not include any markdown formatting, code blocks, or explanations.
- Do not wrap the JSON in \`\`\`json or any other markers.
- Return only the JSON object, nothing else.

Guidelines:
- Produce **valid JSON** (no comments, no trailing commas).
- Each section must have at least 2 items (except summary).
- Keep answers concise but informative.
- The response must be a JSON object with a "notes" field containing all the content.
`;

    const timer = telemetryService.startTimer("content_generation", {
      courseId: course?.id,
      chapterId: chapter?.id,
    });

    try {
      console.log(`[content-generator] Generating notes for chapter: ${chapter?.title}`);

      const result = await streamingAiService.generateContent(prompt, {
        operation: "content_generation",
        maxRetries: 3,
        backoffMs: 1000,
      });

      const rawContent = result.content;
      console.log(`[content-generator] Raw AI response length: ${rawContent.length}`);
      console.log(`[content-generator] Raw AI response preview: ${rawContent.substring(0, 200)}...`);

      // Parse the JSON using shared utilities
      let parsed;
      try {
        parsed = parseStructuredJson(rawContent);
        console.log(`[content-generator] Parsed AI response using shared JSON utilities`);
      } catch (parseError) {
        console.error(`[content-generator] JSON parse failed:`, parseError.message);
        parseError.rawContent = rawContent;
        throw parseError;
      }

      if (!parsed) {
        const parseFailure = new Error(`Failed to parse AI response as JSON. Raw response: ${rawContent.substring(0, 500)}`);
        parseFailure.name = "AiNotesParseError";
        parseFailure.rawContent = rawContent;
        throw parseFailure;
      }

      // Handle both { notes: {...} } and direct notes object
      let notesContent;
      if (parsed.notes) {
        notesContent = parsed.notes;
      } else if (parsed.summary) {
        // AI returned notes object directly
        notesContent = parsed;
      } else {
        throw new Error(`Invalid JSON structure. Expected 'notes' field or direct notes object. Parsed: ${JSON.stringify(parsed, null, 2)}`);
      }

      // Validate required fields
      if (!notesContent.summary || !Array.isArray(notesContent.keyPoints) || notesContent.keyPoints.length < 2) {
        throw new Error(`Invalid notes structure. Missing required fields or insufficient content.`);
      }

      // Defensive fix: ensure difficultyGuidance.general exists
      if (!notesContent.difficultyGuidance || typeof notesContent.difficultyGuidance.general !== "string") {
        notesContent.difficultyGuidance = {
          general: "Focus on understanding the main concepts and revise regularly.",
          challengingTopics: notesContent.difficultyGuidance?.challengingTopics || [],
        };
      }

      const duration = timer.end({ success: true });
      telemetryService.recordEvent("content_generation_complete", {
        courseId: course?.id,
        chapterId: chapter?.id,
        duration,
      });

      console.log(`[content-generator] Successfully generated notes with ${notesContent.keyPoints.length} key points`);

      return {
        raw: rawContent,
        parsed: { notes: notesContent },
        complete: true,
      };

    } catch (err) {
      const duration = timer.end({ success: false, error: err.message });
      telemetryService.recordEvent("content_generation_failed", {
        courseId: course?.id,
        chapterId: chapter?.id,
        duration,
        error: err.message,
      });

      console.error(`[content-generator] Generation failed:`, err.message);
      throw err;
    }
  }

  /**
   * Generate flashcards
   */
  async generateFlashcards({ topic, chapter, count = 8 }) {
    const timer = telemetryService.startTimer("flashcard_generation", {
      topic: topic,
      chapterTitle: chapter?.title,
    });

    try {
      console.log(`[content-generator] Generating ${count} flashcards for chapter: ${chapter?.title}`);

      const prompt = `
You are an AI assistant generating educational flashcards.

Topic: ${topic || "General"}
Chapter: ${chapter?.title || "Untitled"}
Summary: ${chapter?.summary || "No summary available"}
Content: ${chapter?.content || "No content available"}

Generate ${count} flashcards in JSON format with the following schema:

{
  "flashcards": [
    {
      "front": "Question or term",
      "back": "Answer or definition"
    }
  ]
}

CRITICAL REQUIREMENTS:
- Your response must be valid JSON only.
- Do not include any markdown formatting, code blocks, or explanations.
- Do not wrap the JSON in \`\`\`json or any other markers.
- Return only the JSON object, nothing else.

Guidelines:
- Create ${count} flashcards covering key concepts from the chapter.
- Front should be a question, term, or key concept.
- Back should be the answer, definition, or explanation.
- Keep questions and answers concise but informative.
- Ensure flashcards are educational and cover different aspects of the content.
- The response must be a JSON object with a "flashcards" array containing all flashcards.
`;

      const result = await streamingAiService.generateContent(prompt, {
        operation: "flashcard_generation",
        maxRetries: 3,
        backoffMs: 1000,
      });

      const rawContent = result.content;
      console.log(`[content-generator] Raw AI response length: ${rawContent.length}`);
      console.log(`[content-generator] Raw AI response preview: ${rawContent.substring(0, 200)}...`);

      // Try to parse the JSON
      let parsed;
      try {
        parsed = JSON.parse(rawContent.trim());
      } catch (parseError) {
        console.error(`[content-generator] Direct JSON parse failed:`, parseError.message);

        // Try multiple fallback parsing strategies
        let cleanedContent = rawContent.trim();

        // Remove markdown code blocks if present
        const codeBlockMatch = cleanedContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
        if (codeBlockMatch) {
          cleanedContent = codeBlockMatch[1].trim();
          console.log(`[content-generator] Removed markdown code block, length:`, cleanedContent.length);
        }

        // Try parsing the cleaned content
        try {
          parsed = JSON.parse(cleanedContent);
          console.log(`[content-generator] Parsed after cleaning markdown`);
        } catch (cleanError) {
          console.error(`[content-generator] Cleaned content parse failed:`, cleanError.message);

          // Try to extract JSON boundaries
          const start = cleanedContent.indexOf('{');
          const end = cleanedContent.lastIndexOf('}');
          if (start !== -1 && end !== -1 && end > start) {
            const jsonSubstring = cleanedContent.substring(start, end + 1);
            try {
              parsed = JSON.parse(jsonSubstring);
              console.log(`[content-generator] Extracted JSON boundaries, parsed successfully`);
            } catch (boundaryError) {
              console.error(`[content-generator] Boundary extraction failed:`, boundaryError.message);
            }
          }
        }
      }

      if (!parsed) {
        throw new Error(`Failed to parse AI response as JSON. Raw response: ${rawContent.substring(0, 500)}`);
      }

      // Handle both { flashcards: [...] } and direct array
      let flashcards;
      if (parsed.flashcards && Array.isArray(parsed.flashcards)) {
        flashcards = parsed.flashcards;
      } else if (Array.isArray(parsed)) {
        flashcards = parsed;
      } else {
        throw new Error(`Invalid JSON structure. Expected 'flashcards' array. Parsed: ${JSON.stringify(parsed, null, 2)}`);
      }

      // Validate flashcards
      if (flashcards.length === 0) {
        throw new Error(`No flashcards generated.`);
      }

      for (const card of flashcards) {
        if (!card.front || !card.back) {
          throw new Error(`Invalid flashcard structure. Missing front or back.`);
        }
      }

      const duration = timer.end({ success: true });
      telemetryService.recordEvent("flashcard_generation_complete", {
        topic: topic,
        chapterTitle: chapter?.title,
        count: flashcards.length,
        duration,
      });

      console.log(`[content-generator] Successfully generated ${flashcards.length} flashcards`);

      return flashcards;

    } catch (err) {
      const duration = timer.end({ success: false, error: err.message });
      telemetryService.recordEvent("flashcard_generation_failed", {
        topic: topic,
        chapterTitle: chapter?.title,
        duration,
        error: err.message,
      });

      console.error(`[content-generator] Flashcard generation failed:`, err.message);
      throw err;
    }
  }

  /**
   * Generate course outline
   */
  async generateCourseOutline({ topic, studyType, difficultyLevel, options = {} }) {
    const timer = telemetryService.startTimer("course_outline_generation", {
      topic,
      studyType,
      difficultyLevel,
    });

    try {
      console.log(`[content-generator] Generating course outline for topic: ${topic}, studyType: ${studyType}, difficultyLevel: ${difficultyLevel}`);

      const prompt = `
You are an AI assistant creating structured course outlines for educational content.

Topic: ${topic}
Study Type: ${studyType}
Difficulty Level: ${difficultyLevel}

Generate a course outline in JSON format with the following schema:

{
  "title": "Course Title",
  "summary": "Brief course description (2-3 sentences)",
  "chapters": [
    {
      "title": "Chapter Title",
      "summary": "Chapter summary (1-2 sentences)",
      "content": "Detailed chapter content outline"
    }
  ]
}

CRITICAL REQUIREMENTS:
- Your response must be valid JSON only.
- Do not include any markdown formatting, code blocks, or explanations.
- Do not wrap the JSON in \`\`\`json or any other markers.
- Return only the JSON object, nothing else.

Guidelines:
- Produce **valid JSON** (no comments, no trailing commas).
- Create 4-8 chapters appropriate for the topic and difficulty level.
- Each chapter should have a clear title and summary.
- The content field should outline what will be covered in that chapter.
- Ensure the outline is comprehensive but not overwhelming.
- Adapt the depth and complexity based on the difficulty level (${difficultyLevel}).
- Consider the study type (${studyType}) when structuring the content.
- The response must be a JSON object with title, summary, and chapters array.
`;

      const result = await streamingAiService.generateContent(prompt, {
        operation: "course_outline_generation",
        maxRetries: options.maxRetries || 3,
        backoffMs: options.backoffMs || 1000,
      });

      const rawContent = result.content;
      console.log(`[content-generator] Raw AI response length: ${rawContent.length}`);
      console.log(`[content-generator] Raw AI response preview: ${rawContent.substring(0, 200)}...`);

      // Parse the JSON
      const parsed = parseStructuredJson(rawContent);

      if (!parsed) {
        throw new Error(`Failed to parse AI response as JSON. Raw response: ${rawContent.substring(0, 500)}`);
      }

      // Validate required fields
      if (!parsed.title || !parsed.summary || !Array.isArray(parsed.chapters) || parsed.chapters.length === 0) {
        throw new Error(`Invalid outline structure. Missing required fields or empty chapters.`);
      }

      // Validate chapters
      for (const chapter of parsed.chapters) {
        if (!chapter.title || !chapter.summary) {
          throw new Error(`Invalid chapter structure. Missing title or summary.`);
        }
      }

      const duration = timer.end({ success: true });
      telemetryService.recordEvent("course_outline_generation_complete", {
        topic,
        studyType,
        difficultyLevel,
        chapterCount: parsed.chapters.length,
        duration,
      });

      console.log(`[content-generator] Successfully generated course outline with ${parsed.chapters.length} chapters`);

      return parsed;

    } catch (err) {
      const duration = timer.end({ success: false, error: err.message });
      telemetryService.recordEvent("course_outline_generation_failed", {
        topic,
        studyType,
        difficultyLevel,
        duration,
        error: err.message,
      });

      console.error(`[content-generator] Course outline generation failed:`, err.message);
      throw err;
    }
  }

  /**
   * Generate quiz questions
   */
  async generateQuiz({ topic, chapter, difficultyLevel, count = 5 }) {
    const timer = telemetryService.startTimer("quiz_generation", {
      topic: topic,
      chapterTitle: chapter?.title,
      difficultyLevel,
      count,
    });

    try {
      console.log(`[content-generator] Generating ${count} quiz questions for chapter: ${chapter?.title}`);

      const prompt = `
You are an AI assistant generating educational quiz questions.

Topic: ${topic || "General"}
Chapter: ${chapter?.title || "Untitled"}
Summary: ${chapter?.summary || "No summary available"}
Content: ${chapter?.content || "No content available"}
Difficulty Level: ${difficultyLevel || "intermediate"}

Generate ${count} multiple-choice quiz questions in JSON format with the following schema:

{
  "questions": [
    {
      "prompt": "The question text",
      "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
      "correctAnswer": "A) Option 1",
      "explanation": "Brief explanation of why this is the correct answer"
    }
  ]
}

CRITICAL REQUIREMENTS:
- Your response must be valid JSON only.
- Do not include any markdown formatting, code blocks, or explanations.
- Do not wrap the JSON in \`\`\`json or any other markers.
- Return only the JSON object, nothing else.

Guidelines:
- Create ${count} multiple-choice questions covering key concepts from the chapter.
- Each question must have exactly 4 options labeled A), B), C), D).
- Only one option should be correct.
- Questions should be appropriate for ${difficultyLevel || "intermediate"} level students.
- Provide clear, concise explanations for correct answers.
- Ensure questions test understanding, not just memorization.
- The response must be a JSON object with a "questions" array containing all questions.
`;

      const result = await streamingAiService.generateContent(prompt, {
        operation: "quiz_generation",
        maxRetries: 3,
        backoffMs: 1000,
      });

      const rawContent = result.content;
      console.log(`[content-generator] Raw AI response length: ${rawContent.length}`);
      console.log(`[content-generator] Raw AI response preview: ${rawContent.substring(0, 200)}...`);

      // Try to parse the JSON
      let parsed;
      try {
        parsed = JSON.parse(rawContent.trim());
      } catch (parseError) {
        console.error(`[content-generator] Direct JSON parse failed:`, parseError.message);

        // Try multiple fallback parsing strategies
        let cleanedContent = rawContent.trim();

        // Remove markdown code blocks if present
        const codeBlockMatch = cleanedContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
        if (codeBlockMatch) {
          cleanedContent = codeBlockMatch[1].trim();
          console.log(`[content-generator] Removed markdown code block, length:`, cleanedContent.length);
        }

        // Try parsing the cleaned content
        try {
          parsed = JSON.parse(cleanedContent);
          console.log(`[content-generator] Parsed after cleaning markdown`);
        } catch (cleanError) {
          console.error(`[content-generator] Cleaned content parse failed:`, cleanError.message);

          // Try to extract JSON boundaries
          const start = cleanedContent.indexOf('{');
          const end = cleanedContent.lastIndexOf('}');
          if (start !== -1 && end !== -1 && end > start) {
            const jsonSubstring = cleanedContent.substring(start, end + 1);
            try {
              parsed = JSON.parse(jsonSubstring);
              console.log(`[content-generator] Extracted JSON boundaries, parsed successfully`);
            } catch (boundaryError) {
              console.error(`[content-generator] Boundary extraction failed:`, boundaryError.message);
            }
          }
        }
      }

      if (!parsed) {
        throw new Error(`Failed to parse AI response as JSON. Raw response: ${rawContent.substring(0, 500)}`);
      }

      // Handle both { questions: [...] } and direct array
      let questions;
      if (parsed.questions && Array.isArray(parsed.questions)) {
        questions = parsed.questions;
      } else if (Array.isArray(parsed)) {
        questions = parsed;
      } else {
        throw new Error(`Invalid JSON structure. Expected 'questions' array. Parsed: ${JSON.stringify(parsed, null, 2)}`);
      }

      // Validate questions
      if (questions.length === 0) {
        throw new Error(`No questions generated.`);
      }

      for (const question of questions) {
        if (!question.prompt || !Array.isArray(question.options) || question.options.length !== 4 || !question.correctAnswer || !question.explanation) {
          throw new Error(`Invalid question structure. Missing required fields.`);
        }
      }

      const duration = timer.end({ success: true });
      telemetryService.recordEvent("quiz_generation_complete", {
        topic: topic,
        chapterTitle: chapter?.title,
        difficultyLevel,
        count: questions.length,
        duration,
      });

      console.log(`[content-generator] Successfully generated ${questions.length} quiz questions`);

      return { questions };

    } catch (err) {
      const duration = timer.end({ success: false, error: err.message });
      telemetryService.recordEvent("quiz_generation_failed", {
        topic: topic,
        chapterTitle: chapter?.title,
        difficultyLevel,
        duration,
        error: err.message,
      });

      console.error(`[content-generator] Quiz generation failed:`, err.message);
      throw err;
    }
  }
}

// Export singleton
const contentGenerator = new ContentGenerator();
export default contentGenerator;
