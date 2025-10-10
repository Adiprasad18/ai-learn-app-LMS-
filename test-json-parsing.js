/**
 * Test script to verify JSON parsing logic
 * Run with: node test-json-parsing.js
 */

// Simulate the parseStructuredJson function
function parseStructuredJson(rawResponse) {
  console.log('=== Testing JSON Parsing ===');
  console.log('Raw response length:', rawResponse?.length);
  console.log('Raw response preview (first 200 chars):', rawResponse?.substring(0, 200));
  console.log('');
  
  // Try multiple extraction strategies
  let cleanedResponse = rawResponse.trim();
  
  // Strategy 1: Extract from ```json code blocks
  const jsonMatch = rawResponse.match(/```json\s*([\s\S]*?)\s*```/i);
  if (jsonMatch) {
    console.log('✓ Strategy 1: Found JSON in ```json code block');
    cleanedResponse = jsonMatch[1].trim();
  } else {
    console.log('✗ Strategy 1: No ```json code block found');
    
    // Strategy 2: Extract from ``` code blocks without json tag
    const codeMatch = rawResponse.match(/```\s*([\s\S]*?)\s*```/);
    if (codeMatch) {
      console.log('✓ Strategy 2: Found content in generic ``` code block');
      cleanedResponse = codeMatch[1].trim();
    } else {
      console.log('✗ Strategy 2: No generic code block found');
    }
  }
  
  // Strategy 3: Find JSON object boundaries
  const jsonStart = cleanedResponse.indexOf('{');
  const jsonEnd = cleanedResponse.lastIndexOf('}');
  if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
    cleanedResponse = cleanedResponse.substring(jsonStart, jsonEnd + 1);
    console.log('✓ Strategy 3: Extracted JSON from boundaries { ... }');
    console.log('  Extracted length:', cleanedResponse.length);
  } else {
    console.log('✗ Strategy 3: Could not find JSON boundaries');
  }

  console.log('');
  console.log('Cleaned response preview (first 200 chars):', cleanedResponse.substring(0, 200));
  console.log('');

  try {
    const parsed = JSON.parse(cleanedResponse);
    console.log('✅ SUCCESS: JSON parsed successfully!');
    console.log('   Keys:', Object.keys(parsed));
    if (parsed.notes) {
      console.log('   Notes length:', parsed.notes.length);
    }
    if (parsed.keyPoints) {
      console.log('   Key points count:', parsed.keyPoints.length);
    }
    return parsed;
  } catch (parseError) {
    console.error('❌ FAILED: JSON parse error:', parseError.message);
    console.error('   First 100 chars of cleaned response:', cleanedResponse.substring(0, 100));
    throw parseError;
  }
}

// Test cases
const testCases = [
  {
    name: 'Case 1: JSON in ```json code block',
    input: '```json\n{\n  "notes": "## Chapter 1\\n\\nContent here",\n  "keyPoints": ["Point 1", "Point 2"]\n}\n```'
  },
  {
    name: 'Case 2: JSON in generic ``` code block',
    input: '```\n{\n  "notes": "## Chapter 1\\n\\nContent here",\n  "keyPoints": ["Point 1", "Point 2"]\n}\n```'
  },
  {
    name: 'Case 3: Plain JSON without code blocks',
    input: '{\n  "notes": "## Chapter 1\\n\\nContent here",\n  "keyPoints": ["Point 1", "Point 2"]\n}'
  },
  {
    name: 'Case 4: JSON with leading text',
    input: 'Here is the response:\n{\n  "notes": "## Chapter 1\\n\\nContent here",\n  "keyPoints": ["Point 1", "Point 2"]\n}'
  },
  {
    name: 'Case 5: JSON with trailing text',
    input: '{\n  "notes": "## Chapter 1\\n\\nContent here",\n  "keyPoints": ["Point 1", "Point 2"]\n}\nThat\'s the end.'
  },
  {
    name: 'Case 6: Complex JSON with nested content',
    input: '```json\n{\n  "notes": "## Chapter 1: Getting Started with Python\\n\\n### Introduction\\nWelcome to the exciting world of Python programming! This chapter serves as your foundational guide, introducing you to one of the most versatile and beginner-friendly programming languages available today.",\n  "keyPoints": [\n    "Python is a high-level, interpreted programming language",\n    "Known for its simple and readable syntax",\n    "Widely used in web development, data science, AI, and automation",\n    "Has a large standard library and active community"\n  ]\n}\n```'
  }
];

// Run tests
console.log('╔════════════════════════════════════════════════════════════════╗');
console.log('║         JSON Parsing Logic Test Suite                         ║');
console.log('╚════════════════════════════════════════════════════════════════╝');
console.log('');

let passed = 0;
let failed = 0;

testCases.forEach((testCase, index) => {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`TEST ${index + 1}: ${testCase.name}`);
  console.log('='.repeat(70));
  
  try {
    parseStructuredJson(testCase.input);
    passed++;
    console.log('\n✅ TEST PASSED\n');
  } catch (error) {
    failed++;
    console.log('\n❌ TEST FAILED\n');
  }
});

console.log('\n' + '='.repeat(70));
console.log('SUMMARY');
console.log('='.repeat(70));
console.log(`Total tests: ${testCases.length}`);
console.log(`Passed: ${passed} ✅`);
console.log(`Failed: ${failed} ❌`);
console.log(`Success rate: ${((passed / testCases.length) * 100).toFixed(1)}%`);
console.log('='.repeat(70));

if (failed === 0) {
  console.log('\n🎉 All tests passed! The parsing logic is working correctly.\n');
} else {
  console.log('\n⚠️  Some tests failed. Review the output above for details.\n');
}