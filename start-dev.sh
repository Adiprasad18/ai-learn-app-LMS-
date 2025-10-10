#!/bin/bash

# AI Learn Development Server Startup Script
# This script starts both the frontend and Inngest dev server

echo "🚀 Starting AI Learn Development Servers..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Start Frontend
echo -e "${BLUE}📦 Starting Frontend (Next.js)...${NC}"
cd /Users/adipr/Desktop/ai-learn/frontend
npm run dev &
FRONTEND_PID=$!
echo -e "${GREEN}✓ Frontend started (PID: $FRONTEND_PID)${NC}"
echo ""

# Wait for frontend to be ready
sleep 3

# Start Inngest Dev Server
echo -e "${BLUE}⚡ Starting Inngest Dev Server...${NC}"
cd /Users/adipr/Desktop/ai-learn
npx inngest-cli@latest dev -u http://localhost:3000/api/inngest &
INNGEST_PID=$!
echo -e "${GREEN}✓ Inngest started (PID: $INNGEST_PID)${NC}"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ All servers are running!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📍 Frontend:      http://localhost:3000"
echo "📍 Inngest UI:    http://localhost:8288"
echo ""
echo "💡 To stop all servers, press Ctrl+C or run: ./stop-dev.sh"
echo ""

# Save PIDs to file for stop script
echo "$FRONTEND_PID" > /tmp/ailearn-frontend.pid
echo "$INNGEST_PID" > /tmp/ailearn-inngest.pid

# Wait for user interrupt
wait