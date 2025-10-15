#!/bin/bash
# Quick start script for local development

set -e

echo "🚀 Cortex DC Web - Local Development Startup"
echo "============================================="
echo ""

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm is not installed. Please install it first:"
    echo "   npm install -g pnpm"
    exit 1
fi

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Ask user which mode
echo "Select deployment mode:"
echo "1) Firebase Emulators (Recommended for quick start)"
echo "2) Self-Hosted Stack (Full system with PostgreSQL, Keycloak, MinIO)"
echo ""
read -p "Enter choice (1 or 2): " choice

if [ "$choice" == "1" ]; then
    echo ""
    echo "🔥 Starting Firebase Emulators mode..."
    echo ""

    # Check if Firebase CLI is installed
    if ! command -v firebase &> /dev/null; then
        echo "❌ Firebase CLI is not installed. Installing..."
        npm install -g firebase-tools
    fi

    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        echo "📦 Installing dependencies..."
        pnpm install
    fi

    # Create .env.local for Firebase mode
    cat > .env.local << EOF
# Firebase Emulator Mode
DEPLOYMENT_MODE=firebase
FIREBASE_AUTH_EMULATOR_HOST=localhost:9099
FIRESTORE_EMULATOR_HOST=localhost:8080
FIREBASE_STORAGE_EMULATOR_HOST=localhost:9199
NEXT_PUBLIC_API_URL=http://localhost:3000
EOF

    echo "✅ Environment configured for Firebase mode"
    echo ""

    # Check if emulators are already running
    if check_port 4040; then
        echo "⚠️  Firebase emulators already running on port 4040"
    else
        echo "Starting Firebase emulators..."
        echo "Opening new terminal window for emulators..."

        # Start emulators in background
        pnpm run emulators > emulators.log 2>&1 &
        EMULATOR_PID=$!

        echo "Waiting for emulators to start..."
        sleep 5

        if check_port 4040; then
            echo "✅ Firebase emulators started (PID: $EMULATOR_PID)"
            echo "   Emulator UI: http://localhost:4040"
        else
            echo "❌ Failed to start emulators. Check emulators.log for errors."
            exit 1
        fi
    fi

    echo ""
    echo "🌐 Starting Next.js web app..."
    echo ""

    # Check if port 3000 is available
    if check_port 3000; then
        echo "⚠️  Port 3000 is already in use. Please stop the existing process or use a different port."
        exit 1
    fi

    # Start Next.js
    pnpm run dev:web

elif [ "$choice" == "2" ]; then
    echo ""
    echo "🐳 Starting Self-Hosted Stack..."
    echo ""

    # Check if Docker is running
    if ! docker info > /dev/null 2>&1; then
        echo "❌ Docker is not running. Please start Docker Desktop."
        exit 1
    fi

    # Check if docker-compose is available
    if ! command -v docker-compose &> /dev/null; then
        echo "❌ docker-compose is not installed."
        exit 1
    fi

    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        echo "📦 Installing dependencies..."
        pnpm install
    fi

    # Create .env.local for self-hosted mode
    cat > .env.local << EOF
# Self-Hosted Mode
DEPLOYMENT_MODE=self-hosted
DATABASE_URL=postgresql://cortex:cortex_secure_password@localhost:5432/cortex
NEXT_PUBLIC_KEYCLOAK_URL=http://localhost:8180
NEXT_PUBLIC_KEYCLOAK_REALM=cortex
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=cortex-web
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin_password
REDIS_URL=redis://:redis_password@localhost:6379
NATS_URL=nats://localhost:4222
NEXT_PUBLIC_API_URL=http://localhost:3000
EOF

    echo "✅ Environment configured for self-hosted mode"
    echo ""

    # Start docker-compose services
    echo "Starting infrastructure services..."
    docker-compose up -d postgres keycloak minio redis nats

    echo ""
    echo "⏳ Waiting for services to be healthy..."
    sleep 10

    # Check service health
    echo ""
    echo "Service status:"
    docker-compose ps

    echo ""
    echo "🌐 Starting Next.js web app..."
    echo ""

    # Check if port 3000 is available
    if check_port 3000; then
        echo "⚠️  Port 3000 is already in use. Please stop the existing process."
        exit 1
    fi

    # Start Next.js
    pnpm run dev:web

else
    echo "❌ Invalid choice. Please run the script again and select 1 or 2."
    exit 1
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Access points:"
echo "  Web App: http://localhost:3000"

if [ "$choice" == "1" ]; then
    echo "  Firebase Emulator UI: http://localhost:4040"
    echo "  Firestore: localhost:8080"
    echo "  Auth: localhost:9099"
elif [ "$choice" == "2" ]; then
    echo "  PostgreSQL: localhost:5432"
    echo "  Keycloak: http://localhost:8180"
    echo "  MinIO Console: http://localhost:9001"
    echo "  Redis: localhost:6379"
    echo "  NATS: localhost:4222"
fi

echo ""
echo "📚 Documentation:"
echo "  - Architecture: ARCHITECTURE_DOCUMENTATION.md"
echo "  - Testing Guide: LOCAL_TESTING_GUIDE.md"
echo "  - Project Info: CLAUDE.md"
echo ""
