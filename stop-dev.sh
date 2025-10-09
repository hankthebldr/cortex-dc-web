#!/bin/bash

echo "🛑 Stopping Cortex DC Web development environment..."

# Kill Firebase emulators
echo "🔥 Stopping Firebase emulators..."
firebase emulators:kill 2>/dev/null || echo "   No Firebase emulators found"

# Kill processes on development ports
PORTS=(3000 4040 5000 5001 8080 9099 9199 9399)

for port in "${PORTS[@]}"; do
    PID=$(lsof -ti:$port 2>/dev/null)
    if [ ! -z "$PID" ]; then
        echo "⚡ Stopping process on port $port (PID: $PID)"
        kill $PID 2>/dev/null
    fi
done

# Wait a moment for graceful shutdown
sleep 2

# Force kill any remaining processes
for port in "${PORTS[@]}"; do
    PID=$(lsof -ti:$port 2>/dev/null)
    if [ ! -z "$PID" ]; then
        echo "🔨 Force killing process on port $port (PID: $PID)"
        kill -9 $PID 2>/dev/null
    fi
done

echo "✅ Development environment stopped"