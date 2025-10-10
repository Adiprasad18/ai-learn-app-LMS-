import { jest } from '@jest/globals';
import { POST } from '../../app/api/generate-course-outline/route';
import { generateCourseContent } from '../../configs/AiContentService';
import { getCourseById } from '../../lib/server/course-service';

// Mock dependencies
jest.mock('../../configs/AiContentService');
jest.mock('../../lib/server/course-service');

describe('Course Generation API Integration', () => {
  let mockRequest;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockRequest = {
      json: jest.fn()
    };
  });

  const validRequestBody = {
    courseId: 'test-course-123',
    userId: 'user-456',
    topic: 'JavaScript Fundamentals',
    studyType: 'Exam',
    difficultyLevel: 'Beginner'
  };

  const mockCourse = {
    id: 'test-course-123',
    userId: 'user-456',
    title: 'JavaScript Fundamentals',
    status: 'draft'
  };

  describe('Successful Course Generation', () => {
    it('should generate course content successfully', async () => {
      mockRequest.json.mockResolvedValue(validRequestBody);
      getCourseById.mockResolvedValue(mockCourse);
      generateCourseContent.mockResolvedValue(true);

      const response = await POST(mockRequest);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.courseId).toBe('test-course-123');
      expect(result.message).toBe('Course content generated successfully');
      expect(typeof result.generationTime).toBe('number');
    });

    it('should validate course ownership', async () => {
      mockRequest.json.mockResolvedValue(validRequestBody);
      getCourseById.mockResolvedValue(mockCourse);
      generateCourseContent.mockResolvedValue(true);

      await POST(mockRequest);

      expect(getCourseById).toHaveBeenCalledWith('test-course-123');
      expect(generateCourseContent).toHaveBeenCalledWith({
        courseId: 'test-course-123',
        userId: 'user-456',
        topic: 'JavaScript Fundamentals',
        studyType: 'Exam',
        difficultyLevel: 'Beginner'
      });
    });

    it('should include generation timing in response', async () => {
      mockRequest.json.mockResolvedValue(validRequestBody);
      getCourseById.mockResolvedValue(mockCourse);
      
      // Simulate slow generation
      generateCourseContent.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve(true), 100))
      );

      const response = await POST(mockRequest);
      const result = await response.json();

      expect(result.generationTime).toBeGreaterThan(90);
    });
  });

  describe('Request Validation', () => {
    it('should return 400 for missing required fields', async () => {
      const invalidBody = { ...validRequestBody };
      delete invalidBody.courseId;
      
      mockRequest.json.mockResolvedValue(invalidBody);

      const response = await POST(mockRequest);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Missing required fields');
      expect(result.required).toEqual([
        'courseId', 'topic', 'studyType', 'difficultyLevel', 'userId'
      ]);
    });

    it('should validate all required fields', async () => {
      const requiredFields = ['courseId', 'topic', 'studyType', 'difficultyLevel', 'userId'];
      
      for (const field of requiredFields) {
        const invalidBody = { ...validRequestBody };
        delete invalidBody[field];
        
        mockRequest.json.mockResolvedValue(invalidBody);

        const response = await POST(mockRequest);
        const result = await response.json();

        expect(response.status).toBe(400);
        expect(result.success).toBe(false);
      }
    });

    it('should handle malformed JSON request', async () => {
      mockRequest.json.mockRejectedValue(new Error('Invalid JSON'));

      const response = await POST(mockRequest);
      const result = await response.json();

      expect(response.status).toBe(500);
      expect(result.success).toBe(false);
    });
  });

  describe('Course Validation', () => {
    it('should return 404 for non-existent course', async () => {
      mockRequest.json.mockResolvedValue(validRequestBody);
      getCourseById.mockResolvedValue(null);

      const response = await POST(mockRequest);
      const result = await response.json();

      expect(response.status).toBe(404);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Course not found');
    });

    it('should return 403 for unauthorized course access', async () => {
      mockRequest.json.mockResolvedValue(validRequestBody);
      getCourseById.mockResolvedValue({
        ...mockCourse,
        userId: 'different-user-id'
      });

      const response = await POST(mockRequest);
      const result = await response.json();

      expect(response.status).toBe(403);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Unauthorized access to course');
    });

    it('should return 409 for course already being generated', async () => {
      mockRequest.json.mockResolvedValue(validRequestBody);
      getCourseById.mockResolvedValue({
        ...mockCourse,
        status: 'generating'
      });

      const response = await POST(mockRequest);
      const result = await response.json();

      expect(response.status).toBe(409);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Course generation already in progress');
      expect(result.status).toBe('generating');
    });
  });

  describe('Error Handling', () => {
    it('should handle AI service errors with 503 status', async () => {
      mockRequest.json.mockResolvedValue(validRequestBody);
      getCourseById.mockResolvedValue(mockCourse);
      generateCourseContent.mockRejectedValue(new Error('AI service temporarily unavailable'));

      const response = await POST(mockRequest);
      const result = await response.json();

      expect(response.status).toBe(503);
      expect(result.success).toBe(false);
      expect(result.error).toBe('AI service temporarily unavailable');
      expect(typeof result.generationTime).toBe('number');
    });

    it('should handle database errors with 503 status', async () => {
      mockRequest.json.mockResolvedValue(validRequestBody);
      getCourseById.mockResolvedValue(mockCourse);
      generateCourseContent.mockRejectedValue(new Error('database connection failed'));

      const response = await POST(mockRequest);
      const result = await response.json();

      expect(response.status).toBe(503);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Database service temporarily unavailable');
    });

    it('should handle validation errors with 400 status', async () => {
      mockRequest.json.mockResolvedValue(validRequestBody);
      getCourseById.mockResolvedValue(mockCourse);
      generateCourseContent.mockRejectedValue(new Error('validation failed: invalid topic'));

      const response = await POST(mockRequest);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.success).toBe(false);
      expect(result.error).toBe('validation failed: invalid topic');
    });

    it('should handle generic errors with 500 status', async () => {
      mockRequest.json.mockResolvedValue(validRequestBody);
      getCourseById.mockResolvedValue(mockCourse);
      generateCourseContent.mockRejectedValue(new Error('Unexpected error'));

      const response = await POST(mockRequest);
      const result = await response.json();

      expect(response.status).toBe(500);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to generate course');
    });

    it('should include error details in development mode', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      mockRequest.json.mockResolvedValue(validRequestBody);
      getCourseById.mockResolvedValue(mockCourse);
      generateCourseContent.mockRejectedValue(new Error('Detailed error message'));

      const response = await POST(mockRequest);
      const result = await response.json();

      expect(result.details).toBe('Detailed error message');

      process.env.NODE_ENV = originalEnv;
    });

    it('should not include error details in production mode', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      mockRequest.json.mockResolvedValue(validRequestBody);
      getCourseById.mockResolvedValue(mockCourse);
      generateCourseContent.mockRejectedValue(new Error('Detailed error message'));

      const response = await POST(mockRequest);
      const result = await response.json();

      expect(result.details).toBeUndefined();

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Performance and Monitoring', () => {
    it('should log generation start and completion', async () => {
      const consoleSpy = jest.spyOn(console, 'log');
      
      mockRequest.json.mockResolvedValue(validRequestBody);
      getCourseById.mockResolvedValue(mockCourse);
      generateCourseContent.mockResolvedValue(true);

      await POST(mockRequest);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Starting course generation for courseId: test-course-123')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Course generation completed')
      );
    });

    it('should log detailed error information', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error');
      
      mockRequest.json.mockResolvedValue(validRequestBody);
      getCourseById.mockResolvedValue(mockCourse);
      const error = new Error('Test error');
      error.stack = 'Error stack trace';
      generateCourseContent.mockRejectedValue(error);

      await POST(mockRequest);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error in generate-course-outline API'),
        expect.objectContaining({
          error: 'Test error',
          stack: 'Error stack trace',
          courseId: 'test-course-123',
          userId: 'user-456'
        })
      );
    });

    it('should handle concurrent requests properly', async () => {
      mockRequest.json.mockResolvedValue(validRequestBody);
      getCourseById.mockResolvedValue(mockCourse);
      generateCourseContent.mockResolvedValue(true);

      const requests = Array.from({ length: 3 }, () => POST(mockRequest));
      const responses = await Promise.all(requests);

      responses.forEach(async (response) => {
        const result = await response.json();
        expect(result.success).toBe(true);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty request body', async () => {
      mockRequest.json.mockResolvedValue({});

      const response = await POST(mockRequest);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Missing required fields');
    });

    it('should handle null values in request body', async () => {
      mockRequest.json.mockResolvedValue({
        courseId: null,
        userId: 'user-456',
        topic: 'JavaScript',
        studyType: 'Exam',
        difficultyLevel: 'Beginner'
      });

      const response = await POST(mockRequest);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.success).toBe(false);
    });

    it('should handle very long topic names', async () => {
      const longTopic = 'A'.repeat(1000);
      mockRequest.json.mockResolvedValue({
        ...validRequestBody,
        topic: longTopic
      });
      getCourseById.mockResolvedValue(mockCourse);
      generateCourseContent.mockResolvedValue(true);

      const response = await POST(mockRequest);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
    });

    it('should handle special characters in topic', async () => {
      const specialTopic = 'JavaScript & React.js: Advanced Concepts (2024) - Part 1/3';
      mockRequest.json.mockResolvedValue({
        ...validRequestBody,
        topic: specialTopic
      });
      getCourseById.mockResolvedValue(mockCourse);
      generateCourseContent.mockResolvedValue(true);

      const response = await POST(mockRequest);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
    });
  });
});