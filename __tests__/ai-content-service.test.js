import { jest } from '@jest/globals';

// Create mock functions
const mockGenerateCourseOutline = jest.fn();
const mockUpdateCourseStatus = jest.fn();
const mockInsertCourse = jest.fn();
const mockInsertChapters = jest.fn();
const mockInsertNotes = jest.fn();
const mockInsertFlashcards = jest.fn();
const mockInsertQuizzes = jest.fn();
const mockUpdateCourseSummary = jest.fn();

// Mock dependencies first
jest.mock('../configs/AiModel', () => ({
  generateCourseOutline: mockGenerateCourseOutline,
}));

jest.mock('../lib/server/course-service', () => ({
  updateCourseStatus: mockUpdateCourseStatus,
  insertCourse: mockInsertCourse,
  insertChapters: mockInsertChapters,
  insertNotes: mockInsertNotes,
  insertFlashcards: mockInsertFlashcards,
  insertQuizzes: mockInsertQuizzes,
  updateCourseSummary: mockUpdateCourseSummary,
}));

jest.mock('../lib/services/telemetry-service', () => ({
  default: {
    startTimer: jest.fn(() => ({
      end: jest.fn(() => 1000),
    })),
    recordEvent: jest.fn(),
    recordAiRequest: jest.fn(),
    recordCourseGeneration: jest.fn(),
  },
}));

jest.mock('../inngest/client', () => ({
  inngest: {
    send: jest.fn(),
  },
}));

jest.mock('../lib/prompts', () => ({
  buildCourseOutlinePrompt: jest.fn(() => 'course outline prompt'),
  buildChapterPrompt: jest.fn(() => 'chapter prompt'),
  buildFlashcardPrompt: jest.fn(() => 'flashcard prompt'),
  buildQuizPrompt: jest.fn(() => 'quiz prompt'),
  buildSummaryPrompt: jest.fn(() => 'summary prompt'),
}));

// Import after mocking
import { generateCourseContent } from '../configs/AiContentService';
import { generateCourseOutline } from '../configs/AiModel';
import { 
  updateCourseStatus, 
  insertCourse,
  insertChapters, 
  insertNotes, 
  insertFlashcards, 
  insertQuizzes,
  updateCourseSummary
} from '../lib/server/course-service';

// Get mocked functions
const mockedGenerateCourseOutline = mockGenerateCourseOutline;
const mockedUpdateCourseStatus = mockUpdateCourseStatus;
const mockedInsertCourse = mockInsertCourse;
const mockedInsertChapters = mockInsertChapters;
const mockedInsertNotes = mockInsertNotes;
const mockedInsertFlashcards = mockInsertFlashcards;
const mockedInsertQuizzes = mockInsertQuizzes;
const mockedUpdateCourseSummary = mockUpdateCourseSummary;

