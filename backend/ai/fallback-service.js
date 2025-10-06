/**
 * AI Fallback Service
 * Provides fallback content when AI generation fails
 */

import telemetryService from "../services/telemetry-service.js";

class FallbackService {
  constructor() {
    this.fallbackTemplates = {
      courseOutlines: new Map(),
      chapterContent: new Map(),
      flashcards: new Map(),
      quizzes: new Map()
    };
    
    this.initializeFallbackTemplates();
  }

  /**
   * Initialize fallback templates for common topics
   */
  initializeFallbackTemplates() {
    // Course outline templates
    this.fallbackTemplates.courseOutlines.set('programming', {
      title: 'Introduction to Programming',
      summary: 'This course provides a comprehensive introduction to programming concepts, covering fundamental principles, problem-solving techniques, and practical coding skills. Students will learn core programming constructs, data structures, and algorithms while developing hands-on experience through practical exercises.',
      chapters: [
        {
          title: 'Programming Fundamentals',
          summary: 'Introduction to basic programming concepts, variables, and data types.',
          topics: ['Variables and Constants', 'Data Types', 'Basic Input/Output', 'Comments and Documentation']
        },
        {
          title: 'Control Structures',
          summary: 'Learn about conditional statements and loops for program flow control.',
          topics: ['If-Else Statements', 'Switch Statements', 'For Loops', 'While Loops', 'Break and Continue']
        },
        {
          title: 'Functions and Procedures',
          summary: 'Understanding how to create and use functions for code organization.',
          topics: ['Function Definition', 'Parameters and Arguments', 'Return Values', 'Scope and Lifetime']
        },
        {
          title: 'Data Structures',
          summary: 'Introduction to arrays, lists, and other fundamental data structures.',
          topics: ['Arrays', 'Lists', 'Strings', 'Basic Data Manipulation']
        }
      ]
    });

    this.fallbackTemplates.courseOutlines.set('mathematics', {
      title: 'Mathematics Fundamentals',
      summary: 'A comprehensive course covering essential mathematical concepts and problem-solving techniques. This course builds a strong foundation in mathematical thinking and provides practical skills for various applications.',
      chapters: [
        {
          title: 'Number Systems and Operations',
          summary: 'Understanding different number systems and basic mathematical operations.',
          topics: ['Natural Numbers', 'Integers', 'Rational Numbers', 'Real Numbers', 'Basic Operations']
        },
        {
          title: 'Algebraic Expressions',
          summary: 'Working with variables, expressions, and basic algebraic manipulations.',
          topics: ['Variables and Constants', 'Algebraic Expressions', 'Simplification', 'Factoring']
        },
        {
          title: 'Equations and Inequalities',
          summary: 'Solving linear and quadratic equations and understanding inequalities.',
          topics: ['Linear Equations', 'Quadratic Equations', 'Systems of Equations', 'Inequalities']
        },
        {
          title: 'Functions and Graphs',
          summary: 'Introduction to functions, their properties, and graphical representations.',
          topics: ['Function Definition', 'Domain and Range', 'Linear Functions', 'Graphing Techniques']
        }
      ]
    });

    // Chapter content templates
    this.fallbackTemplates.chapterContent.set('default', {
      notes: `# Chapter Content

## Overview
This chapter covers important concepts that are fundamental to understanding the subject matter. The content is designed to build upon previous knowledge while introducing new ideas and techniques.

## Key Concepts
- **Concept 1**: Fundamental principle that forms the basis of understanding
- **Concept 2**: Building upon the first concept with practical applications
- **Concept 3**: Advanced techniques and methodologies
- **Concept 4**: Real-world applications and examples

## Detailed Explanation
The chapter begins with an introduction to the core concepts, providing clear definitions and examples. Each concept is explained with step-by-step breakdowns and practical illustrations.

### Important Points
1. Understanding the foundational principles is crucial for success
2. Practice and repetition help reinforce learning
3. Real-world applications make concepts more meaningful
4. Building connections between concepts enhances comprehension

## Summary
This chapter provides essential knowledge that will be used throughout the course. The concepts introduced here form the foundation for more advanced topics in subsequent chapters.`,
      keyPoints: [
        'Master the fundamental concepts before moving to advanced topics',
        'Practice regularly to reinforce understanding',
        'Connect new concepts to previously learned material',
        'Apply knowledge through practical exercises',
        'Review and summarize key points regularly'
      ]
    });

    // Flashcard templates
    this.fallbackTemplates.flashcards.set('default', [
      {
        front: 'What is the main topic of this chapter?',
        back: 'The chapter focuses on fundamental concepts and their practical applications in the subject area.'
      },
      {
        front: 'Why is understanding the basics important?',
        back: 'A strong foundation in basic concepts is essential for understanding more advanced topics and solving complex problems.'
      },
      {
        front: 'How can you improve your understanding of the material?',
        back: 'Regular practice, active review, and connecting new concepts to existing knowledge help improve understanding.'
      },
      {
        front: 'What should you do if you encounter difficult concepts?',
        back: 'Break down complex concepts into smaller parts, seek additional resources, and practice with examples.'
      },
      {
        front: 'How do real-world applications help learning?',
        back: 'Real-world applications make abstract concepts more concrete and help students understand the practical value of their learning.'
      }
    ]);

    // Quiz templates
    this.fallbackTemplates.quizzes.set('default', {
      questions: [
        {
          prompt: 'What is the most important aspect of learning new concepts?',
          options: [
            'Memorizing all details',
            'Understanding fundamental principles',
            'Completing assignments quickly',
            'Avoiding difficult topics'
          ],
          correctAnswer: 'Understanding fundamental principles',
          explanation: 'Understanding fundamental principles provides a solid foundation for learning and helps in applying knowledge to new situations.'
        },
        {
          prompt: 'Which learning strategy is most effective for long-term retention?',
          options: [
            'Cramming before tests',
            'Reading material once',
            'Regular practice and review',
            'Passive listening'
          ],
          correctAnswer: 'Regular practice and review',
          explanation: 'Regular practice and review help move information from short-term to long-term memory and improve understanding.'
        },
        {
          prompt: 'How should you approach complex problems?',
          options: [
            'Avoid them completely',
            'Guess the answer',
            'Break them into smaller parts',
            'Ask someone else to solve them'
          ],
          correctAnswer: 'Break them into smaller parts',
          explanation: 'Breaking complex problems into smaller, manageable parts makes them easier to understand and solve systematically.'
        }
      ]
    });
  }

