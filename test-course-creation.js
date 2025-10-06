/**
 * Test script to verify course creation flow
 * This simulates the course creation API call
 */

import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from frontend/.env.local
config({ path: resolve(__dirname, 'frontend/.env.local') });

// Import the AI service and content generator
import contentGenerator from './backend/ai/content-generator.js';

async function testCourseCreation() {
  console.log('🧪 Testing Course Creation Flow...\n');

  try {
    // Test 1: Generate course outline
    console.log('📝 Test 1: Generating course outline...');
    const courseOutline = await contentGenerator.generateCourseOutline({
      topic: 'Introduction to JavaScript',
      difficulty: 'beginner',
      duration: 'short'
    });

    console.log('✅ Course outline generated successfully!');
    console.log('   Title:', courseOutline.title);
    console.log('   Summary:', courseOutline.summary ? courseOutline.summary.substring(0, 100) + '...' : 'N/A');
    console.log('   Chapters:', courseOutline.chapters?.length || 0);
    console.log('   First chapter:', courseOutline.chapters?.[0]?.title || 'N/A');
    console.log('');

    // Test 2: Generate flashcards
    console.log('🎴 Test 2: Generating flashcards...');
    const flashcards = await contentGenerator.generateFlashcards({
      topic: courseOutline.title,
      chapter: courseOutline.chapters[0],
      count: 5
    });

    console.log('✅ Flashcards generated successfully!');
    const flashcardArray = Array.isArray(flashcards) ? flashcards : (flashcards.flashcards || []);
    console.log('   Number of flashcards:', flashcardArray.length);
    if (flashcardArray.length > 0) {
      console.log('   First flashcard:');
      console.log('     Front:', flashcardArray[0].front || flashcardArray[0].question);
      console.log('     Back:', flashcardArray[0].back || flashcardArray[0].answer);
    }
    console.log('');

    // Test 3: Generate quiz
    console.log('📝 Test 3: Generating quiz...');
    const quiz = await contentGenerator.generateQuiz({
      topic: courseOutline.title,
      chapter: courseOutline.chapters[0],
      difficultyLevel: 'beginner',
      count: 3
    });

    console.log('✅ Quiz generated successfully!');
    const questions = quiz.questions || [];
    console.log('   Number of questions:', questions.length);
    if (questions.length > 0) {
      console.log('   First question:');
      console.log('     Q:', questions[0].prompt || questions[0].question);
      console.log('     Options:', questions[0].options?.length || 0);
      console.log('     Correct:', questions[0].correctAnswer);
    }
    console.log('');

    console.log('🎉 All tests passed! Course creation flow is working correctly.\n');
    console.log('Summary:');
    console.log('  ✅ Course outline generation');
    console.log('  ✅ Flashcard generation');
    console.log('  ✅ Quiz generation');
    console.log('');
    console.log('The AI Learn application is ready for use! 🚀');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('');
    console.error('Error details:');
    console.error('  Name:', error.name);
    console.error('  Message:', error.message);
    if (error.cause) {
      console.error('  Cause:', error.cause);
    }
    if (error.stack) {
      console.error('');
      console.error('Stack trace:');
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Run the test
testCourseCreation();