describe('AI Content Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    console.log = jest.fn();
    console.error = jest.fn();
    console.warn = jest.fn();
  });

  const mockCourseParams = {
    courseId: 'test-course-id',
    userId: 'test-user-id',
    topic: 'JavaScript Fundamentals',
    studyType: 'Exam',
    difficultyLevel: 'Beginner'
  };

  const mockCourseOutline = {
    title: 'JavaScript Fundamentals',
    summary: 'Learn the basics of JavaScript programming',
    chapters: [
      {
        title: 'Variables and Data Types',
        summary: 'Understanding JavaScript variables and data types'
      },
      {
        title: 'Functions and Scope',
        summary: 'Working with functions and understanding scope'
      }
    ]
  };

  const mockChapterNotes = {
    notes: 'Variables in JavaScript can be declared using var, let, or const keywords.',
    keyPoints: [
      'Use let for block-scoped variables',
      'Use const for constants',
      'Avoid var in modern JavaScript'
    ]
  };

  const mockFlashcards = [
    {
      front: 'What are the three ways to declare variables in JavaScript?',
      back: 'var, let, and const'
    }
  ];

  const mockQuizzes = [
    {
      prompt: 'Which keyword is used for block-scoped variables?',
      options: ['var', 'let', 'const', 'function'],
      correctAnswer: 'let',
      explanation: 'let creates block-scoped variables, unlike var which is function-scoped'
    }
  ];

  describe('generateCourseContent', () => {
    it('should successfully generate complete course content', async () => {
      // Mock successful AI responses
      mockedGenerateCourseOutline
        .mockResolvedValueOnce(mockCourseOutline)
        .mockResolvedValueOnce(mockChapterNotes)
        .mockResolvedValueOnce(mockFlashcards)
        .mockResolvedValueOnce(mockChapterNotes)
        .mockResolvedValueOnce(mockFlashcards)
        .mockResolvedValueOnce(mockQuizzes)
        .mockResolvedValueOnce(mockQuizzes)
        .mockResolvedValueOnce('This course covers JavaScript fundamentals including variables, functions, and scope.');

      // Mock database operations
      mockedUpdateCourseStatus.mockResolvedValue(true);
      mockedInsertCourse.mockResolvedValue(true);
      mockedInsertChapters.mockResolvedValue(true);
      mockedInsertNotes.mockResolvedValue(true);
      mockedInsertFlashcards.mockResolvedValue(true);
      mockedInsertQuizzes.mockResolvedValue(true);
      mockedUpdateCourseSummary.mockResolvedValue(true);

      await generateCourseContent(mockCourseParams);

      // Verify course was inserted
      expect(mockedInsertCourse).toHaveBeenCalledWith(expect.objectContaining({
        id: 'test-course-id',
        userId: 'test-user-id',
        title: 'JavaScript Fundamentals',
        topic: 'JavaScript Fundamentals',
        studyType: 'Exam',
        difficultyLevel: 'Beginner',
        summary: 'Learn the basics of JavaScript programming',
        status: 'generating'
      }));

      // Verify chapters were created
      expect(mockedInsertChapters).toHaveBeenCalled();
      
      // Verify content was created
      expect(mockedInsertNotes).toHaveBeenCalled();
      expect(mockedInsertFlashcards).toHaveBeenCalled();
      expect(mockedInsertQuizzes).toHaveBeenCalled();
      
      // Verify final status update
      expect(mockedUpdateCourseStatus).toHaveBeenCalledWith('test-course-id', 'ready');
    });

    it('should handle AI service failures gracefully', async () => {
      mockedGenerateCourseOutline.mockRejectedValue(new Error('AI service unavailable'));
      mockedUpdateCourseStatus.mockResolvedValue(true);
      mockedInsertCourse.mockResolvedValue(true);

      await expect(generateCourseContent(mockCourseParams)).rejects.toThrow('AI service unavailable');
      
      expect(mockedInsertCourse).toHaveBeenCalled();
      expect(mockedUpdateCourseStatus).toHaveBeenCalledWith('test-course-id', 'failed');
    });

    it('should continue generation when non-critical content fails', async () => {
      // Mock outline success but notes failure
      mockedGenerateCourseOutline
        .mockResolvedValueOnce(mockCourseOutline)
        .mockRejectedValueOnce(new Error('Notes generation failed'))
        .mockResolvedValueOnce(mockFlashcards)
        .mockResolvedValueOnce(mockChapterNotes)
        .mockResolvedValueOnce(mockFlashcards)
        .mockResolvedValueOnce(mockQuizzes)
        .mockResolvedValueOnce(mockQuizzes)
        .mockResolvedValueOnce('Course summary');

      mockedUpdateCourseStatus.mockResolvedValue(true);
      insertCourse.mockResolvedValue(true);
      insertChapters.mockResolvedValue(true);
      insertNotes.mockResolvedValue(true);
      insertFlashcards.mockResolvedValue(true);
      insertQuizzes.mockResolvedValue(true);
      updateCourseSummary.mockResolvedValue(true);

      await generateCourseContent(mockCourseParams);

      // Should still complete successfully
      expect(mockedUpdateCourseStatus).toHaveBeenCalledWith('test-course-id', 'ready');
      
      // Should log warning for failed content
      expect(console.warn).toHaveBeenCalled();
    });

    it('should handle malformed AI responses', async () => {
      // Mock malformed JSON response
      mockedGenerateCourseOutline.mockResolvedValueOnce('invalid json response');
      mockedUpdateCourseStatus.mockResolvedValue(true);
      insertCourse.mockResolvedValue(true);

      await expect(generateCourseContent(mockCourseParams)).rejects.toThrow();
      
      expect(mockedUpdateCourseStatus).toHaveBeenCalledWith('test-course-id', 'failed');
    });

    it('should validate required parameters', async () => {
      const invalidParams = { ...mockCourseParams, courseId: null };

      await expect(generateCourseContent(invalidParams)).rejects.toThrow();
    });

    it('should handle database failures', async () => {
      mockedGenerateCourseOutline.mockResolvedValueOnce(mockCourseOutline);
      insertCourse.mockRejectedValue(new Error('Database connection failed'));

      await expect(generateCourseContent(mockCourseParams)).rejects.toThrow('Database connection failed');
    });

    it('should generate course summary when chapters are available', async () => {
      mockedGenerateCourseOutline
        .mockResolvedValueOnce(mockCourseOutline)
        .mockResolvedValueOnce(mockChapterNotes)
        .mockResolvedValueOnce(mockFlashcards)
        .mockResolvedValueOnce(mockChapterNotes)
        .mockResolvedValueOnce(mockFlashcards)
        .mockResolvedValueOnce(mockQuizzes)
        .mockResolvedValueOnce(mockQuizzes)
        .mockResolvedValueOnce('Generated course summary');

      mockedUpdateCourseStatus.mockResolvedValue(true);
      insertCourse.mockResolvedValue(true);
      insertChapters.mockResolvedValue(true);
      insertNotes.mockResolvedValue(true);
      insertFlashcards.mockResolvedValue(true);
      insertQuizzes.mockResolvedValue(true);
      updateCourseSummary.mockResolvedValue(true);

      await generateCourseContent(mockCourseParams);

      // Verify summary was updated
      expect(updateCourseSummary).toHaveBeenCalledWith('test-course-id', 'Generated course summary');
    });
  });

  describe('Error Recovery and Resilience', () => {
    it('should retry failed AI requests with exponential backoff', async () => {
      // Mock first call failure, second call success
      mockedGenerateCourseOutline
        .mockRejectedValueOnce(new Error('Temporary AI failure'))
        .mockResolvedValueOnce(mockCourseOutline);

      mockedUpdateCourseStatus.mockResolvedValue(true);
      insertCourse.mockResolvedValue(true);
      insertChapters.mockResolvedValue(true);
      updateCourseSummary.mockResolvedValue(true);

      // This should not throw due to retry logic
      await expect(generateCourseContent(mockCourseParams)).resolves.not.toThrow();
    });

    it('should handle partial content generation gracefully', async () => {
      mockedGenerateCourseOutline
        .mockResolvedValueOnce(mockCourseOutline)
        .mockResolvedValueOnce(mockChapterNotes)
        .mockRejectedValueOnce(new Error('Flashcard generation failed'))
        .mockResolvedValueOnce(mockChapterNotes)
        .mockResolvedValueOnce(mockFlashcards)
        .mockResolvedValueOnce(mockQuizzes)
        .mockRejectedValueOnce(new Error('Quiz generation failed'))
        .mockResolvedValueOnce('Course summary');

      mockedUpdateCourseStatus.mockResolvedValue(true);
      insertCourse.mockResolvedValue(true);
      insertChapters.mockResolvedValue(true);
      insertNotes.mockResolvedValue(true);
      insertFlashcards.mockResolvedValue(true);
      insertQuizzes.mockResolvedValue(true);
      updateCourseSummary.mockResolvedValue(true);

      await generateCourseContent(mockCourseParams);

      // Should complete successfully despite partial failures
      expect(mockedUpdateCourseStatus).toHaveBeenCalledWith('test-course-id', 'ready');
      
      // Should log warnings for failed content
      expect(console.warn).toHaveBeenCalledTimes(2);
    });
  });

  describe('Performance and Monitoring', () => {
    it('should log generation timing information', async () => {
      mockedGenerateCourseOutline.mockResolvedValueOnce(mockCourseOutline);
      mockedUpdateCourseStatus.mockResolvedValue(true);
      insertCourse.mockResolvedValue(true);
      insertChapters.mockResolvedValue(true);
      updateCourseSummary.mockResolvedValue(true);

      await generateCourseContent(mockCourseParams);

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Starting course generation')
      );
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Course generation completed')
      );
    });

    it('should handle concurrent generation requests', async () => {
      mockedGenerateCourseOutline.mockResolvedValue(mockCourseOutline);
      mockedUpdateCourseStatus.mockResolvedValue(true);
      insertCourse.mockResolvedValue(true);
      insertChapters.mockResolvedValue(true);
      updateCourseSummary.mockResolvedValue(true);

      const promises = [
        generateCourseContent({ ...mockCourseParams, courseId: 'course-1' }),
        generateCourseContent({ ...mockCourseParams, courseId: 'course-2' }),
        generateCourseContent({ ...mockCourseParams, courseId: 'course-3' })
      ];

      await Promise.all(promises);

      expect(insertCourse).toHaveBeenCalledTimes(3); // 3 courses
      expect(mockedUpdateCourseStatus).toHaveBeenCalledTimes(3); // 3 final status updates
    });
  });
});