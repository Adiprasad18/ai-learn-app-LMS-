#!/bin/bash

# AI Learn Development Server Stop Script
# This script stops all running development servers

echo "🛑 Stopping AI Learn Development Servers..."
echo ""

# Kill Next.js dev server
echo "Stopping Frontend..."
pkill -f "next dev" 2>/dev/null
if [ -f /tmp/ailearn-frontend.pid ]; then
    kill $(cat /tmp/ailearn-frontend.pid) 2>/dev/null
    rm /tmp/ailearn-frontend.pid
fi

# Kill Inngest dev server
echo "Stopping Inngest..."
pkill -f "inngest-cli dev" 2>/dev/null
if [ -f /tmp/ailearn-inngest.pid ]; then
    kill $(cat /tmp/ailearn-inngest.pid) 2>/dev/null
    rm /tmp/ailearn-inngest.pid
fi

echo ""
echo "✅ All servers stopped!"