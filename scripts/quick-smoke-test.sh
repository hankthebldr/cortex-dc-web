#!/bin/bash

###############################################################################
# Quick Smoke Test - Route Verification
#
# Fast smoke test to verify all routes are accessible
###############################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

BASE_URL="http://localhost:3000"
RESULTS_FILE="test-results/smoke/quick-test-results.json"

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  Quick Smoke Test - Route Verification${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Initialize results
mkdir -p test-results/smoke
echo "{\"timestamp\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",\"results\":[]}" > "$RESULTS_FILE"

# Test function
test_route() {
    local route=$1
    local expected_status=$2
    local description=$3

    echo -n "Testing ${description}... "

    response=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}${route}" 2>&1)

    if [[ "$response" == "$expected_status" ]]; then
        echo -e "${GREEN}✓ ${response}${NC}"
        return 0
    else
        echo -e "${RED}✗ Got ${response}, expected ${expected_status}${NC}"
        return 1
    fi
}

# Track results
passed=0
failed=0
total=0

echo -e "${YELLOW}Public Routes:${NC}"
test_route "/" "200" "Homepage" && ((passed++)) || ((failed++)); ((total++))
test_route "/login" "200" "Login page" && ((passed++)) || ((failed++)); ((total++))
test_route "/register" "200" "Register page" && ((passed++)) || ((failed++)); ((total++))
test_route "/reset-password" "200" "Reset password page" && ((passed++)) || ((failed++)); ((total++))

echo ""
echo -e "${YELLOW}Protected Routes (should show loading or redirect):${NC}"
test_route "/pov" "200" "POV list" && ((passed++)) || ((failed++)); ((total++))
test_route "/pov/new" "200" "Create POV" && ((passed++)) || ((failed++)); ((total++))
test_route "/trr" "200" "TRR list" && ((passed++)) || ((failed++)); ((total++))
test_route "/trr/new" "200" "Create TRR" && ((passed++)) || ((failed++)); ((total++))
test_route "/admin/analytics" "200" "Admin analytics" && ((passed++)) || ((failed++)); ((total++))

echo ""
echo -e "${YELLOW}Redirects:${NC}"
test_route "/dashboard" "307" "Dashboard redirect" && ((passed++)) || ((failed++)); ((total++))

echo ""
echo -e "${YELLOW}API Endpoints:${NC}"
test_route "/api/health" "200" "Health check" && ((passed++)) || ((failed++)); ((total++))
test_route "/api/readyz" "200" "Readiness check" && ((passed++)) || ((failed++)); ((total++))

echo ""
echo -e "${YELLOW}Error Handling:${NC}"
test_route "/non-existent-page-12345" "404" "404 page" && ((passed++)) || ((failed++)); ((total++))

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  Test Summary${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "  Total:  ${BLUE}$total${NC}"
echo -e "  Passed: ${GREEN}$passed${NC}"
echo -e "  Failed: ${RED}$failed${NC}"
echo ""

# Generate JSON results
cat > "$RESULTS_FILE" <<EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "summary": {
    "total": $total,
    "passed": $passed,
    "failed": $failed,
    "pass_rate": $(echo "scale=2; $passed * 100 / $total" | bc)
  },
  "base_url": "$BASE_URL"
}
EOF

echo -e "Results saved to: ${YELLOW}$RESULTS_FILE${NC}"
echo ""

if [ $failed -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}✗ $failed test(s) failed${NC}"
    exit 1
fi
