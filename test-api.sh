#!/bin/bash

# Test API Endpoint
# This script tests if the /api/courses endpoint is accessible

echo "Testing /api/courses endpoint..."
echo ""

# Test without authentication (should return 401)
echo "1. Testing without authentication (should return 401):"
curl -X POST http://localhost:3000/api/courses \
  -H "Content-Type: application/json" \
  -d '{"topic":"Test","studyType":"exam","difficultyLevel":"beginner"}' \
  -w "\nStatus Code: %{http_code}\n" \
  -s

echo ""
echo "---"
echo ""

# Test with invalid data (should return 400)
echo "2. Testing with invalid data (should return 400):"
curl -X POST http://localhost:3000/api/courses \
  -H "Content-Type: application/json" \
  -d '{"topic":"","studyType":"invalid","difficultyLevel":"beginner"}' \
  -w "\nStatus Code: %{http_code}\n" \
  -s

echo ""
echo "---"
echo ""

echo "Note: To test with authentication, you need to:"
echo "1. Sign in to the app in your browser"
echo "2. Open DevTools → Application → Cookies"
echo "3. Copy the Clerk session cookie"
echo "4. Add it to the curl command with -H 'Cookie: __session=...'"