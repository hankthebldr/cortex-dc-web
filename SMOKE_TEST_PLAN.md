# End-to-End Smoke Testing Plan

**Date:** October 13, 2025
**Version:** 1.0
**Target:** Cortex DC Web Application - Phase 3 Frontend

---

## Executive Summary

This document outlines the smoke testing procedures for the newly implemented frontend UI components, including authentication, navigation, dashboards, and data management pages.

---

## Test Environment

### Prerequisites
- Node.js 20+
- pnpm 8+
- Firebase emulator (optional) or Firebase project configured
- Test user accounts created

### Setup Commands
```bash
# Install dependencies
pnpm install

# Start development server
pnpm --filter "@cortex-dc/web" dev

# Access application
http://localhost:3000
```

---

## Test User Accounts

### Mock Users for Testing

#### User 1: Admin User
- **Email:** admin@test.com
- **Password:** Test123!
- **Role:** admin
- **Access:** All features

#### User 2: Manager User
- **Email:** manager@test.com
- **Password:** Test123!
- **Role:** manager
- **Access:** Team dashboard, POV/TRR management

#### User 3: Regular User
- **Email:** user@test.com
- **Password:** Test123!
- **Role:** user
- **Access:** Personal dashboard, own POV/TRRs

**Note:** These users should be created in Firebase Auth with appropriate custom claims for roles.

---

## Smoke Test Scenarios

### Test Suite 1: Authentication Flow

#### Test 1.1: User Registration
**Objective:** Verify new user can register

**Steps:**
1. Navigate to http://localhost:3000/register
2. Enter email: newuser@test.com
3. Enter password: Test123!
4. Enter display name: Test User
5. Click "Sign Up"

**Expected Result:**
- User is created in Firebase Auth
- User is redirected to /dashboard
- Welcome message appears with user name

**Pass/Fail:** _____

---

#### Test 1.2: User Login - Email/Password
**Objective:** Verify user can log in with email and password

**Steps:**
1. Navigate to http://localhost:3000/login
2. Enter email: user@test.com
3. Enter password: Test123!
4. Click "Sign In"

**Expected Result:**
- User is authenticated
- Redirected to /dashboard
- Navigation bar shows user profile

**Pass/Fail:** _____

---

#### Test 1.3: Google OAuth Login
**Objective:** Verify Google sign-in works

**Steps:**
1. Navigate to http://localhost:3000/login
2. Click "Sign in with Google"
3. Select Google account or enter credentials
4. Authorize application

**Expected Result:**
- User is authenticated via Google
- Redirected to /dashboard
- User profile populated from Google account

**Pass/Fail:** _____

---

#### Test 1.4: Password Reset
**Objective:** Verify password reset flow

**Steps:**
1. Navigate to http://localhost:3000/login
2. Click "Forgot password?"
3. Enter email: user@test.com
4. Click "Send Reset Link"

**Expected Result:**
- Success message appears
- Password reset email sent to user@test.com
- User can click link in email to reset password

**Pass/Fail:** _____

---

#### Test 1.5: Sign Out
**Objective:** Verify user can sign out

**Steps:**
1. Log in as any user
2. Click user profile menu in navigation
3. Click "Sign Out"

**Expected Result:**
- User is signed out
- Redirected to /login
- Session cleared
- Cannot access protected routes

**Pass/Fail:** _____

---

### Test Suite 2: Navigation

#### Test 2.1: Desktop Navigation
**Objective:** Verify navigation bar on desktop

**Steps:**
1. Log in as user@test.com
2. Verify navigation bar displays
3. Click each navigation link:
   - Dashboard
   - Projects (POV)
   - TRRs
4. Verify active route highlighting

**Expected Result:**
- All links functional
- Active route highlighted in orange
- Smooth transitions between pages
- User menu accessible

**Pass/Fail:** _____

---

#### Test 2.2: Mobile Navigation
**Objective:** Verify responsive mobile menu

**Steps:**
1. Resize browser to mobile width (< 768px)
2. Click hamburger menu icon
3. Verify menu opens with all links
4. Click a link to navigate
5. Verify menu closes

**Expected Result:**
- Hamburger icon visible on mobile
- Menu slides in from side
- All links present and functional
- Menu closes on navigation

**Pass/Fail:** _____

---

#### Test 2.3: Role-Based Navigation
**Objective:** Verify navigation links change by role

