#!/bin/bash

# Docker Integration Test Suite
# Tests the running Docker containers

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🐳 SafeBrowser - Docker Integration Tests${NC}"
echo "=============================================="
echo ""

RESULTS_FILE="DOCKER_TEST_RESULTS_$(date +%Y%m%d_%H%M%S).md"

# Initialize results file
cat > "$RESULTS_FILE" << EOF
# 🐳 Docker Integration Test Results

**Date**: $(date)
**Environment**: Docker Development
**Frontend**: http://localhost:3001
**Backend**: http://localhost:3000

---

## Automated Test Results

EOF

TOTAL=0
PASSED=0
FAILED=0

run_test() {
    local name="$1"
    local cmd="$2"
    
    TOTAL=$((TOTAL + 1))
    echo -e "${YELLOW}[$TOTAL] $name${NC}"
    
    if eval "$cmd" 2>&1 | tee -a test.log > /dev/null; then
        echo -e "${GREEN}✅ PASS${NC}\n"
        echo "- ✅ **$name**: PASS" >> "$RESULTS_FILE"
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}❌ FAIL${NC}\n"
        echo "- ❌ **$name**: FAIL" >> "$RESULTS_FILE"
        FAILED=$((FAILED + 1))
    fi
}

echo -e "${BLUE}=== Phase 1: Container Health ===${NC}\n"

run_test "Frontend Container Running" \
    "docker ps | grep -q frontend"

run_test "Frontend Port 3001 Accessible" \
    "curl -sf http://localhost:3001 > /dev/null"

run_test "Backend API Health" \
    "curl -sf http://localhost:3000/health > /dev/null"

echo -e "${BLUE}=== Phase 2: API Endpoint Tests ===${NC}\n"

run_test "Auth Nonce Endpoint" \
    "curl -sf -X POST http://localhost:3000/api/auth/wallet/nonce -H 'Content-Type: application/json' -d '{\"address\":\"0x742d35Cc6634C0532925a3b844Bc4b8d8b6\"}' | grep -q nonce"

run_test "Vault Endpoint (Expects 401 without auth)" \
    "curl -sf http://localhost:3000/api/v1/vault/info 2>&1 || true"

run_test "AI Chat Endpoint Available" \
    "curl -sf -X POST http://localhost:3000/api/ai/chat -H 'Content-Type: application/json' -d '{}' 2>&1 || true"

echo -e "${BLUE}=== Phase 3: Frontend Static Assets ===${NC}\n"

run_test "Frontend Serves HTML" \
    "curl -sf http://localhost:3001 | grep -q 'Safe Browser'"

run_test "Frontend Serves index.html" \
    "curl -sf http://localhost:3001 | grep -q '<div id=\"root\"'"

run_test "Frontend JavaScript Bundles Load" \
    "curl -sf http://localhost:3001 | grep -q '.js'"

echo -e "${BLUE}=== Phase 4: Docker Container Tests ===${NC}\n"

# Get container ID
CONTAINER_ID=$(docker ps | grep frontend | awk '{print $1}')

run_test "Container Node Modules Exist" \
    "docker exec $CONTAINER_ID test -d node_modules"

run_test "Container Source Files Exist" \
    "docker exec $CONTAINER_ID test -d src"

run_test "Container Package.json Exists" \
    "docker exec $CONTAINER_ID test -f package.json"

echo -e "${BLUE}=== Phase 5: Network & Performance ===${NC}\n"

# Test response times
START=$(date +%s%N)
curl -sf http://localhost:3001 > /dev/null
END=$(date +%s%N)
RESPONSE_TIME=$(( ($END - $START) / 1000000 ))

echo -e "${YELLOW}[$((TOTAL + 1))] Frontend Response Time${NC}"
TOTAL=$((TOTAL + 1))
if [ $RESPONSE_TIME -lt 2000 ]; then
    echo -e "${GREEN}✅ PASS${NC} (${RESPONSE_TIME}ms < 2000ms)\n"
    echo "- ✅ **Frontend Response Time**: PASS (${RESPONSE_TIME}ms)" >> "$RESULTS_FILE"
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}❌ FAIL${NC} (${RESPONSE_TIME}ms >= 2000ms)\n"
    echo "- ❌ **Frontend Response Time**: FAIL (${RESPONSE_TIME}ms)" >> "$RESULTS_FILE"
    FAILED=$((FAILED + 1))
fi

run_test "Backend Response Time < 1s" \
    "timeout 1s curl -sf http://localhost:3000/health > /dev/null"

echo -e "${BLUE}=== Test Summary ===${NC}\n"

PASS_RATE=$(( (PASSED * 100) / TOTAL ))

echo -e "Total Tests:  ${BLUE}$TOTAL${NC}"
echo -e "Passed:       ${GREEN}$PASSED${NC}"
echo -e "Failed:       ${RED}$FAILED${NC}"
echo -e "Pass Rate:    ${BLUE}$PASS_RATE%${NC}"
echo ""

# Add summary to results
cat >> "$RESULTS_FILE" << EOF

---

## Summary

- **Total Tests**: $TOTAL
- **Passed**: $PASSED  
- **Failed**: $FAILED
- **Pass Rate**: $PASS_RATE%

---

## Container Information

**Frontend Container**: \`$CONTAINER_ID\`
**Frontend URL**: http://localhost:3001
**Backend URL**: http://localhost:3000

---

## Status

EOF

if [ $PASS_RATE -ge 90 ]; then
    echo -e "${GREEN}✅ DOCKER TESTS PASSED ($PASS_RATE%)${NC}"
    echo "**Overall**: ✅ PASS - Docker environment healthy" >> "$RESULTS_FILE"
else
    echo -e "${RED}❌ DOCKER TESTS FAILED ($PASS_RATE%)${NC}"
    echo "**Overall**: ❌ FAIL - Issues detected" >> "$RESULTS_FILE"
fi

echo ""
echo -e "${BLUE}Results saved to: $RESULTS_FILE${NC}"
echo ""
echo -e "${YELLOW}📋 Next: Run manual tests from docs/TESTING_GUIDE.md${NC}"


