/**
 * Cleanup script to remove notes with JSON parsing errors
 * Run with: node cleanup-bad-notes.js
 */

import { db } from './backend/configs/db.js';
import { NOTE_TABLE } from './backend/configs/schema.js';
import { like, or, eq } from 'drizzle-orm';

async function cleanupBadNotes() {
  console.log('🔍 Searching for notes with JSON parsing errors...\n');
  
  try {
    // Find services:
  - type: web
    name: ai-learn-frontend
    env: node
    rootDir: frontend
    buildCommand: npm install && npm run build
    startCommand: npm run start
    envVars:
      - key: NEXT_PUBLIC_APP_URL
        value: https://ai-learn-frontend.onrender.com
      - key: DATABASE_URL
        sync: false
      - key: NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
        sync: false
      - key: CLERK_SECRET_KEY
        sync: false
      # Add other secrets with sync: false and set them via Render GUI or CLI
notes that contain error messages
    const badNotes = await db
      .select()
      .from(NOTE_TABLE)
      .where(
        or(
          like(NOTE_TABLE.content, '%JSON parsing failed%'),
          like(NOTE_TABLE.content, '%Failed to parse AI JSON response%'),
          like(NOTE_TABLE.content, '%AiResponseParseError%')
        )
      );

    if (badNotes.length === 0) {
      console.log('✅ No bad notes found! Database is clean.\n');
      return;
    }

    console.log(`❌ Found ${badNotes.length} note(s) with parsing errors:\n`);
    
    badNotes.forEach((note, index) => {
      console.log(`${index + 1}. Note ID: ${note.id}`);
      console.log(`   Chapter ID: ${note.chapterId}`);
      console.log(`   Content preview: ${note.content.substring(0, 100)}...`);
      console.log('');
    });

    // Delete the bad notes
    console.log('🗑️  Deleting bad notes...\n');
    
    const noteIds = badNotes.map(note => note.id);
    
    for (const noteId of noteIds) {
      await db
        .delete(NOTE_TABLE)
        .where(eq(NOTE_TABLE.id, noteId));
      console.log(`   ✓ Deleted note ${noteId}`);
    }

    console.log(`\n✅ Successfully deleted ${badNotes.length} bad note(s)!\n`);
    console.log('📝 You can now regenerate notes for these chapters.\n');
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    console.error('Error details:', error.message);
    throw error;
  }
}

// Run the cleanup
cleanupBadNotes()
  .then(() => {
    console.log('✅ Cleanup complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Cleanup failed:', error);
    process.exit(1);
  });