**Steps:**
1. Log in as user@test.com (regular user)
2. Note visible links (Dashboard, Projects, TRRs)
3. Sign out
4. Log in as admin@test.com (admin)
5. Verify "Admin" link appears in navigation

**Expected Result:**
- Regular users see basic links
- Admin users see Admin link
- Links filtered by user role

**Pass/Fail:** _____

---

### Test Suite 3: Dashboard Views

#### Test 3.1: Personal Dashboard
**Objective:** Verify personal dashboard loads and displays data

**Steps:**
1. Log in as user@test.com
2. Navigate to /dashboard
3. Verify all sections display:
   - Metric cards (Active POVs, Pending TRRs, Completed, Success Rate)
   - Recent Projects list
   - Pending TRRs list

**Expected Result:**
- Dashboard loads without errors
- Metrics show correct counts
- Loading states appear briefly
- Data displays or empty state shows
- "Create First Project" button if no POVs

**Pass/Fail:** _____

---

#### Test 3.2: Team Dashboard
**Objective:** Verify team dashboard for managers

**Steps:**
1. Log in as manager@test.com
2. Navigate to /dashboard
3. Verify team dashboard displays:
   - Team member count
   - Active projects across team
   - Pending reviews
   - Projects needing attention
   - Team activity feed

**Expected Result:**
- Team-wide metrics display
- Can see all team POVs
- Projects requiring attention highlighted
- Recent activity from team members

**Pass/Fail:** _____

---

#### Test 3.3: Admin Dashboard
**Objective:** Verify admin dashboard with platform metrics

**Steps:**
1. Log in as admin@test.com
2. Navigate to /dashboard
3. Verify admin dashboard displays:
   - Total users
   - Total projects
   - Active engagements
   - System health
   - User distribution by role
   - Recent platform activity

**Expected Result:**
- Platform-wide statistics display
- System health indicators
- User counts by role
- Quick action buttons functional

**Pass/Fail:** _____

---

### Test Suite 4: POV Management

#### Test 4.1: POV List Page
**Objective:** Verify POV list displays and filters work

**Steps:**
1. Log in as user@test.com
2. Navigate to /pov
3. Verify POV list displays
4. Test search: Enter "Financial" in search box
5. Test filter: Select "Active" from status dropdown
6. Clear filters

**Expected Result:**
- POVs display in card format
- Search filters results instantly
- Status filter works
- Stats cards show correct counts
- Loading spinner appears during fetch
- Empty state if no POVs

**Pass/Fail:** _____

---

#### Test 4.2: POV Detail Page
**Objective:** Verify POV detail view loads

**Steps:**
1. Navigate to /pov
2. Click on a POV card
3. Verify detail page loads with:
   - POV name and status
   - Quick stats (Progress, Dates, Team Lead)
   - Tabs: Overview, Timeline, Team, Deliverables
4. Click each tab
5. Click "Edit" button
6. Click "Back" button

**Expected Result:**
- Detail page loads with complete information
- All tabs functional and show content
- Edit mode toggles
- Navigation back to list works
- Progress indicator displays
- Dates formatted correctly

**Pass/Fail:** _____

---

#### Test 4.3: Create New POV
**Objective:** Verify POV creation wizard

**Steps:**
1. Navigate to /pov
2. Click "New POV" button
3. Step 1: Enter Basic Info
   - Name: "Test POV Project"
   - Customer: "Test Company"
   - Industry: "Technology"
   - Description: "Test description"
4. Click "Next"
5. Step 2: Enter Timeline
   - Start Date: Today
   - End Date: 30 days from now
6. Click "Next"
7. Step 3: Enter Team
   - Team Lead: "John Doe"
8. Click "Next"
9. Step 4: Enter Objectives
   - Objective 1: "Validate security capabilities"
   - Add another objective
10. Click "Create POV"

**Expected Result:**
- Wizard progresses through 4 steps
- Progress indicator updates
- Form validation works (required fields)
- Can't proceed without required fields
- POV created successfully
- Redirected to /pov list
- New POV appears in list

**Pass/Fail:** _____

---

### Test Suite 5: TRR Management

#### Test 5.1: TRR List Page
**Objective:** Verify TRR list displays and filters work

**Steps:**
1. Navigate to /trr
2. Verify TRR list displays
3. Test search: Enter "Security" in search box
4. Test filter: Select "Pending" from status dropdown
5. Verify overdue badges appear on late TRRs
6. Clear filters

