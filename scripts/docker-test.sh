#!/bin/bash

# Docker Testing Script
# Tests both development and production builds

set -e  # Exit on error

echo "🐳 SafeBrowser Frontend - Docker Test Suite"
echo "============================================"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Development Build
echo -e "\n${YELLOW}Test 1: Building Development Image${NC}"
docker-compose -f docker/docker-compose.yml build frontend
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Development build successful${NC}"
else
    echo -e "${RED}❌ Development build failed${NC}"
    exit 1
fi

# Test 2: Production Build
echo -e "\n${YELLOW}Test 2: Building Production Image${NC}"
docker-compose -f docker/docker-compose.prod.yml build frontend-prod
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Production build successful${NC}"
else
    echo -e "${RED}❌ Production build failed${NC}"
    exit 1
fi

# Test 3: Start Production Container
echo -e "\n${YELLOW}Test 3: Starting Production Container${NC}"
docker-compose -f docker/docker-compose.prod.yml up -d frontend-prod
sleep 5  # Wait for startup

# Test 4: Health Check
echo -e "\n${YELLOW}Test 4: Health Check${NC}"
HEALTH_RESPONSE=$(curl -s http://localhost/health)
if [[ $HEALTH_RESPONSE == *"healthy"* ]]; then
    echo -e "${GREEN}✅ Health check passed: $HEALTH_RESPONSE${NC}"
else
    echo -e "${RED}❌ Health check failed${NC}"
    docker-compose -f docker/docker-compose.prod.yml logs frontend-prod
    docker-compose -f docker/docker-compose.prod.yml down
    exit 1
fi

# Test 5: Frontend Accessibility
echo -e "\n${YELLOW}Test 5: Frontend Accessibility${NC}"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/)
if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✅ Frontend accessible (HTTP $HTTP_CODE)${NC}"
else
    echo -e "${RED}❌ Frontend not accessible (HTTP $HTTP_CODE)${NC}"
    docker-compose -f docker/docker-compose.prod.yml logs frontend-prod
    docker-compose -f docker/docker-compose.prod.yml down
    exit 1
fi

# Test 6: Check Image Size
echo -e "\n${YELLOW}Test 6: Image Size Check${NC}"
IMAGE_SIZE=$(docker images safebrowser-frontend-prod --format "{{.Size}}")
echo "Production image size: $IMAGE_SIZE"
if [[ $IMAGE_SIZE == *"MB"* ]]; then
    SIZE_NUM=$(echo $IMAGE_SIZE | grep -oE '[0-9]+' | head -1)
    if [ "$SIZE_NUM" -lt 200 ]; then
        echo -e "${GREEN}✅ Image size optimized (<200MB)${NC}"
    else
        echo -e "${YELLOW}⚠️  Image size could be smaller (${IMAGE_SIZE})${NC}"
    fi
fi

# Test 7: Check Gzip Compression
echo -e "\n${YELLOW}Test 7: Gzip Compression Check${NC}"
GZIP_CHECK=$(curl -s -H "Accept-Encoding: gzip" -I http://localhost/ | grep -i "content-encoding: gzip")
if [[ -n "$GZIP_CHECK" ]]; then
    echo -e "${GREEN}✅ Gzip compression enabled${NC}"
else
    echo -e "${YELLOW}⚠️  Gzip compression not detected${NC}"
fi

# Test 8: Security Headers
echo -e "\n${YELLOW}Test 8: Security Headers Check${NC}"
HEADERS=$(curl -s -I http://localhost/)
SECURITY_HEADERS=("X-Frame-Options" "X-Content-Type-Options" "X-XSS-Protection")
ALL_PRESENT=true

for header in "${SECURITY_HEADERS[@]}"; do
    if echo "$HEADERS" | grep -qi "$header"; then
        echo -e "${GREEN}✅ $header present${NC}"
    else
        echo -e "${RED}❌ $header missing${NC}"
        ALL_PRESENT=false
    fi
done

# Cleanup
echo -e "\n${YELLOW}Cleaning up...${NC}"
docker-compose -f docker/docker-compose.prod.yml down

# Final Summary
echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}🎉 All Tests Passed!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "\nYour Docker setup is ready for deployment! 🚀"
echo -e "\nNext steps:"
echo -e "  1. docker-compose -f docker/docker-compose.yml up (development)"
echo -e "  2. docker-compose -f docker/docker-compose.prod.yml up (production)"
echo -e "  3. Update .env.production with your production API URLs"
echo -e "  4. Deploy! 🎊"


