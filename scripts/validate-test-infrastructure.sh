#!/bin/bash

# Cortex DC Web - Test Infrastructure Validation Script
# This script validates the complete E2E testing setup

set -e  # Exit on error

echo "🚀 Cortex DC Web - Test Infrastructure Validation"
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    local status=$1
    local message=$2
    if [ "$status" = "success" ]; then
        echo -e "${GREEN}✅ $message${NC}"
    elif [ "$status" = "warning" ]; then
        echo -e "${YELLOW}⚠️  $message${NC}"
    elif [ "$status" = "error" ]; then
        echo -e "${RED}❌ $message${NC}"
    else
        echo -e "${BLUE}ℹ️  $message${NC}"
    fi
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Step 1: Check prerequisites
echo -e "\n${BLUE}Step 1: Checking Prerequisites${NC}"
echo "--------------------------------"

if command_exists node; then
    NODE_VERSION=$(node --version)
    print_status "success" "Node.js installed: $NODE_VERSION"
    
    # Check Node version (should be >=18)
    NODE_MAJOR=$(echo $NODE_VERSION | sed 's/v\([0-9]*\).*/\1/')
    if [ "$NODE_MAJOR" -ge 18 ]; then
        print_status "success" "Node.js version is compatible (>=18)"
    else
        print_status "error" "Node.js version $NODE_VERSION is too old. Please upgrade to >=18"
        exit 1
    fi
else
    print_status "error" "Node.js not found. Please install Node.js >=18"
    exit 1
fi

if command_exists pnpm; then
    PNPM_VERSION=$(pnpm --version)
    print_status "success" "pnpm installed: v$PNPM_VERSION"
else
    print_status "error" "pnpm not found. Please install pnpm: npm install -g pnpm"
    exit 1
fi

if command_exists firebase; then
    FIREBASE_VERSION=$(firebase --version)
    print_status "success" "Firebase CLI installed: $FIREBASE_VERSION"
else
    print_status "error" "Firebase CLI not found. Please install: npm install -g firebase-tools"
    exit 1
fi

if command_exists npx; then
    print_status "success" "npx available"
else
    print_status "error" "npx not found"
    exit 1
fi

# Step 2: Check project structure
echo -e "\n${BLUE}Step 2: Validating Project Structure${NC}"
echo "-------------------------------------"