  /**
   * Get fallback course outline
   */
  getFallbackCourseOutline({ topic, studyType, difficultyLevel }) {
    telemetryService.recordEvent('fallback_course_outline_used', {
      topic,
      studyType,
      difficultyLevel
    });

    // Try to find a matching template
    const topicKey = this.findBestMatchingKey(topic, this.fallbackTemplates.courseOutlines);
    let template = this.fallbackTemplates.courseOutlines.get(topicKey);

    if (!template) {
      // Generate a generic template
      template = this.generateGenericCourseOutline(topic, studyType, difficultyLevel);
    }

    // Customize template based on parameters
    return this.customizeTemplate(template, { topic, studyType, difficultyLevel });
  }

  /**
   * Get fallback chapter content
   */
  getFallbackChapterContent({ courseTitle, chapter }) {
    telemetryService.recordEvent('fallback_chapter_content_used', {
      courseTitle,
      chapterTitle: chapter.title
    });

    const template = this.fallbackTemplates.chapterContent.get('default');
    
    return {
      notes: template.notes.replace(/Chapter Content/g, chapter.title || 'Chapter Content'),
      keyPoints: template.keyPoints
    };
  }

  /**
   * Get fallback flashcards
   */
  getFallbackFlashcards({ topic, chapter, count = 5 }) {
    telemetryService.recordEvent('fallback_flashcards_used', {
      topic,
      chapterTitle: chapter.title,
      count
    });

    const template = this.fallbackTemplates.flashcards.get('default');
    
    // Return requested number of flashcards, cycling through template if needed
    const flashcards = [];
    for (let i = 0; i < count; i++) {
      const templateCard = template[i % template.length];
      flashcards.push({
        front: templateCard.front.replace(/chapter/gi, chapter.title || 'chapter'),
        back: templateCard.back.replace(/subject area/gi, topic || 'subject area')
      });
    }

    return flashcards;
  }

  /**
   * Get fallback quiz
   */
  getFallbackQuiz({ topic, chapter, difficultyLevel, count = 3 }) {
    telemetryService.recordEvent('fallback_quiz_used', {
      topic,
      chapterTitle: chapter.title,
      difficultyLevel,
      count
    });

    const template = this.fallbackTemplates.quizzes.get('default');
    
    // Return requested number of questions, cycling through template if needed
    const questions = [];
    for (let i = 0; i < count; i++) {
      const templateQuestion = template.questions[i % template.questions.length];
      questions.push({
        ...templateQuestion,
        prompt: templateQuestion.prompt.replace(/concepts/gi, `${topic} concepts`)
      });
    }

    return { questions };
  }

  /**
   * Find best matching key for a topic
   */
  findBestMatchingKey(topic, templateMap) {
    if (!topic) return null;

    const topicLower = topic.toLowerCase();
    
    // Direct match
    if (templateMap.has(topicLower)) {
      return topicLower;
    }

    // Partial match
    for (const key of templateMap.keys()) {
      if (topicLower.includes(key) || key.includes(topicLower)) {
        return key;
      }
    }

    return null;
  }

