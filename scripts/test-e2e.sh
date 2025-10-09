#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting E2E Testing Pipeline${NC}"

# Function to cleanup on exit
cleanup() {
    echo -e "${YELLOW}🧹 Cleaning up processes...${NC}"
    # Kill background processes by job control
    jobs -p | xargs -r kill 2>/dev/null || true
    # Kill by port if needed
    lsof -ti:3000,9098,8081,4040 2>/dev/null | xargs -r kill 2>/dev/null || true
    echo -e "${GREEN}✅ Cleanup completed${NC}"
}

# Set up trap to cleanup on script exit
trap cleanup EXIT

# Check if required commands exist
command -v firebase >/dev/null 2>&1 || { echo "Firebase CLI required but not installed. Aborting." >&2; exit 1; }
command -v pnpm >/dev/null 2>&1 || { echo "pnpm required but not installed. Aborting." >&2; exit 1; }
command -v npx >/dev/null 2>&1 || { echo "npx required but not installed. Aborting." >&2; exit 1; }

echo -e "${YELLOW}📡 Starting Firebase emulators...${NC}"
firebase emulators:start --only auth,firestore --project cortex-dc-web-dev > /tmp/emulator.log 2>&1 &
EMULATOR_PID=$!

echo -e "${YELLOW}🌐 Starting Next.js app...${NC}"
pnpm -F web dev > /tmp/nextjs.log 2>&1 &
NEXTJS_PID=$!

# Wait for services to be ready
echo -e "${YELLOW}⏳ Waiting for services to be ready...${NC}"
sleep 10

# Check if emulators are ready
if curl -s http://localhost:9098 > /dev/null; then
    echo -e "${GREEN}✅ Firebase Auth emulator ready${NC}"
else
    echo -e "${RED}❌ Firebase Auth emulator failed to start${NC}"
    exit 1
fi

if curl -s http://localhost:8081 > /dev/null; then
    echo -e "${GREEN}✅ Firebase Firestore emulator ready${NC}"
else
    echo -e "${RED}❌ Firebase Firestore emulator failed to start${NC}"
    exit 1
fi

# Check if Next.js is ready
if curl -s http://localhost:3000 > /dev/null; then
    echo -e "${GREEN}✅ Next.js app ready${NC}"
else
    echo -e "${RED}❌ Next.js app failed to start${NC}"
    exit 1
fi

echo -e "${YELLOW}🧪 Running Playwright tests...${NC}"
npx playwright test -c tests/e2e/playwright-simple.config.ts tests/e2e/specs/ --project=chromium

echo -e "${GREEN}🎉 E2E tests completed successfully!${NC}"