**Expected Result:**
- TRRs display in card format
- Search filters results
- Status filter works
- Priority badges visible
- Overdue warnings on past-due TRRs
- Stats cards accurate
- Completion percentages show

**Pass/Fail:** _____

---

#### Test 5.2: TRR Detail Page
**Objective:** Verify TRR detail view loads

**Steps:**
1. Navigate to /trr
2. Click on a TRR card
3. Verify detail page loads with:
   - TRR title and status
   - Quick stats (Completion, Dates, Assigned)
   - Tabs: Details, Findings, Recommendations, Approvals
4. Click each tab
5. Verify findings display with severity badges
6. Verify recommendations show priority

**Expected Result:**
- Detail page loads completely
- All tabs show appropriate content
- Findings color-coded by severity
- Recommendations numbered
- Approvals show status badges
- Export and Share buttons present
- Edit functionality available

**Pass/Fail:** _____

---

#### Test 5.3: Create New TRR
**Objective:** Verify TRR creation form

**Steps:**
1. Navigate to /trr
2. Click "New TRR" button
3. Enter Basic Information:
   - Title: "Test TRR - Security Review"
   - Description: "Comprehensive security assessment"
   - Project Name: "Cloud Migration"
4. Link to POV:
   - Select a POV from dropdown (optional)
5. Timeline & Assignment:
   - Due Date: 14 days from now
   - Assigned To: Auto-filled with current user
   - Priority: "High"
6. Review Scope:
   - Add scope item: "Review firewall rules"
   - Add technical req: "NIST compliance"
7. Click "Create TRR"

**Expected Result:**
- Form validates required fields
- Can link to existing POV
- User auto-populated in assigned field
- Array fields support add/remove
- TRR created successfully
- Redirected to /trr list
- New TRR appears in list

**Pass/Fail:** _____

---

### Test Suite 6: Relational Data

#### Test 6.1: TRR Linked to POV
**Objective:** Verify TRR-POV relationship

**Steps:**
1. Create a new TRR
2. Select a POV from "Link to POV" dropdown
3. Save TRR
4. Navigate to TRR detail page
5. Verify POV reference displays
6. Navigate to linked POV detail page
7. Verify TRR appears in POV context (if implemented)

**Expected Result:**
- TRR successfully linked to POV
- POV information accessible from TRR
- Bidirectional relationship maintained
- Can navigate between related records

**Pass/Fail:** _____

---

### Test Suite 7: Error Handling

#### Test 7.1: Network Error
**Objective:** Verify error handling when API fails

**Steps:**
1. Log in
2. Disable network connection or stop backend
3. Navigate to /pov
4. Observe behavior

**Expected Result:**
- Error alert displays
- "Failed to load POVs" message
- No crash or blank screen
- Retry option or fallback to cached data
- User can still navigate

**Pass/Fail:** _____

---

#### Test 7.2: Invalid Route
**Objective:** Verify 404 handling

**Steps:**
1. Navigate to /pov/invalid-id-12345
2. Observe behavior

**Expected Result:**
- Error message displays
- "POV not found" or similar
- Back button to return to list
- No application crash

**Pass/Fail:** _____

---

#### Test 7.3: Session Expiry
**Objective:** Verify behavior when session expires

**Steps:**
1. Log in
2. Wait for token to expire (or manually clear from localStorage)
3. Try to navigate to protected route

**Expected Result:**
- Redirected to /login
- Error message about expired session
- Can log in again
- Returns to intended page after login

**Pass/Fail:** _____

---

### Test Suite 8: Data Consistency

#### Test 8.1: User Session Isolation
**Objective:** Verify each user sees only their data

**Steps:**
1. Log in as user@test.com
2. Create a POV
3. Note POV appears in list
4. Sign out
5. Log in as manager@test.com
6. Navigate to /pov
7. Verify manager sees team/all POVs, not just user's POV

**Expected Result:**
- Regular users see only their own POVs (filtered by userId)
- Managers see team POVs
- Admins see all POVs
- No data leakage between users

**Pass/Fail:** _____

---

#### Test 8.2: Real-time Updates
**Objective:** Verify SWR keeps data fresh

**Steps:**
1. Log in and navigate to /pov
2. Open new browser tab
3. In new tab, create a POV
4. Return to first tab
5. Wait 30 seconds (SWR refresh interval)