  /**
   * Generate generic course outline
   */
  generateGenericCourseOutline(topic, studyType, difficultyLevel) {
    const levelAdjectives = {
      beginner: 'Introduction to',
      intermediate: 'Understanding',
      advanced: 'Advanced'
    };

    const prefix = levelAdjectives[difficultyLevel] || 'Introduction to';
    
    return {
      title: `${prefix} ${topic}`,
      summary: `This course provides a comprehensive overview of ${topic}, covering essential concepts, practical applications, and key principles. Students will develop a solid understanding of the subject matter through structured learning and hands-on practice.`,
      chapters: [
        {
          title: `Fundamentals of ${topic}`,
          summary: `Introduction to basic concepts and terminology in ${topic}.`,
          topics: ['Basic Concepts', 'Key Terminology', 'Historical Context', 'Current Applications']
        },
        {
          title: `Core Principles`,
          summary: `Understanding the fundamental principles that govern ${topic}.`,
          topics: ['Primary Principles', 'Theoretical Framework', 'Practical Implications', 'Common Patterns']
        },
        {
          title: `Practical Applications`,
          summary: `Exploring real-world applications and use cases of ${topic}.`,
          topics: ['Industry Applications', 'Case Studies', 'Best Practices', 'Common Challenges']
        },
        {
          title: `Advanced Topics`,
          summary: `Delving into more complex aspects and future developments in ${topic}.`,
          topics: ['Advanced Techniques', 'Emerging Trends', 'Future Directions', 'Research Areas']
        }
      ]
    };
  }

  /**
   * Customize template based on parameters
   */
  customizeTemplate(template, params) {
    const { topic, studyType, difficultyLevel } = params;
    
    // Create a deep copy to avoid modifying the original template
    const customized = JSON.parse(JSON.stringify(template));
    
    // Customize title if it's too generic
    if (customized.title.includes('Introduction') && topic) {
      const levelPrefix = difficultyLevel === 'advanced' ? 'Advanced' : 
                         difficultyLevel === 'intermediate' ? 'Comprehensive' : 'Introduction to';
      customized.title = `${levelPrefix} ${topic}`;
    }

    // Customize summary
    if (topic && !customized.summary.includes(topic)) {
      customized.summary = customized.summary.replace(/subject matter/gi, topic);
    }

    return customized;
  }

  /**
   * Check if fallback should be used based on error patterns
   */
  shouldUseFallback(error, operation, retryCount = 0) {
    const fallbackTriggers = [
      'rate limit',
      'quota exceeded',
      'service unavailable',
      'timeout',
      'network error',
      'parse error'
    ];

    const errorMessage = error.message?.toLowerCase() || '';
    const shouldFallback = fallbackTriggers.some(trigger => errorMessage.includes(trigger)) || 
                          retryCount >= 3;

    if (shouldFallback) {
      telemetryService.recordEvent('fallback_triggered', {
        operation,
        error: error.message,
        retryCount,
        trigger: fallbackTriggers.find(trigger => errorMessage.includes(trigger)) || 'max_retries'
      });
    }

    return shouldFallback;
  }

  /**
   * Get fallback content with error context
   */
  getFallbackWithContext(operation, params, error) {
    const context = {
      operation,
      error: error.message,
      timestamp: new Date().toISOString(),
      fallbackUsed: true
    };

    let fallbackContent;

    switch (operation) {
      case 'course_outline':
        fallbackContent = this.getFallbackCourseOutline(params);
        break;
      case 'chapter_content':
        fallbackContent = this.getFallbackChapterContent(params);
        break;
      case 'flashcards':
        fallbackContent = this.getFallbackFlashcards(params);
        break;
      case 'quiz':
        fallbackContent = this.getFallbackQuiz(params);
        break;
      default:
        throw new Error(`No fallback available for operation: ${operation}`);
    }

    // Add metadata to indicate fallback was used
    if (typeof fallbackContent === 'object' && fallbackContent !== null) {
      fallbackContent._fallback = context;
    }

    return fallbackContent;
  }

  /**
   * Add new fallback template
   */
  addFallbackTemplate(type, key, template) {
    if (!this.fallbackTemplates[type]) {
      this.fallbackTemplates[type] = new Map();
    }
    
    this.fallbackTemplates[type].set(key, template);
    
    telemetryService.recordEvent('fallback_template_added', {
      type,
      key,
      templateSize: JSON.stringify(template).length
    });
  }

  /**
   * Get fallback statistics
   */
  getFallbackStats() {
    const stats = {
      templates: {},
      totalTemplates: 0
    };

    for (const [type, templateMap] of Object.entries(this.fallbackTemplates)) {
      stats.templates[type] = templateMap.size;
      stats.totalTemplates += templateMap.size;
    }

    return stats;
  }
}

// Create singleton instance
const fallbackService = new FallbackService();

export default fallbackService;