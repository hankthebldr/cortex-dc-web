# Development Setup Guide

## Quick Start

To start local development with Firebase emulators:

### Option 1: Automated Setup (Recommended)

```bash
# Make sure you're in the project root
cd /Users/henry/Github/Github_desktop/cortex-dc-web

# Run the automated setup script
./start-dev.sh
```

This script will:
- ✅ Check and install required tools (firebase-tools, pnpm)
- 🔐 Verify Firebase authentication
- 📦 Install dependencies
- 🔍 Check for port conflicts
- 🔥 Start Firebase emulators
- 🌐 Start Next.js development server

### Option 2: Manual Setup

1. **Install Dependencies**:
   ```bash
   # Install Firebase CLI (if not already installed)
   npm install -g firebase-tools
   
   # Install pnpm (if not already installed)
   npm install -g pnpm
   
   # Install project dependencies
   pnpm install
   ```

2. **Firebase Authentication**:
   ```bash
   # Login to Firebase (if not already authenticated)
   firebase login
   
   # Set the active project
   firebase use cortex-dc-portal
   ```

3. **Start Development Environment**:
   ```bash
   # Start Firebase emulators (in one terminal)
   firebase emulators:start
   
   # Start Next.js web app (in another terminal)
   cd apps/web && pnpm dev
   ```

## Available Services

Once started, you'll have access to:

| Service | URL | Description |
|---------|-----|-------------|
| 🌐 **Web App** | http://localhost:3000 | Next.js development server |
| 🔥 **Emulator UI** | http://localhost:4040 | Firebase Emulator Suite dashboard |
| 🔐 **Auth** | http://localhost:9099 | Firebase Authentication emulator |
| 🗄️ **Firestore** | http://localhost:8080 | Firestore database emulator |
| 📦 **Storage** | http://localhost:9199 | Firebase Storage emulator |
| ⚡ **Functions** | http://localhost:5001 | Cloud Functions emulator |
| 🔗 **Data Connect** | http://localhost:9399 | Firebase Data Connect (PostgreSQL) |
| 🏠 **Hosting** | http://localhost:5000 | Firebase Hosting emulator |

## Development Workflow

### Editing Static Content

1. **Pages and Components**: Edit files in `apps/web/app/`
   - Changes automatically reload in the browser
   - TypeScript compilation happens on-the-fly

2. **Styles**: Modify `apps/web/app/globals.css` or component-level styles
   - Tailwind classes are processed automatically
   - Changes reflect immediately

3. **Configuration**: Update `next.config.ts`, `tailwind.config.js`
   - Some changes may require restarting the dev server

### Database Development

1. **Firestore**: 
   - View/edit data in Emulator UI (localhost:4040)
   - Data persists in `emulator-data/` directory
   - Schema defined in `packages/db/src/types/`

2. **Security Rules**:
   - Edit `firestore.rules` for Firestore rules
   - Edit `storage.rules` for Storage rules
   - Rules auto-reload in emulator

### Cloud Functions

1. **Development**:
   - Edit functions in `functions/src/`
   - Functions auto-reload when files change
   - View logs in terminal or Emulator UI

2. **Testing**:
   - Call functions via HTTP at localhost:5001
   - Test with Postman or curl
   - Debug with console.log statements

## Stopping the Environment

### Option 1: Using Script
```bash
./stop-dev.sh
```

### Option 2: Manual Stop
- Press `Ctrl+C` in each terminal
- Or run: `firebase emulators:kill`

## Troubleshooting

### Port Conflicts
If you get port conflict errors:
```bash
# Check what's using a port
lsof -i :3000

# Kill a specific port process
kill $(lsof -t -i:3000)
```

### Firebase Authentication Issues
```bash
# Re-login to Firebase
firebase logout
firebase login

# Check available projects
firebase projects:list

# Set correct project
firebase use cortex-dc-portal
```

### Clean Restart
```bash
# Stop everything
./stop-dev.sh

# Clean dependencies
rm -rf node_modules apps/web/node_modules packages/*/node_modules
pnpm install

# Restart
./start-dev.sh
```

### Emulator Data Reset
```bash
# Remove persisted emulator data
rm -rf emulator-data

# Restart emulators (they'll start fresh)
firebase emulators:start
```

## Development Tips

### Hot Reload
- **Frontend**: Changes in `apps/web/` auto-reload the browser
- **Functions**: Changes in `functions/src/` restart the function emulator
- **Rules**: Firestore/Storage rules reload automatically

### Debugging
- **Frontend**: Use browser dev tools
- **Functions**: Check terminal output or Emulator UI logs
- **Database**: Use Firestore emulator UI to inspect data

### Performance
- **Build Time**: Next.js with Turbopack is fast for development
- **Function Cold Start**: Local functions start instantly
- **Database Queries**: Emulator is fast but less optimized than production

## Production Deployment

When ready to deploy:

```bash
# Build the application
pnpm run build

# Deploy to Firebase
firebase deploy

# Or deploy specific services
firebase deploy --only hosting
firebase deploy --only functions
firebase deploy --only firestore:rules
```

## Project Structure

```
cortex-dc-web/
├── apps/web/           # Next.js web application
├── packages/           # Shared packages
│   ├── ui/            # UI component library
│   ├── db/            # Database types and utilities
│   └── ai/            # AI service abstractions
├── functions/         # Firebase Cloud Functions
├── emulator-data/     # Local emulator data (gitignored)
├── firebase.json      # Firebase configuration
└── start-dev.sh       # Development startup script
```

## Need Help?

1. **Check the logs**: Terminal output usually shows the issue
2. **Emulator UI**: Visit localhost:4040 for visual debugging
3. **Clean restart**: Use the clean restart steps above
4. **Port conflicts**: Check the troubleshooting section

Happy coding! 🚀