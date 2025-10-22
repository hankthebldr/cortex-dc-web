# Quick Sync Reference

**Last Stable Commit**: `41ea0fa` (Oct 15, 2025 04:24:11)
**Status**: Work moved to henryred.ai due to build instability

---

## ⚡ Quick Facts

### What's Working in cortex-dc-web
✅ Local development with Firebase emulators
✅ Next.js 14 app running on http://localhost:3000
✅ All Firebase services (Auth, Firestore, Functions, Storage)
✅ API routes with proper error handling
✅ Database using Firebase adapter (not PostgreSQL)

### What Was Fixed Today (Oct 15, 2025)
🔧 Changed `DATABASE_TYPE` from `postgres` to `firestore`
🔧 Removed Firebase extensions from firebase.json
🔧 Updated .env.local with explicit deployment mode
🔧 Resolved port conflicts (8080, 5000)
🔧 Fixed 500 error on /api/auth/me endpoint

### Key Files Modified (Not Committed)
```
M .gitignore
M firebase.json
M package.json
M apps/web/.env.local

New:
+ DEPLOYMENT_GUIDE.md
+ KUBERNETES_GUIDE.md
+ LOCAL_TEST_REPORT.md
+ REPOSITORY_SYNC_TRACKING.md (this file)
+ apps/web/app/dashboard/page.tsx
```

---

## 🎯 When Resuming cortex-dc-web

### 1. Quick Health Check
```bash
# Verify current state
git status
git log -1

# Check if build works
pnpm install
pnpm --filter @cortex-dc/web dev

# Verify Firebase emulators
firebase emulators:start --only auth,firestore,storage,functions
```

### 2. Features to Sync from henryred.ai
Check `REPOSITORY_SYNC_TRACKING.md` for the complete list of features added to henryred.ai.

### 3. Critical Environment Variables
```bash
# .env.local MUST have:
DEPLOYMENT_MODE=firebase
NEXT_PUBLIC_DEPLOYMENT_MODE=firebase
DATABASE_TYPE=firestore
FIRESTORE_PROJECT_ID=cortex-dc-portal
NEXT_PUBLIC_USE_EMULATOR=true
```

### 4. Known Issues to Avoid
- ❌ Don't use `DATABASE_TYPE=postgres` without running `prisma generate`
- ❌ Don't include Firebase extensions in firebase.json for local dev
- ❌ Don't forget to kill processes on ports 8080, 5000, 9099
- ❌ Don't commit .env.local files

---

## 📦 Feature Tracking Template

When adding features to henryred.ai, document them like this:

```markdown
### [Date] - [Feature Name]
**Commit**: [hash]
**Files**:
- path/to/file.ts
- path/to/component.tsx

**Changes**:
- Brief description
- Why it was needed
- Any breaking changes

**Sync Priority**: [HIGH/MEDIUM/LOW]
```

---

## 🔄 Sync Process (When Ready)

1. **Create sync branch**
   ```bash
   git checkout -b sync/henryred-ai-features
   ```

2. **Review tracking doc**
   - Open REPOSITORY_SYNC_TRACKING.md
   - Note all features added to henryred.ai

3. **Copy features one-by-one**
   - Start with HIGH priority
   - Test after each feature
   - Commit frequently

4. **Verify everything**
   ```bash
   pnpm install
   pnpm test
   pnpm build:local
   ```

5. **Create PR**
   ```bash
   gh pr create --title "Sync features from henryred.ai" --body "See REPOSITORY_SYNC_TRACKING.md"
   ```

---

## 🆘 Emergency Contacts

If build breaks again:
1. Check DATABASE_TYPE in .env.local
2. Verify Firebase emulators are running
3. Check for port conflicts: `lsof -i :8080 -i :9099 -i :5000`
4. Read error logs in BashOutput
5. Refer to LOCAL_TEST_REPORT.md

---

**Created**: October 15, 2025
**Last Updated**: October 15, 2025
**Maintained By**: Claude Code / Henry Reed
