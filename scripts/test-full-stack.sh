#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting Full-Stack E2E Testing (Auth + Firestore + Storage + Functions + Next.js)${NC}"

# Function to cleanup on exit
cleanup() {
    echo -e "${YELLOW}🧹 Cleaning up processes...${NC}"
    # Kill background processes by job control
    jobs -p | xargs -r kill 2>/dev/null || true
    # Kill by port if needed
    lsof -ti:3000,9098,8081,9199,5001,4040 2>/dev/null | xargs -r kill 2>/dev/null || true
    echo -e "${GREEN}✅ Cleanup completed${NC}"
}

# Set up trap to cleanup on script exit
trap cleanup EXIT

# Check if required commands exist
command -v firebase >/dev/null 2>&1 || { echo "Firebase CLI required but not installed. Aborting." >&2; exit 1; }
command -v pnpm >/dev/null 2>&1 || { echo "pnpm required but not installed. Aborting." >&2; exit 1; }
command -v npx >/dev/null 2>&1 || { echo "npx required but not installed. Aborting." >&2; exit 1; }

echo -e "${YELLOW}📡 Starting Firebase emulators (Auth + Firestore + Storage + Functions)...${NC}"
firebase emulators:start --only auth,firestore,storage,functions --project cortex-dc-web-dev > /tmp/emulator-full.log 2>&1 &
EMULATOR_PID=$!

echo -e "${YELLOW}🌐 Starting Next.js app...${NC}"
pnpm -F web dev > /tmp/nextjs-full.log 2>&1 &
NEXTJS_PID=$!

# Wait for services to be ready
echo -e "${YELLOW}⏳ Waiting for services to be ready...${NC}"
sleep 15

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

if curl -s http://localhost:9199 > /dev/null; then
    echo -e "${GREEN}✅ Firebase Storage emulator ready${NC}"
else
    echo -e "${RED}❌ Firebase Storage emulator failed to start${NC}"
    exit 1
fi

if curl -s http://localhost:5001 > /dev/null; then
    echo -e "${GREEN}✅ Firebase Functions emulator ready${NC}"
else
    echo -e "${RED}❌ Firebase Functions emulator failed to start${NC}"
    exit 1
fi

# Check if Next.js is ready
if curl -s http://localhost:3000 > /dev/null; then
    echo -e "${GREEN}✅ Next.js app ready${NC}"
else
    echo -e "${RED}❌ Next.js app failed to start${NC}"
    exit 1
fi

# Seed test users and data
echo -e "${YELLOW}🌱 Seeding test data...${NC}"
FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9098 FIRESTORE_EMULATOR_HOST=127.0.0.1:8081 FIREBASE_STORAGE_EMULATOR_HOST=127.0.0.1:9199 pnpm seed:users || echo "⚠️ User seeding failed (may already exist)"

echo -e "${YELLOW}🧪 Running full-stack Playwright tests...${NC}"
npx playwright test -c tests/e2e/playwright-simple.config.ts tests/e2e/specs/ --project=chromium --reporter=list

echo -e "${GREEN}🎉 Full-stack E2E tests completed successfully!${NC}"