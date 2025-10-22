#!/bin/bash

###############################################################################
# Smoke Test Runner
#
# Runs comprehensive smoke tests and generates visual report
###############################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  Cortex DC Portal - Smoke Test Suite${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check if dev server is running
echo -e "${YELLOW}→ Checking if development server is running...${NC}"
if ! curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
    echo -e "${RED}✗ Development server is not running on http://localhost:3000${NC}"
    echo -e "${YELLOW}  Please start the dev server with: pnpm --filter @cortex-dc/web dev${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Development server is running${NC}"
echo ""

# Create test results directory
echo -e "${YELLOW}→ Creating test results directory...${NC}"
mkdir -p test-results/smoke
echo -e "${GREEN}✓ Test results directory created${NC}"
echo ""

# Run smoke tests
echo -e "${YELLOW}→ Running smoke tests...${NC}"
echo ""

E2E_BASE_URL=http://localhost:3000 pnpm playwright test tests/smoke/routes.spec.ts \
    --reporter=html \
    --reporter=list \
    || {
        echo ""
        echo -e "${RED}✗ Smoke tests failed${NC}"
        echo -e "${YELLOW}  Opening test report...${NC}"
        pnpm playwright show-report
        exit 1
    }

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  ✓ All smoke tests passed!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Generate summary report
echo -e "${BLUE}📊 Test Summary:${NC}"
echo ""
echo -e "  Screenshots saved to: ${YELLOW}test-results/smoke/${NC}"
echo -e "  HTML Report: ${YELLOW}playwright-report/index.html${NC}"
echo ""

# Open test report
echo -e "${YELLOW}→ Opening test report...${NC}"
pnpm playwright show-report

echo ""
echo -e "${GREEN}✓ Smoke test complete!${NC}"
