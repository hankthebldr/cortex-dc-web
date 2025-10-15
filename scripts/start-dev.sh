#!/bin/bash

# Cortex DC Web - Development Environment Startup Script
echo "🚀 Starting Cortex DC Web Development Environment..."

# Check if firebase-tools is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Installing..."
    npm install -g firebase-tools
fi

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm not found. Installing..."
    npm install -g pnpm
fi

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    pnpm install
fi

# Check Firebase authentication
echo "🔐 Checking Firebase authentication..."
if ! firebase projects:list &> /dev/null; then
    echo "❌ Not logged in to Firebase. Please run 'firebase login' first."
    exit 1
fi

# Set the active project
echo "🎯 Setting active Firebase project..."
firebase use cortex-dc-portal

# Create emulator data directory if it doesn't exist
mkdir -p emulator-data

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Check for port conflicts
echo "🔍 Checking for port conflicts..."
PORTS=(3000 4040 5000 5001 8080 9099 9199 9399)
CONFLICTS=()

for port in "${PORTS[@]}"; do
    if check_port $port; then
        CONFLICTS+=($port)
    fi
done

if [ ${#CONFLICTS[@]} -gt 0 ]; then
    echo "⚠️  Warning: The following ports are already in use: ${CONFLICTS[*]}"
    echo "   You may need to stop other services or change port configurations."
    read -p "   Continue anyway? (y/N): " -r
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Start Firebase emulators in background
echo "🔥 Starting Firebase emulators..."
firebase emulators:start --import=./emulator-data --export-on-exit &
EMULATOR_PID=$!

# Wait for emulators to be ready
echo "⏳ Waiting for emulators to start..."
sleep 10

# Check if emulator UI is accessible
if check_port 4040; then
    echo "✅ Firebase Emulator UI is ready at http://localhost:4040"
else
    echo "❌ Firebase emulators failed to start properly"
    kill $EMULATOR_PID 2>/dev/null
    exit 1
fi

# Start the web application
echo "🌐 Starting Next.js web application..."
cd apps/web && pnpm dev &
WEB_PID=$!

# Wait for web app to be ready
echo "⏳ Waiting for web application to start..."
sleep 5

if check_port 3000; then
    echo "✅ Web application is ready at http://localhost:3000"
else
    echo "❌ Web application failed to start"
    kill $EMULATOR_PID 2>/dev/null
    kill $WEB_PID 2>/dev/null
    exit 1
fi

echo ""
echo "🎉 Development environment is ready!"
echo ""
echo "📍 Available Services:"
echo "   🌐 Web Application:     http://localhost:3000"
echo "   🔥 Firebase Emulator UI: http://localhost:4040"
echo "   🔐 Auth Emulator:       http://localhost:9099"
echo "   🗄️  Firestore Emulator:  http://localhost:8080"
echo "   📦 Storage Emulator:    http://localhost:9199"
echo "   ⚡ Functions Emulator:  http://localhost:5001"
echo ""
echo "📝 To stop all services, press Ctrl+C or run: ./stop-dev.sh"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down development environment..."
    
    # Kill Firebase emulators
    if kill $EMULATOR_PID 2>/dev/null; then
        echo "✅ Firebase emulators stopped"
    fi
    
    # Kill web application
    if kill $WEB_PID 2>/dev/null; then
        echo "✅ Web application stopped"
    fi
    
    # Kill any remaining Firebase processes
    firebase emulators:kill 2>/dev/null || true
    
    echo "👋 Development environment stopped"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Wait for background processes
wait