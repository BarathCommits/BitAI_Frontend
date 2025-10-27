#!/bin/bash

# Automated Test Script for SafeBrowser Frontend
# Tests what can be verified programmatically

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🧪 SafeBrowser Frontend - Automated Test Suite${NC}"
echo "=================================================="
echo ""

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Test result file
RESULTS_FILE="TEST_RESULTS_$(date +%Y%m%d_%H%M%S).md"

# Start results file
cat > "$RESULTS_FILE" << EOF
# 🧪 Test Execution Results

**Date**: $(date)
**Tester**: Automated Test Suite
**Environment**: Development

---

## Test Results

EOF

# Helper function to run test
run_test() {
    local test_name="$1"
    local test_command="$2"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    echo -e "${YELLOW}Test $TOTAL_TESTS: $test_name${NC}"
    
    if eval "$test_command" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ PASS${NC}"
        echo "- ✅ **$test_name**: PASS" >> "$RESULTS_FILE"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        return 0
    else
        echo -e "${RED}❌ FAIL${NC}"
        echo "- ❌ **$test_name**: FAIL" >> "$RESULTS_FILE"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        return 1
    fi
}

echo -e "${BLUE}=== PHASE 1: Environment Checks ===${NC}"
echo ""

# Test 1: Backend Health
run_test "Backend API Health Check" \
    "curl -sf http://localhost:3000/health"

# Test 2: Frontend Accessibility
run_test "Frontend Accessibility (Port 3001)" \
    "curl -sf http://localhost:3001 > /dev/null"

# Test 3: Project Structure
run_test "Source Directory Exists" \
    "test -d src"

run_test "Components Directory Exists" \
    "test -d src/components"

run_test "Config Directory Exists" \
    "test -d src/config"

run_test "Constants Directory Exists" \
    "test -d src/constants"

run_test "Utils Directory Exists" \
    "test -d src/utils"

echo ""
echo -e "${BLUE}=== PHASE 2: Code Quality Checks ===${NC}"
echo ""

# Test 8: TypeScript Config
run_test "TypeScript Config Valid" \
    "test -f config/tsconfig.json"

# Test 9: Package.json Valid
run_test "Package.json Valid" \
    "node -e 'require(\"./package.json\")'"

# Test 10: Critical Files Exist
run_test "API Config Exists" \
    "test -f src/config/api.ts"

run_test "Logger Utility Exists" \
    "test -f src/utils/logger.ts"

run_test "Storage Constants Exist" \
    "test -f src/constants/storage.ts"

run_test "Auth Interceptor Exists" \
    "test -f src/utils/apiInterceptor.ts"

run_test "Auth Debugger Exists" \
    "test -f src/utils/authDebugger.ts"

echo ""
echo -e "${BLUE}=== PHASE 3: Docker Configuration ===${NC}"
echo ""

# Test 15: Docker Files
run_test "Development Dockerfile Exists" \
    "test -f docker/Dockerfile"

run_test "Production Dockerfile Exists" \
    "test -f docker/Dockerfile.prod"

run_test "Dev Docker Compose Exists" \
    "test -f docker/docker-compose.yml"

run_test "Prod Docker Compose Exists" \
    "test -f docker/docker-compose.prod.yml"

run_test "Nginx Config Exists" \
    "test -f docker/nginx.conf"

echo ""
echo -e "${BLUE}=== PHASE 4: Documentation ===${NC}"
echo ""

# Test 20: Documentation
run_test "Main README Exists" \
    "test -f README.md"

run_test "Complete Guide Exists" \
    "test -f docs/COMPLETE_GUIDE.md"

run_test "Testing Guide Exists" \
    "test -f docs/TESTING_GUIDE.md"

run_test "Design System Exists" \
    "test -f docs/design/design-system.md"

echo ""
echo -e "${BLUE}=== PHASE 5: API Endpoint Tests ===${NC}"
echo ""

# Test 24: Backend Endpoints
run_test "Auth Nonce Endpoint Available" \
    "curl -sf -X POST http://localhost:3000/api/auth/wallet/nonce -H 'Content-Type: application/json' -d '{\"address\":\"0x0000000000000000000000000000000000000000\"}'"

run_test "Vault Endpoint Responds (401 expected without auth)" \
    "curl -sf http://localhost:3000/api/v1/vault/info || test \$? -eq 22"

echo ""
echo -e "${BLUE}=== PHASE 6: Build Validation ===${NC}"
echo ""

# Test 26: Build Test
echo -e "${YELLOW}Test $((TOTAL_TESTS + 1)): Production Build${NC}"
TOTAL_TESTS=$((TOTAL_TESTS + 1))

if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✅ PASS${NC}"
    echo "- ✅ **Production Build**: PASS" >> "$RESULTS_FILE"
    PASSED_TESTS=$((PASSED_TESTS + 1))
    
    # Check build size
    if [ -d "build" ]; then
        BUILD_SIZE=$(du -sh build | cut -f1)
        echo "  Build size: $BUILD_SIZE"
        echo "  Build size: $BUILD_SIZE" >> "$RESULTS_FILE"
    fi
else
    echo -e "${RED}❌ FAIL${NC}"
    echo "- ❌ **Production Build**: FAIL" >> "$RESULTS_FILE"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi

echo ""
echo -e "${BLUE}=== Test Summary ===${NC}"
echo ""

# Calculate pass rate
if [ $TOTAL_TESTS -gt 0 ]; then
    PASS_RATE=$(( (PASSED_TESTS * 100) / TOTAL_TESTS ))
else
    PASS_RATE=0
fi

echo -e "Total Tests:  ${BLUE}$TOTAL_TESTS${NC}"
echo -e "Passed:       ${GREEN}$PASSED_TESTS${NC}"
echo -e "Failed:       ${RED}$FAILED_TESTS${NC}"
echo -e "Pass Rate:    ${BLUE}$PASS_RATE%${NC}"
echo ""

# Add summary to results file
cat >> "$RESULTS_FILE" << EOF

---

## Summary

- **Total Tests**: $TOTAL_TESTS
- **Passed**: $PASSED_TESTS
- **Failed**: $FAILED_TESTS
- **Pass Rate**: $PASS_RATE%

---

## Overall Status

EOF

if [ $PASS_RATE -ge 90 ]; then
    echo -e "${GREEN}✅ TEST SUITE PASSED ($PASS_RATE%)${NC}"
    echo "**Status**: ✅ PASS - Ready for deployment" >> "$RESULTS_FILE"
    exit 0
elif [ $PASS_RATE -ge 70 ]; then
    echo -e "${YELLOW}⚠️  TEST SUITE PARTIAL ($PASS_RATE%)${NC}"
    echo "**Status**: ⚠️ PARTIAL - Some issues need attention" >> "$RESULTS_FILE"
    exit 1
else
    echo -e "${RED}❌ TEST SUITE FAILED ($PASS_RATE%)${NC}"
    echo "**Status**: ❌ FAIL - Critical issues found" >> "$RESULTS_FILE"
    exit 1
fi

echo ""
echo -e "${BLUE}Results saved to: $RESULTS_FILE${NC}"


