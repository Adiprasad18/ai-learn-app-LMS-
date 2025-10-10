export function buildCourseOutlinePrompt({ topic, studyType, difficultyLevel }) {
  return `You are an expert instructional designer. Create a structured JSON plan for a course.
Return valid JSON with the following shape:
{
  "title": string,
  "summary": string,
  "chapters": [
    {
      "title": string,
      "summary": string,
      "topics": [string]
    }
  ]
}
Topic: ${topic}
Study Type: ${studyType}
Difficulty Level: ${difficultyLevel}`;
}

export function buildChapterPrompt({ courseTitle, chapter }) {
  return `Course Title: ${courseTitle}
Chapter: ${chapter.title}
Topics: ${chapter.topics?.join(", ")}

Generate a JSON object containing detailed notes for this chapter. Format:
{
  "notes": string (rich markdown),
  "keyPoints": [string]
}`;
}

export function buildFlashcardPrompt({ topic, chapter }) {
  return `Create 8 flashcards for the topic ${topic} - Chapter ${chapter.title}.
Return JSON array with each card as { "front": string, "back": string }`;
}

export function buildQuizPrompt({ topic, chapter, difficultyLevel }) {
  return `Generate 5 multiple choice questions for the chapter ${chapter.title}.
Each question should include 4 options and mark the correct option.
Return JSON array with shape:
{
  "questions": [
    {
      "prompt": string,
      "options": [string, string, string, string],
      "correctAnswer": string,
      "explanation": string
    }
  ]
}
Difficulty: ${difficultyLevel}`;
}

export function buildSummaryPrompt({ topic, chapters }) {
  return `Create a concise course summary for ${topic} with ${chapters.length} chapters.
Return JSON: { "summary": string }`;
}