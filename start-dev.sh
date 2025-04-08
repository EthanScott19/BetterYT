#!/bin/bash

echo "Starting backend..."
cd backend
npx ts-node src/server.ts &
BACKEND_PID=$!

echo "Starting frontend..."
cd ../frontend
npm start &

# Trap to kill backend when you quit the script
trap "kill $BACKEND_PID" EXIT
wait
