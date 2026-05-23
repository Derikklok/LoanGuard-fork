#!/bin/bash

# LoanGuard Development Server Launcher
# Starts both backend (FastAPI) and frontend (React) servers
# Press Ctrl+C to stop both gracefully

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$PROJECT_ROOT/backend"
FRONTEND_DIR="$PROJECT_ROOT/frontend"

echo "🚀 Starting LoanGuard development environment..."
echo "   Backend:  $BACKEND_DIR"
echo "   Frontend: $FRONTEND_DIR"
echo ""
echo "Press Ctrl+C to stop both servers gracefully"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Function to cleanup and kill both processes
cleanup() {
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🛑 Stopping servers..."
    
    # Kill background processes
    if [ ! -z "$BACKEND_PID" ]; then
        echo "   Stopping backend (PID: $BACKEND_PID)..."
        kill $BACKEND_PID 2>/dev/null || true
        wait $BACKEND_PID 2>/dev/null || true
    fi
    
    if [ ! -z "$FRONTEND_PID" ]; then
        echo "   Stopping frontend (PID: $FRONTEND_PID)..."
        kill $FRONTEND_PID 2>/dev/null || true
        wait $FRONTEND_PID 2>/dev/null || true
    fi
    
    echo "✅ Both servers stopped"
    exit 0
}

# Set trap to catch Ctrl+C and other termination signals
trap cleanup SIGINT SIGTERM

# Start backend server
echo "🔵 Starting FastAPI backend..."
cd "$BACKEND_DIR"
uv run --project . python -m uvicorn main:app --reload &
BACKEND_PID=$!
echo "   Backend PID: $BACKEND_PID"
sleep 2

# Start frontend server
echo "⚪ Starting React frontend..."
cd "$FRONTEND_DIR"
npm run dev &
FRONTEND_PID=$!
echo "   Frontend PID: $FRONTEND_PID"
sleep 2

echo ""
echo "✨ LoanGuard is running!"
echo "   📱 Frontend: http://localhost:5173"
echo "   🔌 Backend:  http://localhost:8000"
echo "   📚 API Docs: http://localhost:8000/docs"
echo ""

# Wait for all background processes
wait