required_files=(
    "firebase.json"
    "package.json"
    "tests/e2e/playwright.config.ts"
    "tests/e2e/utils/auth-helpers.ts"
    "tests/e2e/specs/000-core-firebase.spec.ts"
    "tests/e2e/specs/005-auth-role-management.spec.ts"
    "tests/e2e/specs/010-pov-creation-wizard.spec.ts"
    "tests/e2e/specs/020-trr-approval-workflow.spec.ts"
    "tests/e2e/specs/030-cross-browser-visual.spec.ts"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        print_status "success" "Found: $file"
    else
        print_status "error" "Missing: $file"
        exit 1
    fi
done

# Step 3: Install dependencies
echo -e "\n${BLUE}Step 3: Installing Dependencies${NC}"
echo "-----------------------------------"

print_status "info" "Installing project dependencies..."
if pnpm install --silent; then
    print_status "success" "Dependencies installed successfully"
else
    print_status "error" "Failed to install dependencies"
    exit 1
fi

# Step 4: Install Playwright browsers
echo -e "\n${BLUE}Step 4: Installing Playwright Browsers${NC}"
echo "---------------------------------------"

print_status "info" "Installing Playwright browsers..."
if npx playwright install --with-deps; then
    print_status "success" "Playwright browsers installed successfully"
else
    print_status "error" "Failed to install Playwright browsers"
    exit 1
fi

# Step 5: Check Firebase project configuration
echo -e "\n${BLUE}Step 5: Firebase Configuration Check${NC}"
echo "------------------------------------"

if [ -f "firebase.json" ]; then
    print_status "success" "Firebase configuration file exists"
    
    # Check if emulators are configured
    if grep -q "emulators" firebase.json; then
        print_status "success" "Firebase emulators configured"
    else
        print_status "warning" "Firebase emulators not configured in firebase.json"
    fi
else
    print_status "error" "firebase.json not found"
    exit 1
fi

# Step 6: Validate test configuration
echo -e "\n${BLUE}Step 6: Test Configuration Validation${NC}"
echo "-------------------------------------"

if [ -f "tests/e2e/playwright.config.ts" ]; then
    print_status "success" "Playwright configuration found"
    
    # Check if config includes required projects
    if grep -q "projects:" "tests/e2e/playwright.config.ts"; then
        print_status "success" "Multi-browser projects configured"
    else
        print_status "warning" "Multi-browser projects may not be configured"
    fi
else
    print_status "error" "Playwright configuration missing"
    exit 1
fi

# Step 7: Run syntax validation on test files
echo -e "\n${BLUE}Step 7: Test File Syntax Validation${NC}"
echo "-----------------------------------"

test_files=(
    "tests/e2e/specs/000-core-firebase.spec.ts"
    "tests/e2e/specs/005-auth-role-management.spec.ts"
    "tests/e2e/specs/010-pov-creation-wizard.spec.ts"
    "tests/e2e/specs/020-trr-approval-workflow.spec.ts"
    "tests/e2e/specs/030-cross-browser-visual.spec.ts"
)

for test_file in "${test_files[@]}"; do
    if npx tsc --noEmit "$test_file" 2>/dev/null; then
        print_status "success" "Syntax valid: $(basename $test_file)"
    else
        print_status "warning" "Syntax check failed: $(basename $test_file) (may need project build)"
    fi
done

# Step 8: Test a simple Playwright command
echo -e "\n${BLUE}Step 8: Playwright Command Test${NC}"
echo "--------------------------------"

print_status "info" "Testing Playwright CLI..."
if npx playwright --version >/dev/null 2>&1; then
    PLAYWRIGHT_VERSION=$(npx playwright --version)
    print_status "success" "Playwright CLI working: $PLAYWRIGHT_VERSION"
else
    print_status "error" "Playwright CLI not working"
    exit 1
fi

# Step 9: Check available test scripts
echo -e "\n${BLUE}Step 9: Available Test Scripts${NC}"
echo "------------------------------"

test_scripts=(
    "test:e2e"
    "test:core"
    "test:auth"
    "test:pov"
    "test:trr"
    "test:visual"
    "test:cross-browser"
)

for script in "${test_scripts[@]}"; do
    if grep -q "\"$script\":" package.json; then
        print_status "success" "Script available: pnpm run $script"
    else
        print_status "warning" "Script missing: $script"
    fi
done

# Step 10: Firebase login check
echo -e "\n${BLUE}Step 10: Firebase Authentication Check${NC}"
echo "--------------------------------------"

if firebase projects:list >/dev/null 2>&1; then
    print_status "success" "Firebase authentication working"
    
    # Get current project
    CURRENT_PROJECT=$(firebase use 2>/dev/null || echo "No project selected")
    print_status "info" "Current Firebase project: $CURRENT_PROJECT"
else
    print_status "warning" "Firebase authentication needed. Run: firebase login"
fi

# Summary
echo -e "\n${GREEN}🎉 Test Infrastructure Validation Complete!${NC}"
echo "=============================================="

cat << EOF

${YELLOW}Next Steps:${NC}
1. Ensure Firebase authentication is set up: ${BLUE}firebase login${NC}
2. Set Firebase project: ${BLUE}firebase use YOUR_PROJECT_ID${NC}
3. Start Firebase emulators: ${BLUE}pnpm run firebase:emulators${NC}
4. Run tests: ${BLUE}pnpm run test:e2e${NC}

${YELLOW}Quick Test Commands:${NC}
- Run core Firebase tests: ${BLUE}pnpm run test:core${NC}
- Run authentication tests: ${BLUE}pnpm run test:auth${NC} 
- Run POV workflow tests: ${BLUE}pnpm run test:pov${NC}
- Run TRR approval tests: ${BLUE}pnpm run test:trr${NC}
- Run visual regression tests: ${BLUE}pnpm run test:visual${NC}
- Interactive UI mode: ${BLUE}pnpm run test:e2e:ui${NC}

${YELLOW}Debugging:${NC}
- Headed mode: ${BLUE}pnpm run test:e2e:headed${NC}
- Debug mode: ${BLUE}pnpm run test:e2e:debug${NC}
- View test reports: ${BLUE}pnpm run test:report${NC}

${GREEN}✅ Your E2E testing infrastructure is ready!${NC}

For detailed documentation, see: ${BLUE}tests/e2e/README.md${NC}
EOF

exit 0