**Expected Result:**
- New POV appears in first tab automatically
- No manual refresh needed
- Background revalidation works
- Loading state minimal

**Pass/Fail:** _____

---

## Performance Tests

### Test P.1: Initial Load Time
**Objective:** Measure page load performance

**Steps:**
1. Clear browser cache
2. Navigate to http://localhost:3000
3. Open DevTools Network tab
4. Measure time to interactive

**Expected Result:**
- Initial load < 3 seconds
- First contentful paint < 1 second
- Time to interactive < 2 seconds

**Result:** _____ seconds

---

### Test P.2: Navigation Speed
**Objective:** Measure client-side routing speed

**Steps:**
1. Log in
2. Click between Dashboard → POV → TRR → Dashboard
3. Measure transition times

**Expected Result:**
- Page transitions < 200ms
- No flash of unstyled content
- Smooth animations

**Result:** _____ ms average

---

## Accessibility Tests

### Test A.1: Keyboard Navigation
**Objective:** Verify full keyboard accessibility

**Steps:**
1. Navigate site using only Tab key
2. Verify can reach all interactive elements
3. Press Enter/Space to activate buttons
4. Test Escape to close modals/dropdowns

**Expected Result:**
- All elements keyboard accessible
- Focus indicators visible
- Logical tab order
- Keyboard shortcuts work

**Pass/Fail:** _____

---

### Test A.2: Screen Reader
**Objective:** Verify screen reader compatibility

**Steps:**
1. Enable screen reader (NVDA/JAWS/VoiceOver)
2. Navigate through pages
3. Verify all content announced
4. Check form labels and errors

**Expected Result:**
- All text content read aloud
- Form labels associated correctly
- Error messages announced
- Navigation structure clear

**Pass/Fail:** _____

---

## Browser Compatibility

### Test B.1: Chrome
**Browser:** Chrome (latest)
**Pass/Fail:** _____

### Test B.2: Firefox
**Browser:** Firefox (latest)
**Pass/Fail:** _____

### Test B.3: Safari
**Browser:** Safari (latest)
**Pass/Fail:** _____

### Test B.4: Edge
**Browser:** Edge (latest)
**Pass/Fail:** _____

### Test B.5: Mobile Chrome
**Device:** Android / Chrome
**Pass/Fail:** _____

### Test B.6: Mobile Safari
**Device:** iOS / Safari
**Pass/Fail:** _____

---

## Known Limitations

### Current Limitations
1. **Mock Data:** Backend API may return mock/sample data
2. **User Type Cast:** Using `as any` for user type in dashboard routing
3. **Email Verification:** Function exists but no UI flow implemented
4. **Real-time Updates:** 30-second polling, not WebSocket
5. **Offline Mode:** No offline functionality yet
6. **File Upload:** Storage endpoints exist but no UI implemented

### Not Tested
- Email verification flow (not implemented)
- User profile page (not implemented)
- Settings page (not implemented)
- Admin user management (not implemented)
- Bulk operations (not implemented)
- Data export (button exists, function not implemented)

---

## Bug Reporting Template

If you find a bug during testing, report it using this format:

```
**Bug ID:** BUG-001
**Severity:** High / Medium / Low
**Component:** Navigation / Dashboard / POV / TRR / Auth
**Test Case:** Test 1.2 - User Login
**Browser:** Chrome 120
**User Role:** user@test.com

**Description:**
[Clear description of the bug]

**Steps to Reproduce:**
1. Step one
2. Step two
3. Step three

**Expected Result:**
[What should happen]

**Actual Result:**
[What actually happened]

**Screenshots:**
[Attach if applicable]

**Console Errors:**
[Any errors from browser console]
```

---

## Test Summary Report

### Test Execution Summary
- **Date Tested:** __________
- **Tester:** __________
- **Environment:** Development / Staging / Production
- **Total Tests:** 27
- **Passed:** _____
- **Failed:** _____
- **Blocked:** _____
- **Pass Rate:** _____%

### Critical Issues Found
1.
2.
3.

### Recommended Actions
1.
2.
3.

### Sign-Off
- **Tester:** _________________ Date: _______
- **Reviewer:** _________________ Date: _______

---

**Document Version:** 1.0
**Last Updated:** October 13, 2025
**Next Review:** After bug fixes implemented
