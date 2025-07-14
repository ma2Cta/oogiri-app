#!/bin/bash
set -e

echo "Building application..."
npm run build

echo "Running database migrations..."
npm run db:push

echo "Build and migration completed successfully!"