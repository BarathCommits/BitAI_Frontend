# 🧪 SafeBrowser Frontend - Complete Testing Guide

> **Purpose**: Comprehensive testing documentation  
> **Last Updated**: October 14, 2025  
> **Status**: Ready for Execution

---

## 📋 Table of Contents

1. [Testing Strategy](#testing-strategy)
2. [Quick Test (15 mins)](#quick-test-15-mins)
3. [Full Manual Test (2 hours)](#full-manual-test-2-hours)
4. [Test Results Template](#test-results-template)
5. [Known Issues & Workarounds](#known-issues--workarounds)

---

## 🎯 Testing Strategy

### Test Pyramid

```
         /\
        /  \  E2E Tests (Future: Playwright)
       /────\
      / Int. \ Integration Tests (Manual)
     /────────\
    /   Unit   \ Unit Tests (Future: Jest)
   /────────────\
```

### Current Focus

**Phase 1** (Current): Manual Integration Testing
- ✅ Wallet Authentication
- ✅ Vault CRUD Operations
- ✅ AI Chat Integration
- ✅ Error Handling
- ✅ Docker Deployment

**Phase 2** (Future): Automated Testing
- Unit tests with Jest + React Testing Library
- E2E tests with Playwright
- CI/CD integration

---

## ⚡ Quick Test (15 mins)

### Purpose
Verify critical path works end-to-end

### Prerequisites

```bash
# 1. Backend running
curl http://localhost:3000/health
# Should return: {"status":"OK",...}

# 2. Frontend running
# Visit: http://localhost:3001
# Should see: SafeBrowser auth page

# 3. MetaMask installed and unlocked
```

### Test Steps

#### **Step 1: Clean Start** (2 mins)

```javascript
// Open DevTools (F12) → Console
localStorage.clear()
// Refresh page
location.reload()
```

**✅ Expected**: Clean auth page, no errors in console

---

#### **Step 2: Connect Wallet** (3 mins)

1. Go to http://localhost:3001/auth
2. Click "Connect Wallet" button
3. Approve in MetaMask
4. Sign authentication message

**✅ Expected**:
- MetaMask popup appears
- Signature request shows message
- After signing → redirect to /vault
- Toast: "Successfully connected with your wallet!"

**🔍 Verify**:
```javascript
// In console
debugAuth()
// Should show:
// - hasToken: true
// - walletAddress: 0x...
// - Token valid: YES
```

---

#### **Step 3: Add Vault Item** (3 mins)

1. At `/vault`, click "Add Item"
2. Fill form:
   - Type: **ID Card**
   - Label: **Test Email**
   - Value: **test@example.com**
   - Category: **Personal**
3. Click "Save"

**✅ Expected**:
- Form submits
- API call: `POST /api/v1/vault/info` returns 200/201
- Success toast shown
- New item appears in vault list
- Stats updated

**❌ If 403 Error**:
```javascript
// Run in console:
debugAuth()
// Check if token has walletAddress
// If missing, run:
clearAuthAndReconnect()
// Then reconnect wallet and retry
```

---

#### **Step 4: Test AI Chat** (3 mins)

1. Navigate to `/chat`
2. Type: "Hello, what can you help me with?"
3. Click Send

**✅ Expected**:
- Message appears in chat
- Loading indicator shown
- AI response received (may take 5-10 seconds)
- Response displayed

---

#### **Step 5: Test Vault Deletion** (2 mins)

1. Go back to `/vault`
2. Click delete icon on test item
3. Confirm deletion

**✅ Expected**:
- Confirmation dialog
- Item deleted after confirm
- Success toast
- Stats updated

---

#### **Step 6: Logout** (2 mins)

1. Click logout button (in header if available)
2. Or run in console:
```javascript
localStorage.clear()
location.href = '/auth'
```

**✅ Expected**:
- All auth data cleared
- Redirected to `/auth`
- Cannot access `/vault` without reconnecting

---

### Quick Test Result

**Time Taken**: _______ minutes  
**Result**: [ ] ✅ All Pass [ ] ❌ Issues Found

**Issues**:
- ______________________________
- ______________________________

---

## 🔬 Full Manual Test (2 hours)

### Test Section 1: Wallet Authentication (20 mins)

#### Test 1.1: First-Time Connection

**URL**: http://localhost:3001/auth

**Steps**:
1. Clear localStorage
2. Go to /auth
3. Click "Connect Wallet"
4. Approve in MetaMask
5. Sign message

**Check**:
- [ ] ✅ Pass [ ] ❌ Fail - Auth page loads
- [ ] ✅ Pass [ ] ❌ Fail - Button clickable
- [ ] ✅ Pass [ ] ❌ Fail - MetaMask opens
- [ ] ✅ Pass [ ] ❌ Fail - Signature request correct
- [ ] ✅ Pass [ ] ❌ Fail - Redirect to /vault
- [ ] ✅ Pass [ ] ❌ Fail - Token stored

**Debug**:
```javascript
debugAuth()
// Paste output: ___________________
```

---

#### Test 1.2: Reject Signature

**Steps**:
1. Clear localStorage, refresh
2. Connect wallet
3. Click "Reject" in MetaMask

**Check**:
- [ ] ✅ Pass [ ] ❌ Fail - Error message shown
- [ ] ✅ Pass [ ] ❌ Fail - Stay on /auth page
- [ ] ✅ Pass [ ] ❌ Fail - No token stored
- [ ] ✅ Pass [ ] ❌ Fail - Can retry

---

#### Test 1.3: Token Persistence

**Steps**:
1. Login successfully
2. Refresh page (F5)
3. Check if still logged in

**Check**:
- [ ] ✅ Pass [ ] ❌ Fail - Still authenticated
- [ ] ✅ Pass [ ] ❌ Fail - No redirect to /auth
- [ ] ✅ Pass [ ] ❌ Fail - Wallet still connected

---

#### Test 1.4: Token Expiration

**Steps**:
1. Login successfully
2. Run in console:
```javascript
localStorage.removeItem('jwtToken')
```
3. Navigate to /vault

**Check**:
- [ ] ✅ Pass [ ] ❌ Fail - Toast: "Session expired"
- [ ] ✅ Pass [ ] ❌ Fail - Redirect to /auth
- [ ] ✅ Pass [ ] ❌ Fail - No console errors

---

#### Test 1.5: Invalid Token Detection

**Steps**:
1. Create old-style token:
```javascript
localStorage.setItem('jwtToken', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InRlc3QiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJleHAiOjk5OTk5OTk5OTl9.test')
```
2. Refresh page

**Check**:
- [ ] ✅ Pass [ ] ❌ Fail - Auto-detects invalid token
- [ ] ✅ Pass [ ] ❌ Fail - Clears old token
- [ ] ✅ Pass [ ] ❌ Fail - Redirects to /auth

---

### Test Section 2: Personal Vault (30 mins)

#### Test 2.1: View Empty Vault

**Steps**:
1. Login with new wallet
2. Go to /vault

**Check**:
- [ ] ✅ Pass [ ] ❌ Fail - Empty state shown
- [ ] ✅ Pass [ ] ❌ Fail - "Add Item" button visible
- [ ] ✅ Pass [ ] ❌ Fail - Stats: 0 items

---

#### Test 2.2: Add Vault Item - Success

**Test Data**:
```json
{
  "type": "id_card",
  "label": "Test Email Account",
  "value": "test@example.com",
  "category": "personal"
}
```

**Steps**:
1. Click "Add Item"
2. Fill form with test data
3. Click "Save"
4. Watch Network tab

**Check**:
- [ ] ✅ Pass [ ] ❌ Fail - Form opens
- [ ] ✅ Pass [ ] ❌ Fail - Can fill all fields
- [ ] ✅ Pass [ ] ❌ Fail - Save button enabled
- [ ] ✅ Pass [ ] ❌ Fail - API call: POST /api/v1/vault/info
- [ ] ✅ Pass [ ] ❌ Fail - Response: 200/201
- [ ] ✅ Pass [ ] ❌ Fail - Success toast shown
- [ ] ✅ Pass [ ] ❌ Fail - Item in list
- [ ] ✅ Pass [ ] ❌ Fail - Stats updated (1 item)

**API Response**:
```json
Status: _______
Body: _______________________
```

**If Failed**: _______________________

---

#### Test 2.3: Add Multiple Items

**Steps**:
Add these items one by one:
1. Credit Card (type: credit_card, category: financial)
2. Passport (type: passport, category: identity)  
3. Bank Account (type: bank_account, category: financial)
4. ID Card (type: id_card, category: identity)

**Check**:
- [ ] ✅ Pass [ ] ❌ Fail - All 4 items added
- [ ] ✅ Pass [ ] ❌ Fail - Categories counted correctly
- [ ] ✅ Pass [ ] ❌ Fail - Stats show: personal: 1, financial: 2, identity: 2
- [ ] ✅ Pass [ ] ❌ Fail - All items visible

**Total Items**: _______ (Expected: 5)

---

#### Test 2.4: View/Hide Values

**Steps**:
1. Click eye icon on any item
2. Verify value visibility
3. Click again

**Check**:
- [ ] ✅ Pass [ ] ❌ Fail - Initially masked (*****) 
- [ ] ✅ Pass [ ] ❌ Fail - Click → value visible
- [ ] ✅ Pass [ ] ❌ Fail - Click → value masked
- [ ] ✅ Pass [ ] ❌ Fail - Icon toggles (Eye/EyeOff)

---

#### Test 2.5: Edit Vault Item

**Steps**:
1. Click edit on first item
2. Change label to "Updated Test Email"
3. Change value to "updated@example.com"
4. Save

**Check**:
- [ ] ✅ Pass [ ] ❌ Fail - Edit form opens with data
- [ ] ✅ Pass [ ] ❌ Fail - Can modify fields
- [ ] ✅ Pass [ ] ❌ Fail - API: PUT /api/v1/vault/info/:id
- [ ] ✅ Pass [ ] ❌ Fail - Success toast
- [ ] ✅ Pass [ ] ❌ Fail - Changes reflected
- [ ] ✅ Pass [ ] ❌ Fail - Persist after refresh

---

#### Test 2.6: Delete Vault Item

**Steps**:
1. Click delete on any item
2. Confirm deletion

**Check**:
- [ ] ✅ Pass [ ] ❌ Fail - Confirmation dialog
- [ ] ✅ Pass [ ] ❌ Fail - Shows item label
- [ ] ✅ Pass [ ] ❌ Fail - API: DELETE /api/v1/vault/info/:id
- [ ] ✅ Pass [ ] ❌ Fail - Success toast
- [ ] ✅ Pass [ ] ❌ Fail - Item removed
- [ ] ✅ Pass [ ] ❌ Fail - Stats updated

---

#### Test 2.7: Search Vault (if available)

**Steps**:
1. With multiple items
2. Use search box
3. Type "email"

**Check**:
- [ ] ✅ Pass [ ] ❌ Fail [ ] N/A - Search filters results
- [ ] ✅ Pass [ ] ❌ Fail [ ] N/A - Shows matching items only
- [ ] ✅ Pass [ ] ❌ Fail [ ] N/A - Clear search works

---

#### Test 2.8: Category Filter

**Steps**:
1. Click category filter dropdown
2. Select "Financial"
3. Verify filtered results

**Check**:
- [ ] ✅ Pass [ ] ❌ Fail [ ] N/A - Shows financial items only
- [ ] ✅ Pass [ ] ❌ Fail [ ] N/A - Count correct
- [ ] ✅ Pass [ ] ❌ Fail [ ] N/A - Can clear filter

---

#### Test 2.9: Generate QR Code

**Steps**:
1. Click "Generate Master QR" (if available)
2. Verify QR generation

**Check**:
- [ ] ✅ Pass [ ] ❌ Fail [ ] N/A - QR code generated
- [ ] ✅ Pass [ ] ❌ Fail [ ] N/A - QR code visible
- [ ] ✅ Pass [ ] ❌ Fail [ ] N/A - Can download
- [ ] ✅ Pass [ ] ❌ Fail [ ] N/A - Modal closeable

---

#### Test 2.10: Backup Vault

**Steps**:
1. Click "Backup Vault" (if available)
2. Verify backup creation

**Check**:
- [ ] ✅ Pass [ ] ❌ Fail [ ] N/A - Backup file downloaded
- [ ] ✅ Pass [ ] ❌ Fail [ ] N/A - JSON format
- [ ] ✅ Pass [ ] ❌ Fail [ ] N/A - Contains encrypted data
- [ ] ✅ Pass [ ] ❌ Fail [ ] N/A - Success message

---

### Test Section 3: AI Chat (20 mins)

#### Test 3.1: Basic Message

**Steps**:
1. Go to http://localhost:3001/chat
2. Type: "Hello, what can you help me with?"
3. Click Send

**Check**:
- [ ] ✅ Pass [ ] ❌ Fail - Message sent
- [ ] ✅ Pass [ ] ❌ Fail - Loading indicator
- [ ] ✅ Pass [ ] ❌ Fail - AI response received
- [ ] ✅ Pass [ ] ❌ Fail - Response displayed
- [ ] ✅ Pass [ ] ❌ Fail - No errors

**Response Time**: _______ seconds  
**AI Response**: "_______________________"

---

#### Test 3.2: Wallet Context

**Steps**:
1. In chat, ask: "What's my wallet address?"

**Check**:
- [ ] ✅ Pass [ ] ❌ Fail - AI has wallet context
- [ ] ✅ Pass [ ] ❌ Fail - Response mentions address
- [ ] ✅ Pass [ ] ❌ Fail - Context-aware

**AI Response**: "_______________________"

---

#### Test 3.3: Message History

**Steps**:
1. Send 5 messages
2. Navigate away
3. Return to /chat

**Check**:
- [ ] ✅ Pass [ ] ❌ Fail - History preserved
- [ ] ✅ Pass [ ] ❌ Fail - All 5 messages visible
- [ ] ✅ Pass [ ] ❌ Fail - Can continue conversation

---

#### Test 3.4: Empty Message Validation

**Steps**:
1. Try to send empty message

**Check**:
- [ ] ✅ Pass [ ] ❌ Fail - Send button disabled
- [ ] ✅ Pass [ ] ❌ Fail - Or validation message
- [ ] ✅ Pass [ ] ❌ Fail - No API call

---

### Test Section 4: Error Handling (15 mins)

#### Test 4.1: Network Error

**Steps**:
1. Disconnect WiFi
2. Try to add vault item

**Check**:
- [ ] ✅ Pass [ ] ❌ Fail - Network error shown
- [ ] ✅ Pass [ ] ❌ Fail - User-friendly message
- [ ] ✅ Pass [ ] ❌ Fail - App doesn't crash
- [ ] ✅ Pass [ ] ❌ Fail - Can retry

---

#### Test 4.2: 401 Error Handling

**Steps**:
1. Login successfully
2. In console: `localStorage.removeItem('jwtToken')`
3. Try vault operation

**Check**:
- [ ] ✅ Pass [ ] ❌ Fail - 401 caught by interceptor
- [ ] ✅ Pass [ ] ❌ Fail - Toast: "Session expired"
- [ ] ✅ Pass [ ] ❌ Fail - Redirect to /auth
- [ ] ✅ Pass [ ] ❌ Fail - Tokens cleared

---

#### Test 4.3: Component Error Boundary

**Steps**:
1. Navigate through all pages
2. Check for any crashes

**Check**:
- [ ] ✅ Pass [ ] ❌ Fail - No page crashes
- [ ] ✅ Pass [ ] ❌ Fail - Error boundaries active
- [ ] ✅ Pass [ ] ❌ Fail - Errors handled gracefully

---

### Test Section 5: UI/UX (15 mins)

#### Test 5.1: Desktop (1920x1080)

**Steps**: Navigate all pages at full screen

**Check**:
- [ ] ✅ Pass [ ] ❌ Fail - /auth renders correctly
- [ ] ✅ Pass [ ] ❌ Fail - /vault renders correctly
- [ ] ✅ Pass [ ] ❌ Fail - /chat renders correctly
- [ ] ✅ Pass [ ] ❌ Fail - /safe-store renders correctly
- [ ] ✅ Pass [ ] ❌ Fail - /settings renders correctly
- [ ] ✅ Pass [ ] ❌ Fail - Header/sidebar visible
- [ ] ✅ Pass [ ] ❌ Fail - No layout issues

---

#### Test 5.2: Mobile (iPhone SE - 375px)

**Steps**: DevTools → Device toolbar → iPhone SE

**Check**:
- [ ] ✅ Pass [ ] ❌ Fail - Responsive layout active
- [ ] ✅ Pass [ ] ❌ Fail - No horizontal scroll
- [ ] ✅ Pass [ ] ❌ Fail - Buttons accessible
- [ ] ✅ Pass [ ] ❌ Fail - Forms usable
- [ ] ✅ Pass [ ] ❌ Fail - Wallet connect works

---

#### Test 5.3: Tablet (iPad - 768px)

**Steps**: Set device to iPad

**Check**:
- [ ] ✅ Pass [ ] ❌ Fail - Layout adapts
- [ ] ✅ Pass [ ] ❌ Fail - Touch targets OK
- [ ] ✅ Pass [ ] ❌ Fail - Readable

---

### Test Section 6: Performance (20 mins)

#### Test 6.1: Page Load Speed

**Steps**:
1. Clear cache
2. Open Network tab
3. Load homepage
4. Measure timing

**Results**:
- FCP: _______ ms (Target: < 2000ms)
- TTI: _______ ms (Target: < 3000ms)
- Total Load: _______ ms

**Check**:
- [ ] ✅ Pass [ ] ❌ Fail - Meets performance targets

---

#### Test 6.2: Bundle Size

**Steps**:
```bash
npm run build
ls -lh build/static/js/
```

**Results**:
- Main chunk: _______ KB (Target: < 500KB)
- Total size: _______ MB (Target: < 2MB)

**Check**:
- [ ] ✅ Pass [ ] ❌ Fail - Bundle size optimized

---

#### Test 6.3: Lighthouse Audit

**Steps**:
1. Open Chrome DevTools → Lighthouse
2. Run audit (Desktop mode)

**Scores**:
- Performance: _______ (Target: > 80)
- Accessibility: _______ (Target: > 90)
- Best Practices: _______ (Target: > 90)
- SEO: _______ (Target: > 80)

**Check**:
- [ ] ✅ Pass [ ] ❌ Fail - Meets quality thresholds

---

### Test Section 7: Security (15 mins)

#### Test 7.1: Production Console Safety

**Steps**:
1. Build production:
```bash
NODE_ENV=production npm run build
npx serve -s build
```
2. Test all features
3. Check console

**Check**:
- [ ] ✅ Pass [ ] ❌ Fail - No debug logs
- [ ] ✅ Pass [ ] ❌ Fail - No tokens logged
- [ ] ✅ Pass [ ] ❌ Fail - Only errors/warnings

---

#### Test 7.2: XSS Prevention

**Steps**:
1. Add vault item with value:
```html
<script>alert('XSS')</script>
```
2. Save and view

**Check**:
- [ ] ✅ Pass [ ] ❌ Fail - Script not executed
- [ ] ✅ Pass [ ] ❌ Fail - Value properly escaped
- [ ] ✅ Pass [ ] ❌ Fail - No alert popup

---

#### Test 7.3: Token in Network Requests

**Steps**:
1. Open Network tab
2. Perform actions
3. Check request headers

**Check**:
- [ ] ✅ Pass [ ] ❌ Fail - Token in Authorization header only
- [ ] ✅ Pass [ ] ❌ Fail - Token never in URL
- [ ] ✅ Pass [ ] ❌ Fail - Token never in request body

---

### Test Section 8: Docker (20 mins)

#### Test 8.1: Development Build

**Steps**:
```bash
docker-compose -f docker/docker-compose.yml build frontend
docker-compose -f docker/docker-compose.yml up frontend
```

**Check**:
- [ ] ✅ Pass [ ] ❌ Fail - Build succeeds
- [ ] ✅ Pass [ ] ❌ Fail - Container starts
- [ ] ✅ Pass [ ] ❌ Fail - Accessible at :3001
- [ ] ✅ Pass [ ] ❌ Fail - Hot reload works

**Build Time**: _______ seconds

---

#### Test 8.2: Production Build

**Steps**:
```bash
docker-compose -f docker/docker-compose.prod.yml build frontend-prod
docker-compose -f docker/docker-compose.prod.yml up -d frontend-prod
curl http://localhost/health
```

**Check**:
- [ ] ✅ Pass [ ] ❌ Fail - Build succeeds
- [ ] ✅ Pass [ ] ❌ Fail - Image size < 100MB
- [ ] ✅ Pass [ ] ❌ Fail - Container starts
- [ ] ✅ Pass [ ] ❌ Fail - Health check works
- [ ] ✅ Pass [ ] ❌ Fail - App accessible

**Image Size**: _______ MB  
**Build Time**: _______ seconds

---

## 📊 Test Results Summary

**Tester**: _______________________  
**Date**: _______________________  
**Duration**: _______ hours _______ mins

| Section | Tests | Passed | Failed | Pass Rate |
|---------|-------|--------|--------|-----------|
| Wallet Auth | 5 | __ | __ | __% |
| Vault Ops | 10 | __ | __ | __% |
| AI Chat | 4 | __ | __ | __% |
| Error Handling | 3 | __ | __ | __% |
| UI/UX | 3 | __ | __ | __% |
| Performance | 3 | __ | __ | __% |
| Security | 3 | __ | __ | __% |
| Docker | 2 | __ | __ | __% |
| **TOTAL** | **33** | **__** | **__** | **__%** |

---

## 🐛 Known Issues & Workarounds

### Issue #1: 403 Error on Vault Operations

**Symptom**: `403 Forbidden` when adding vault items

**Root Cause**: Old email/password token without `walletAddress` field

**Workaround**:
```javascript
// In browser console
debugAuth()
// If token invalid:
clearAuthAndReconnect()
// Then reconnect wallet
```

**Status**: ✅ Auto-fix implemented in v1.0

---

### Issue #2: Production Build Docker Error

**Symptom**: `.env.production` not found during build

**Root Cause**: File path issue in Dockerfile

**Workaround**: Use environment variables in docker-compose

**Status**: ✅ Fixed in Dockerfile.prod

---

## ✅ Test Sign-Off

**All Critical Tests Passed**: [ ] Yes [ ] No  
**Blocker Issues**: [ ] None [ ] Present  
**Ready for Production**: [ ] Yes [ ] No [ ] With Caveats

**QA Engineer**: _______________________  
**Date**: _______________________  
**Signature**: _______________________

---

## 📝 Additional Notes

**Observations**: _______________________

**Recommendations**: _______________________

**Next Steps**: _______________________

---

**🎯 Use this guide to test your frontend systematically!**


