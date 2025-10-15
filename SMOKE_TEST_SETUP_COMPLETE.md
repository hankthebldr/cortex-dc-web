# Smoke Test Setup - COMPLETE ✅

**Setup Date:** October 13, 2025
**Status:** Ready for Manual Testing

---

## Quick Summary

All automated setup steps have been completed successfully. The application is now ready for manual smoke testing.

---

## What's Running

```
✅ Firebase Emulator (Auth)    → http://localhost:9099
✅ Firebase Emulator (Firestore) → http://localhost:8080
✅ Firebase Emulator UI        → http://localhost:4040
✅ Next.js Dev Server          → http://localhost:3000
```

---

## Test Users Created

| Email | Password | Role | Purpose |
|-------|----------|------|---------|
| user@cortex | xsiam1 | admin | Test admin features, full access |
| user1@cortex | xsiam1 | user | Test regular user features |

**Note:** Password is "xsiam1" (6 characters to meet Firebase minimum)

---

## How to Start Testing

### 1. Open the Application
Navigate to: **http://localhost:3000**

### 2. Log In
Use either test account:
- **Admin:** user@cortex / xsiam1
- **User:** user1@cortex / xsiam1

### 3. Follow Test Guide
Open and follow: **`SMOKE_TEST_EXECUTION_REPORT.md`**

This file contains:
- ✅ Step-by-step test instructions
- ✅ Expected results for each test
- ✅ Pass/Fail checkboxes
- ✅ Bug reporting template
- ✅ All 20+ test cases ready to execute

### 4. View Emulator Data (Optional)
To see created users and data:
**http://localhost:4040** (Firebase Emulator UI)

---

## Files Created/Modified

### New Files
1. `/scripts/create-mock-users.ts` - Automated user creation script
2. `/apps/web/.env.local` - Emulator configuration
3. `/MOCK_USERS_SETUP.md` - User setup documentation
4. `/SMOKE_TEST_EXECUTION_REPORT.md` - **Main testing document**
5. `/SMOKE_TEST_SETUP_COMPLETE.md` - This file

### Modified Files
1. `/apps/web/package.json` - Removed `--turbopack` flag for compatibility

---

## Verification Checklist

Before starting manual tests, verify:

- [ ] Can access http://localhost:3000
- [ ] Login page loads
- [ ] Firebase Emulator UI accessible at http://localhost:4040
- [ ] No console errors on initial page load
- [ ] Can see 2 users in Emulator UI > Authentication

---

## Key Test Areas

### Priority 1 (Core Functionality)
- ✅ User authentication (login/logout)
- ✅ Navigation between pages
- ✅ Dashboard loading
- ✅ POV creation
- ✅ TRR creation
- ✅ POV-TRR linking

### Priority 2 (Features)
- Role-based navigation
- Search and filters
- Form validation
- Error handling
- Data persistence

### Priority 3 (Polish)
- Mobile responsive
- Loading states
- Empty states
- Performance
- Accessibility

---

## Expected Test Results

### Should Work ✅
- Login/logout
- Navigation
- Dashboard display (with empty states)
- POV creation wizard (4 steps)
- TRR creation form
- TRR → POV linking
- Search/filter UI
- Role-based navigation
- Mobile responsive menu

### Known Limitations ⚠️
- No real POV/TRR data initially (will show empty states)
- Google OAuth not configured (emulator only)
- Email verification flow not implemented
- Backend API mocked via emulator

### May Need Attention 🔧
- First POV/TRR creation (ensure it works)
- Data appears in lists after creation
- Navigation between related records
- Custom role claims working correctly

---

## Quick Troubleshooting

### Issue: Can't log in
**Solution:**
- Verify emulator is running: `curl http://localhost:9099`
- Check .env.local file exists in apps/web/
- Try clearing browser cache and cookies

### Issue: "Firebase not configured" error
**Solution:**
- Restart dev server
- Ensure NEXT_PUBLIC_USE_EMULATOR=true in .env.local

### Issue: POVs/TRRs not saving
**Solution:**
- Check Firestore emulator at http://localhost:4040/firestore
- Verify API_URL in .env.local points to localhost:8080
- Check browser console for errors

### Issue: Navigation not showing Admin link
**Solution:**
- Log out and log back in
- Check custom claims in Emulator UI > Authentication > user@cortex
- Should see: `{ "role": "admin" }`

---

## Stopping the Environment

When finished testing:

```bash
# Stop all services
# Press Ctrl+C in each terminal, or:

# Kill Firebase emulator
lsof -ti:9099 | xargs kill
lsof -ti:8080 | xargs kill

# Kill dev server
lsof -ti:3000 | xargs kill
```

---

## Next Testing Session

To restart testing environment:

```bash
# Terminal 1: Start Firebase emulator
firebase emulators:start --only auth,firestore

# Terminal 2: Start dev server
cd apps/web && pnpm dev

# Terminal 3: Recreate users (if needed)
FIREBASE_AUTH_EMULATOR_HOST=localhost:9099 \
npx tsx scripts/create-mock-users.ts
```

Users and data persist in the emulator between restarts unless you delete the emulator data directory.

---

## Test Execution Tracking

Track your progress in: **`SMOKE_TEST_EXECUTION_REPORT.md`**

Mark each test as:
- ⏳ Ready to test
- ✅ Pass
- ❌ Fail
- ⏭️ Blocked/Skipped

---

## Support & Documentation

### Related Documents
- `SMOKE_TEST_PLAN.md` - Original comprehensive test plan
- `SMOKE_TEST_EXECUTION_REPORT.md` - **Use this for testing**
- `PHASE_3_FRONTEND_COMPLETE.md` - Technical implementation details
- `MOCK_USERS_SETUP.md` - User creation options

### Architecture
- Frontend: Next.js 14 (apps/web)
- Auth: Firebase Authentication
- Database: Firestore (via emulator)
- Data Fetching: SWR with hooks
- Styling: Tailwind CSS + Custom components

---

## Success Criteria

Smoke testing is complete when:
- ✅ All Priority 1 tests pass
- ✅ All Priority 2 tests pass or issues documented
- ✅ At least 1 POV and 1 TRR successfully created
- ✅ POV-TRR linking verified
- ✅ No critical bugs found
- ✅ Role-based access working correctly

---

**Status:** 🟢 Ready for Manual Testing

**Test User Credentials:**
- Admin: user@cortex / xsiam1
- User: user1@cortex / xsiam1

**Application URL:** http://localhost:3000

**Start Testing:** Follow `SMOKE_TEST_EXECUTION_REPORT.md`

---

**Setup Completed:** October 13, 2025
**Version:** 1.0
