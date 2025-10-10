#!/bin/bash

# AI Learn Development Server Status Script

echo "🔍 Checking AI Learn Development Servers Status..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Frontend
if pgrep -f "next dev" > /dev/null; then
    echo -e "${GREEN}✓ Frontend (Next.js) is running${NC}"
    echo "  URL: http://localhost:3000"
else
    echo -e "${RED}✗ Frontend is not running${NC}"
fi

echo ""

# Check Inngest
if pgrep -f "inngest-cli dev" > /dev/null; then
    echo -e "${GREEN}✓ Inngest Dev Server is running${NC}"
    echo "  URL: http://localhost:8288"
else
    echo -e "${RED}✗ Inngest is not running${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Show process details
NEXT_PID=$(pgrep -f "next dev" | head -1)
INNGEST_PID=$(pgrep -f "inngest-cli dev" | head -1)

if [ ! -z "$NEXT_PID" ] || [ ! -z "$INNGEST_PID" ]; then
    echo ""
    echo "Process Details:"
    if [ ! -z "$NEXT_PID" ]; then
        echo "  Frontend PID: $NEXT_PID"
    fi
    if [ ! -z "$INNGEST_PID" ]; then
        echo "  Inngest PID: $INNGEST_PID"
    fi
fi

echo ""